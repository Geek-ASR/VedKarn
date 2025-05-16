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

const evaluateMentorFit = ai.defineTool({
  name: 'evaluateMentorFit',
  description: 'Evaluates how well a mentor fits a mentee based on their profiles and interests, returning a relevance score between 0 and 1, and a reason for the score.',
  inputSchema: z.object({
    menteeProfile: z.string().describe('The profile of the mentee.'),
    mentorProfile: z.string().describe('The profile of the mentor.'),
  }),
  outputSchema: z.object({
    relevanceScore: z.number().describe('A score indicating the relevance of the mentor to the mentee (0-1).'),
    reason: z.string().describe('The reason why the mentor is a good match for the mentee.'),
  }),
  async (input) => {
    // This tool's implementation will be provided separately and will return the relevance score and reason.
    // For now, return a placeholder.
    return {relevanceScore: 0.5, reason: 'This is a placeholder reason.'};
  },
});

const suggestMentorsPrompt = ai.definePrompt({
  name: 'suggestMentorsPrompt',
  input: {schema: SuggestMentorsInputSchema},
  output: {schema: SuggestMentorsOutputSchema},
  tools: [evaluateMentorFit],
  prompt: `For each mentor profile in the list, evaluate its fit for the mentee using the evaluateMentorFit tool. Return a list of mentor profiles with their relevance scores and reasons. Mentee Profile: {{{menteeProfile}}}. Mentor Profiles: {{{mentorProfiles}}}`,
});

const suggestMentorsFlow = ai.defineFlow(
  {
    name: 'suggestMentorsFlow',
    inputSchema: SuggestMentorsInputSchema,
    outputSchema: SuggestMentorsOutputSchema,
  },
  async input => {
    const mentorSuggestions: SuggestMentorsOutput = [];

    for (const mentorProfile of input.mentorProfiles) {
      const {relevanceScore, reason} = await evaluateMentorFit({
        menteeProfile: input.menteeProfile,
        mentorProfile: mentorProfile,
      });

      mentorSuggestions.push({
        mentorProfile: mentorProfile,
        relevanceScore: relevanceScore,
        reason: reason,
      });
    }
    return mentorSuggestions;
  }
);
