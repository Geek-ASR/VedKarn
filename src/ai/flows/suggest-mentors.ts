
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
  menteeProfile: z.string().describe('The profile of the mentee, including their background, interests, goals, seekingMentorshipFor, targetDegreeLevel, desiredUniversities, targetFieldsOfStudy.'),
  mentorProfiles: z.array(z.string()).describe('A list of mentor profiles to consider, including their mentorshipFocus, targetDegreeLevels, guidedUniversities, applicationExpertise.'),
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

// Helper function to parse focus from a string (crude for mock)
const parseFocus = (profileString: string, fieldKey: string): string[] => {
    const match = profileString.match(new RegExp(`${fieldKey}: (.*?)(?:, [A-Z]|$)`));
    return match && match[1] ? match[1].split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [];
}

const evaluateMentorFit = ai.defineTool(
  { 
    name: 'evaluateMentorFit',
    description: 'Evaluates how well a mentor fits a mentee based on their profiles and interests, returning a relevance score between 0 and 1, and a reason for the score. Considers mentorship focus (career vs. university).',
    inputSchema: z.object({
      menteeProfile: z.string().describe('The profile of the mentee, including their seekingMentorshipFor details.'),
      mentorProfile: z.string().describe('The profile of the mentor, including their mentorshipFocus details.'),
    }),
    outputSchema: z.object({
      relevanceScore: z.number().describe('A score indicating the relevance of the mentor to the mentee (0-1).'),
      reason: z.string().describe('The reason why the mentor is a good match for the mentee.'),
    }),
  },  
  async (input) => { 
    let score = 0.5;
    let reason = `Initial assessment for mentor (profile starting: ${input.mentorProfile.substring(0,30)}...) and mentee (profile starting: ${input.menteeProfile.substring(0,30)}...).`;

    const mentorFocusAreas = parseFocus(input.mentorProfile, "Mentorship Focus");
    const menteeSeekingFocusAreas = parseFocus(input.menteeProfile, "Seeking Mentorship For");
    
    let focusMatch = false;
    let matchingFocus = "";

    for (const menteeFocus of menteeSeekingFocusAreas) {
        if (mentorFocusAreas.includes(menteeFocus)) {
            focusMatch = true;
            matchingFocus = menteeFocus;
            break; 
        }
    }

    if (focusMatch) {
      score += 0.3; // Significant boost for matching primary focus
      reason += ` Strong match on mentorship focus: ${matchingFocus}.`;
    } else if (mentorFocusAreas.length > 0 && menteeSeekingFocusAreas.length > 0) {
      score -= 0.1; // Slight penalty if focuses are specified but don't align
      reason += ` Mentorship focuses do not directly align (Mentor: ${mentorFocusAreas.join('/')}, Mentee: ${menteeSeekingFocusAreas.join('/')}).`;
    }


    if (input.mentorProfile.toLowerCase().includes("ai") && input.menteeProfile.toLowerCase().includes("ai")) {
      score += 0.1;
      reason += " Shared interest in AI.";
    }
    if (input.mentorProfile.toLowerCase().includes("stanford") && input.menteeProfile.toLowerCase().includes("stanford")) {
      score += 0.05;
       reason += " Shared Stanford connection.";
    }
     if (input.mentorProfile.length > input.menteeProfile.length && input.mentorProfile.length > 100) { // Example: longer mentor bio might imply more detail
        score += 0.05;
    }

    // University specific matching (simplified for mock)
    if (matchingFocus === 'university') {
        const menteeTargetDegree = (input.menteeProfile.match(/Target Degree Level: (.*?)(?:,|$)/) || [])[1]?.trim().toLowerCase();
        const mentorTargetDegrees = parseFocus(input.mentorProfile, "Target Degree Levels");
        
        if (menteeTargetDegree && mentorTargetDegrees.map(d => d.toLowerCase()).includes(menteeTargetDegree)) {
            score += 0.1;
            reason += ` Matches target degree level (${menteeTargetDegree}).`;
        }
    }
    
    score = Math.max(0, Math.min(1, score)); 

    return {
        relevanceScore: parseFloat(score.toFixed(2)), 
        reason: reason.trim(),
    };
  }
);

const suggestMentorsPrompt = ai.definePrompt({
  name: 'suggestMentorsPrompt',
  input: {schema: SuggestMentorsInputSchema},
  output: {schema: SuggestMentorsOutputSchema},
  tools: [evaluateMentorFit],
  prompt: `You are an AI assistant helping a mentee find suitable mentors.
The mentee's profile is: {{{menteeProfile}}}

For each mentor profile provided in the list below, you MUST use the 'evaluateMentorFit' tool to assess their compatibility with the mentee.
The tool will consider factors like shared interests, experience, and crucially, alignment in 'mentorshipFocus' (e.g., career guidance vs. university admissions guidance) and specific university/degree expertise if applicable.

List of mentor profiles to evaluate:
{{#each mentorProfiles}}
- Mentor Profile Snippet: {{{this}}}
{{/each}}

Return a list of all evaluated mentors. For each mentor, include their original profile string, the relevance score, and the reason provided by the 'evaluateMentorFit' tool.
Do not invent mentors or scores. Only use the 'evaluateMentorFit' tool for each mentor profile in the provided list.
`,
});


const suggestMentorsFlow = ai.defineFlow(
  {
    name: 'suggestMentorsFlow',
    inputSchema: SuggestMentorsInputSchema,
    outputSchema: SuggestMentorsOutputSchema,
  },
  async (input: SuggestMentorsInput) => {
    console.log("DEBUG: suggestMentorsFlow called. Mentee profile snippet:", input.menteeProfile.substring(0,100));
    console.log("DEBUG: Number of mentor profiles to evaluate:", input.mentorProfiles.length);

    if (input.mentorProfiles.length === 0) {
        console.warn("DEBUG: suggestMentorsFlow received no mentor profiles to evaluate.");
        return [];
    }

    try {
        const llmResponse = await suggestMentorsPrompt(input);
        
        if (llmResponse.output) {
          console.log("DEBUG: suggestMentorsFlow LLM output count:", llmResponse.output.length);
          // Further validation can be added here if needed, e.g., ensuring scores are within range.
          // For now, assume the LLM and tool adhere to the output schema.
          return llmResponse.output.sort((a, b) => b.relevanceScore - a.relevanceScore);
        } else {
          console.warn("DEBUG: suggestMentorsFlow LLM did not return an output. Input:", input.menteeProfile.substring(0,100));
          return [];
        }
    } catch (error) {
        console.error("DEBUG: Error in suggestMentorsFlow during LLM call or processing:", error);
        // Fallback: Manually iterate and call the tool if direct LLM output fails (though less ideal)
        // This is more of a safeguard for unexpected LLM failures with the prompt.
        const mentorSuggestions: SuggestMentorsOutput = [];
        for (const mentorProfile of input.mentorProfiles) {
            try {
            const evaluation = await evaluateMentorFit({ 
                menteeProfile: input.menteeProfile,
                mentorProfile: mentorProfile,
            });
            mentorSuggestions.push({
                mentorProfile: mentorProfile,
                relevanceScore: evaluation.relevanceScore,
                reason: evaluation.reason,
            });
            } catch (toolError) {
            console.error(`DEBUG: Error evaluating mentor (fallback) ${mentorProfile.substring(0,30)}... with tool:`, toolError);
            mentorSuggestions.push({
                mentorProfile: mentorProfile,
                relevanceScore: 0,
                reason: "Failed to evaluate this mentor using the tool during fallback.",
            });
            }
        }
        return mentorSuggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
  }
);

