
'use server';
/**
 * @fileOverview AI-powered group session suggestion flow.
 * This flow now dynamically selects group sessions using an LLM.
 *
 * - suggestGroupSessions - A function that suggests group sessions based on mentee profile.
 * - SuggestGroupSessionsInput - The input type for the suggestGroupSessions function.
 * - SuggestGroupSessionsOutput - The return type for the suggestGroupSessions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { GroupSession } from '@/lib/types'; 
import { getAllGroupSessions } from '@/context/auth-context'; 

const SuggestGroupSessionsInputSchema = z.object({
  menteeProfile: z.string().describe('The profile of the mentee, including their background, interests, and goals.'),
});
export type SuggestGroupSessionsInput = z.infer<typeof SuggestGroupSessionsInputSchema>;

// Define a Zod schema for the GroupSession type (for input to the LLM)
const GroupSessionZodSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  hostId: z.string(),
  hostName: z.string(),
  hostProfileImageUrl: z.string().optional().nullable(),
  date: z.string(),
  tags: z.array(z.string()),
  imageUrl: z.string().url().optional().nullable(), // Expect valid URLs from input data
  participantCount: z.number().optional().nullable(),
  maxParticipants: z.number().optional().nullable(),
  price: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
});

// Schema for the AI's output
const SuggestedSessionSchema = z.object({
    id: z.string().describe("The unique ID of the original group session."),
    title: z.string().describe('The title of the group session.'),
    description: z.string().describe('A brief description of what the group session is about.'),
    hostName: z.string().describe('The name of the host or mentor leading the session.'),
    date: z.string().describe('The date and time of the session (e.g., "October 26th, 2024 at 2:00 PM").'),
    tags: z.array(z.string()).describe('Relevant tags or keywords for the session.'),
    imageUrl: z.string().optional().nullable().describe('A URL for a relevant image for the session card. Can be a placeholder string if a URL is not suitable.'), // Relaxed from .url()
    price: z.string().optional().nullable().describe('Price of the session (e.g., "Free", "$20").'),
  });

const SuggestGroupSessionsOutputSchema = z.array(SuggestedSessionSchema);
export type SuggestGroupSessionsOutput = z.infer<typeof SuggestGroupSessionsOutputSchema>;


export async function suggestGroupSessions(input: SuggestGroupSessionsInput): Promise<SuggestGroupSessionsOutput> {
  const allSessions = await getAllGroupSessions();
  if (!allSessions || allSessions.length === 0) {
    console.log("No group sessions available in the system to suggest from.");
    return [];
  }
  
  const validatedInputSessions = allSessions.map(session => {
    const parseResult = GroupSessionZodSchema.safeParse(session);
    if (parseResult.success) {
      return parseResult.data;
    } else {
      console.warn(`Session with ID ${session.id} failed validation, excluding from AI suggestions:`, parseResult.error.flatten());
      return null;
    }
  }).filter((session): session is z.infer<typeof GroupSessionZodSchema> => session !== null);

  if (validatedInputSessions.length === 0) {
    console.log("No valid group sessions after validation to suggest from.");
    return [];
  }

  return suggestGroupSessionsFlow({ menteeProfile: input.menteeProfile, availableSessions: validatedInputSessions });
}

const recommendationPrompt = ai.definePrompt({
  name: 'recommendGroupSessionsPrompt',
  input: { 
    schema: z.object({
      menteeProfile: SuggestGroupSessionsInputSchema.shape.menteeProfile,
      availableSessions: z.array(GroupSessionZodSchema) 
    })
  },
  output: { schema: SuggestGroupSessionsOutputSchema },
  prompt: `You are an expert academic and career advisor.
Your task is to recommend up to 3 group sessions for a mentee based on their profile and a list of available sessions.

Mentee Profile:
{{{menteeProfile}}}

Available Group Sessions:
{{#if availableSessions.length}}
{{#each availableSessions}}
- Session ID: {{this.id}}
  Title: {{this.title}}
  Description: {{this.description}}
  Hosted by: {{this.hostName}}
  Date: {{this.date}}
  Tags: {{#if this.tags}}{{#each this.tags}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}N/A{{/if}}
  Price: {{this.price}}
  Image URL: {{this.imageUrl}} (You may suggest this URL or a generic placeholder if more appropriate)
{{/each}}
{{else}}
No group sessions are currently available.
{{/if}}

Based on the mentee's profile and the available sessions, select up to 3 sessions that you believe would be most beneficial.
For each recommended session, provide its original ID, title, description, hostName, date, tags, imageUrl (can be the original URL or a placeholder string like 'placeholder_image.png' if a specific image is not suitable or available), and price.
Ensure your output strictly adheres to the requested JSON format. If no sessions are suitable, return an empty array.
`,
});

const suggestGroupSessionsFlow = ai.defineFlow(
  {
    name: 'suggestGroupSessionsFlow',
    inputSchema: z.object({ 
      menteeProfile: SuggestGroupSessionsInputSchema.shape.menteeProfile,
      availableSessions: z.array(GroupSessionZodSchema)
    }),
    outputSchema: SuggestGroupSessionsOutputSchema,
  },
  async ({ menteeProfile, availableSessions }) => {
    if (!availableSessions || availableSessions.length === 0) {
      return [];
    }
    
    try {
        const { output } = await recommendationPrompt({ menteeProfile, availableSessions });
        // Ensure output is an array even if the LLM returns null or undefined
        if (Array.isArray(output)) {
          return output;
        } else if (output) {
          // If the LLM returns a single object instead of an array (less likely with current prompt but defensive)
          console.warn("recommendGroupSessionsPrompt returned a single object, expected array. Wrapping it.", output);
          return [output as z.infer<typeof SuggestedSessionSchema>]; // Type assertion
        }
        return []; // Default to empty array if output is nullish
    } catch (error) {
        console.error("Error in recommendGroupSessionsPrompt or its processing:", error);
        return []; // Return empty array on error to allow UI to settle
    }
  }
);

