
// src/ai/flows/suggest-mentors.ts
'use server';
/**
 * @fileOverview AI-powered mentor suggestion flow.
 *
 * - suggestMentors - A function that suggests mentors based on mentee profile and interests.
 * - SuggestMentorsInput - The input type for the suggestMentors function.
 * - SuggestMentorsOutput - The output type for the suggestMentors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMentorsInputSchema = z.object({
  menteeProfile: z.string().describe('The profile of the mentee, including their background, interests, and goals.'),
  mentorProfiles: z.array(z.string()).describe('A list of mentor profiles to consider.'),
});
export type SuggestMentorsInput = z.infer<typeof SuggestMentorsInputSchema>;

const SuggestMentorsOutputSchema = z.array(
  z.object({
    mentorProfile: z.string().describe('The profile of the suggested mentor.'),
    relevanceScore: z.number().describe('A score indicating the relevance of the mentor to the mentee (0-1).'),
    reason: z.string().describe('The reason why the mentor is a good match for the mentee.'),
  })
);
export type SuggestMentorsOutput = z.infer<typeof SuggestMentorsOutputSchema>;

export async function suggestMentors(input: SuggestMentorsInput): Promise<SuggestMentorsOutput> {
  return suggestMentorsFlow(input);
}

const evaluateMentorFit = ai.defineTool(
  { // First argument: configuration object
    name: 'evaluateMentorFit',
    description: 'Evaluates how well a mentor fits a mentee based on their profiles and interests, returning a relevance score between 0 and 1, and a reason for the score.',
    inputSchema: z.object({
      menteeProfile: z.string().describe('The profile of the mentee.'),
      mentorProfile: z.string().describe('The profile of the mentor.'),
    }),
    outputSchema: z.object({
      relevanceScore: z.number().describe('A score indicating the relevance of the mentor to the mentee (0-1).'),
      reason: z.string().describe('The reason why the mentor is a good match for the mentee.'),
    }), // Configuration object ends here
  },  // Comma separating the first and second arguments
  async (input) => { // Second argument: implementation function
    // This tool's implementation will be provided separately and will return the relevance score and reason.
    // For now, return a placeholder.
    // In a real scenario, this would involve an LLM call or complex logic.
    // For this mock, let's simulate some variability based on profile content.
    let score = 0.5;
    if (input.mentorProfile.toLowerCase().includes("ai") && input.menteeProfile.toLowerCase().includes("ai")) {
      score += 0.2;
    }
    if (input.mentorProfile.toLowerCase().includes("stanford") && input.menteeProfile.toLowerCase().includes("stanford")) {
      score += 0.15;
    }
    if (input.mentorProfile.length > input.menteeProfile.length) {
        score += 0.05;
    } else {
        score -= 0.05;
    }
    score = Math.max(0, Math.min(1, score)); // Clamp score between 0 and 1

    return {
        relevanceScore: parseFloat(score.toFixed(2)), 
        reason: `Placeholder reason based on profile similarity. Mentor: ${input.mentorProfile.substring(0,30)}..., Mentee: ${input.menteeProfile.substring(0,30)}...`
    };
  }
);

const suggestMentorsPrompt = ai.definePrompt({
  name: 'suggestMentorsPrompt',
  input: {schema: SuggestMentorsInputSchema},
  output: {schema: SuggestMentorsOutputSchema},
  tools: [evaluateMentorFit],
  prompt: `You are an AI assistant helping a mentee find suitable mentors.
For each mentor profile provided in the list, you MUST use the 'evaluateMentorFit' tool to assess their compatibility with the mentee.
The mentee's profile is: {{{menteeProfile}}}
The list of mentor profiles to evaluate is:
{{#each mentorProfiles}}
- {{{this}}}
{{/each}}
Return a list of all evaluated mentors, including their original profile string, the relevance score, and the reason provided by the tool.
Do not invent mentors or scores. Only use the 'evaluateMentorFit' tool for each mentor.
`,
});


const suggestMentorsFlow = ai.defineFlow(
  {
    name: 'suggestMentorsFlow',
    inputSchema: SuggestMentorsInputSchema,
    outputSchema: SuggestMentorsOutputSchema,
  },
  async (input: SuggestMentorsInput) => {
    // The prompt is now instructed to use the tool for each mentor.
    // The LLM will call the tool multiple times.
    const llmResponse = await suggestMentorsPrompt(input);
    
    // The output schema for the prompt is SuggestMentorsOutputSchema,
    // which expects an array of { mentorProfile, relevanceScore, reason }.
    // The LLM, guided by the prompt and the tool's output schema, should structure its response accordingly.

    if (llmResponse.output) {
      return llmResponse.output;
    } else {
      // Handle cases where the LLM might not return the expected output or no tools were called.
      // This might happen if the prompt is not clear enough or the LLM decides not to use the tool.
      console.warn("LLM did not return the expected output structure for suggestMentorsFlow. Input:", input);
      // Fallback: Manually iterate and call the tool if direct LLM output is not as expected.
      // This part is a safeguard, ideally the prompt should make the LLM call the tool.
      const mentorSuggestions: SuggestMentorsOutput = [];
      for (const mentorProfile of input.mentorProfiles) {
        try {
          const evaluation = await evaluateMentorFit({ // Direct tool call as fallback
            menteeProfile: input.menteeProfile,
            mentorProfile: mentorProfile,
          });
          mentorSuggestions.push({
            mentorProfile: mentorProfile,
            relevanceScore: evaluation.relevanceScore,
            reason: evaluation.reason,
          });
        } catch (toolError) {
          console.error(`Error evaluating mentor ${mentorProfile} with tool:`, toolError);
          // Optionally, add a default/error entry or skip
           mentorSuggestions.push({
            mentorProfile: mentorProfile,
            relevanceScore: 0,
            reason: "Failed to evaluate this mentor using the tool.",
          });
        }
      }
      // Sort by relevance if manually processed
      return mentorSuggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
  }
);

