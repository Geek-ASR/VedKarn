
'use server';
/**
 * @fileOverview AI-powered group session suggestion flow.
 * This flow now dynamically selects group sessions using an LLM,
 * after validating input sessions from the main data source.
 *
 * - suggestGroupSessions - A function that suggests group sessions based on mentee profile.
 * - SuggestGroupSessionsInput - The input type for the suggestGroupSessions function.
 * - SuggestGroupSessionsOutput - The return type for the suggestGroupSessions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { GroupSession as GroupSessionType } from '@/lib/types'; // Renamed to avoid conflict
import { getAllGroupSessions } from '@/context/auth-context'; // Assuming this is the correct path

const SuggestGroupSessionsInputSchema = z.object({
  menteeProfile: z.string().describe('The profile of the mentee, including their background, interests, and goals.'),
});
export type SuggestGroupSessionsInput = z.infer<typeof SuggestGroupSessionsInputSchema>;

// Define a Zod schema for the GroupSessionType for validating input to the LLM
// This schema should exactly match what getAllGroupSessions() provides for each session.
const GroupSessionZodSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  hostId: z.string(),
  hostName: z.string(),
  hostProfileImageUrl: z.string().url().optional().nullable(), // Input from system should be valid URL if present
  date: z.string(), // e.g., "November 5th, 2024 at 4:00 PM PST"
  tags: z.array(z.string()),
  imageUrl: z.string().url().optional().nullable(), // Input from system should be valid URL if present
  participantCount: z.number().optional().nullable(),
  maxParticipants: z.number().optional().nullable(),
  price: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
});

// Schema for the AI's output
const SuggestedSessionSchema = z.object({
    id: z.string().describe("The unique ID of the original group session that was recommended."),
    title: z.string().describe('The title of the group session.'),
    description: z.string().describe('A brief description of what the group session is about.'),
    hostName: z.string().describe('The name of the host or mentor leading the session.'),
    date: z.string().describe('The date and time of the session (e.g., "October 26th, 2024 at 2:00 PM").'),
    tags: z.array(z.string()).describe('Relevant tags or keywords for the session.'),
    imageUrl: z.string().optional().nullable().describe('A URL for a relevant image for the session card. Can be a placeholder string like "placeholder.png" if a URL is not suitable or if the original session did not have one.'),
    price: z.string().optional().nullable().describe('Price of the session (e.g., "Free", "$20").'),
  });

const SuggestGroupSessionsOutputSchema = z.array(SuggestedSessionSchema);
export type SuggestGroupSessionsOutput = z.infer<typeof SuggestGroupSessionsOutputSchema>;


export async function suggestGroupSessions(input: SuggestGroupSessionsInput): Promise<SuggestGroupSessionsOutput> {
  const allSessionsFromDb = await getAllGroupSessions(); // Fetch all sessions

  if (!allSessionsFromDb || allSessionsFromDb.length === 0) {
    console.log("SuggestGroupSessions: No group sessions available in the system to suggest from.");
    return [];
  }
  
  // Validate each session from the database against our Zod schema
  const validatedInputSessions = allSessionsFromDb.map(session => {
    const parseResult = GroupSessionZodSchema.safeParse(session);
    if (parseResult.success) {
      return parseResult.data;
    } else {
      // console.warn(`SuggestGroupSessions: Session with ID ${session.id} failed validation, excluding from AI suggestions:`, parseResult.error.flatten());
      return null;
    }
  }).filter((session): session is z.infer<typeof GroupSessionZodSchema> => session !== null);

  if (validatedInputSessions.length === 0) {
    console.log("SuggestGroupSessions: No valid group sessions after validation to suggest from.");
    return [];
  }
  
  // console.log(`SuggestGroupSessions: Passing ${validatedInputSessions.length} valid sessions to the AI flow.`);
  return suggestGroupSessionsFlow({ menteeProfile: input.menteeProfile, availableSessions: validatedInputSessions });
}

const recommendationPrompt = ai.definePrompt({
  name: 'recommendGroupSessionsPrompt',
  input: { 
    schema: z.object({
      menteeProfile: SuggestGroupSessionsInputSchema.shape.menteeProfile,
      availableSessions: z.array(GroupSessionZodSchema) // Expecting validated sessions
    })
  },
  output: { schema: SuggestGroupSessionsOutputSchema },
  prompt: `You are an expert academic and career advisor.
Your task is to recommend up to 3 group sessions for a mentee based on their profile and a list of available sessions.
You MUST select sessions from the 'Available Group Sessions' list provided.

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
  Image URL: {{this.imageUrl}}
  Duration: {{this.duration}}
  Current Participants: {{this.participantCount}}
  Max Participants: {{this.maxParticipants}}
{{/each}}
{{else}}
No group sessions are currently available.
{{/if}}

Based on the mentee's profile and the available sessions, select up to 3 sessions that you believe would be most beneficial.
For each recommended session, you MUST provide its original 'Session ID' as the 'id' field in your response.
Also provide its title, description, hostName, date, tags, imageUrl (you can use the original imageUrl if available and suitable, or suggest a generic placeholder string like "placeholder.png" if not), and price.

Ensure your output strictly adheres to the requested JSON format. If no sessions are suitable or available, return an empty array [].
`,
});

const suggestGroupSessionsFlow = ai.defineFlow(
  {
    name: 'suggestGroupSessionsFlow',
    inputSchema: z.object({ 
      menteeProfile: SuggestGroupSessionsInputSchema.shape.menteeProfile,
      availableSessions: z.array(GroupSessionZodSchema) // Expecting validated sessions
    }),
    outputSchema: SuggestGroupSessionsOutputSchema,
  },
  async ({ menteeProfile, availableSessions }) => {
    if (!availableSessions || availableSessions.length === 0) {
      console.log("suggestGroupSessionsFlow: No available sessions to process for recommendations.");
      return [];
    }
    
    try {
        // console.log("suggestGroupSessionsFlow: Calling recommendationPrompt with menteeProfile and availableSessions:", { menteeProfile, availableSessions });
        const { output } = await recommendationPrompt({ menteeProfile, availableSessions });
        
        if (output === null || output === undefined) {
          // console.log("suggestGroupSessionsFlow: recommendationPrompt returned null or undefined. Returning empty array.");
          return [];
        }

        if (!Array.isArray(output)) {
          // console.warn("suggestGroupSessionsFlow: recommendationPrompt did not return an array. Output:", output);
          // Attempt to handle if a single object was returned instead of an array
          if (typeof output === 'object' && output !== null && 'id' in output) {
            const singleSessionParse = SuggestedSessionSchema.safeParse(output);
            if (singleSessionParse.success) {
              return [singleSessionParse.data];
            }
          }
          return []; // If not an array and not a parseable single object, return empty.
        }
        
        // Further validate each item in the array from LLM
        const validatedOutput = output.map(item => SuggestedSessionSchema.safeParse(item))
                                      .filter(result => {
                                        if (!result.success) {
                                          // console.warn("suggestGroupSessionsFlow: An item from LLM failed output validation:", result.error.flatten());
                                        }
                                        return result.success;
                                      })
                                      .map(result => (result as { success: true; data: any }).data); // Type assertion after filtering
        
        // console.log("suggestGroupSessionsFlow: Successfully processed recommendations. Output items:", validatedOutput.length);
        return validatedOutput;

    } catch (error) {
        console.error("suggestGroupSessionsFlow: Error during prompt execution or processing:", error);
        return []; // Return empty array on error
    }
  }
);

