
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
// No longer need FullGroupSessionType specifically here if GroupSessionZodSchema covers it
import type { GroupSession } from '@/lib/types'; 
import { getAllGroupSessions } from '@/context/auth-context'; 

const SuggestGroupSessionsInputSchema = z.object({
  menteeProfile: z.string().describe('The profile of the mentee, including their background, interests, and goals.'),
});
export type SuggestGroupSessionsInput = z.infer<typeof SuggestGroupSessionsInputSchema>;

// Define a Zod schema for the GroupSession type
const GroupSessionZodSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  hostId: z.string(),
  hostName: z.string(),
  hostProfileImageUrl: z.string().optional().nullable(), // Match type
  date: z.string(),
  tags: z.array(z.string()),
  imageUrl: z.string().optional().nullable(), // Match type
  participantCount: z.number().optional().nullable(), // Match type
  maxParticipants: z.number().optional().nullable(), // Match type
  price: z.string().optional().nullable(), // Match type
  duration: z.string().optional().nullable(), // Match type
});

const SuggestedSessionSchema = z.object({
    id: z.string().describe("The unique ID of the original group session."),
    title: z.string().describe('The title of the group session.'),
    description: z.string().describe('A brief description of what the group session is about.'),
    hostName: z.string().describe('The name of the host or mentor leading the session.'),
    date: z.string().describe('The date and time of the session (e.g., "October 26th, 2024 at 2:00 PM").'),
    tags: z.array(z.string()).describe('Relevant tags or keywords for the session.'),
    imageUrl: z.string().url().optional().nullable().describe('A URL for a relevant image for the session card.'),
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
  // Validate or transform allSessions to ensure they match GroupSessionZodSchema if necessary,
  // though for this example, we assume data from getAllGroupSessions is compatible.
  return suggestGroupSessionsFlow({ menteeProfile: input.menteeProfile, availableSessions: allSessions });
}

const recommendationPrompt = ai.definePrompt({
  name: 'recommendGroupSessionsPrompt',
  input: { 
    schema: z.object({
      menteeProfile: SuggestGroupSessionsInputSchema.shape.menteeProfile,
      availableSessions: z.array(GroupSessionZodSchema) // Use the explicit Zod schema
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
For each recommended session, provide its original ID, title, description, hostName, date, tags, imageUrl, and price.
Ensure your output strictly adheres to the requested JSON format. If no sessions are suitable, return an empty array.
`,
});

const suggestGroupSessionsFlow = ai.defineFlow(
  {
    name: 'suggestGroupSessionsFlow',
    inputSchema: z.object({ 
      menteeProfile: SuggestGroupSessionsInputSchema.shape.menteeProfile,
      availableSessions: z.array(GroupSessionZodSchema) // Use the explicit Zod schema
    }),
    outputSchema: SuggestGroupSessionsOutputSchema,
  },
  async ({ menteeProfile, availableSessions }) => {
    if (!availableSessions || availableSessions.length === 0) {
      return [];
    }
    
    try {
        const { output } = await recommendationPrompt({ menteeProfile, availableSessions });
        return output || [];
    } catch (error) {
        console.error("Error in recommendGroupSessionsPrompt:", error);
        return []; // Return empty array on error to allow UI to settle
    }
  }
);

