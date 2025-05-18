
'use server';
/**
 * @fileOverview AI-powered group session suggestion flow.
 * FOR DEBUGGING: This flow currently returns hardcoded data to isolate issues.
 *
 * - suggestGroupSessions - A function that suggests group sessions based on mentee profile.
 * - SuggestGroupSessionsInput - The input type for the suggestGroupSessions function.
 * - SuggestGroupSessionsOutput - The return type for the suggestGroupSessions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
// import { getAllGroupSessions } from '@/context/auth-context'; // Temporarily unused

const SuggestGroupSessionsInputSchema = z.object({
  menteeProfile: z.string().describe('The profile of the mentee, including their background, interests, and goals.'),
});
export type SuggestGroupSessionsInput = z.infer<typeof SuggestGroupSessionsInputSchema>;

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


// This is the main exported function called by the frontend.
export async function suggestGroupSessions(input: SuggestGroupSessionsInput): Promise<SuggestGroupSessionsOutput> {
  console.log("DEBUG: suggestGroupSessions (hardcoded version) called with input:", input.menteeProfile.substring(0, 50) + "...");
  try {
    // Directly call the flow that returns hardcoded data
    const result = await suggestGroupSessionsFlow_DebugHardcoded(input);
    console.log("DEBUG: suggestGroupSessionsFlow_DebugHardcoded returned:", result);
    return result;
  } catch (error) {
    console.error("DEBUG: Error in suggestGroupSessions wrapper calling flow:", error);
    return []; // Return empty array on error
  }
}

// This is the Genkit flow, simplified to return hardcoded data.
const suggestGroupSessionsFlow_DebugHardcoded = ai.defineFlow(
  {
    name: 'suggestGroupSessionsFlow_DebugHardcoded', // Unique name for debugging
    inputSchema: SuggestGroupSessionsInputSchema,
    outputSchema: SuggestGroupSessionsOutputSchema,
  },
  async (input) => {
    console.log("DEBUG: suggestGroupSessionsFlow_DebugHardcoded (hardcoded) started with input:", input.menteeProfile.substring(0,50) + "...");
    
    // HARDCODED RESPONSE FOR DEBUGGING
    const hardcodedSuggestions: SuggestGroupSessionsOutput = [
      {
        id: 'gs-debug-1',
        title: 'Debug Session: Intro to Debugging',
        description: 'A special session to help debug issues with session loading. If you see this, the basic flow structure is working.',
        hostName: 'Dev Team',
        date: 'Right Now, 2024',
        tags: ['Debugging', 'Test', 'Genkit'],
        imageUrl: 'https://placehold.co/600x400.png',
        price: 'Free',
      },
      {
        id: 'gs-debug-2',
        title: 'Debug Session: Advanced Troubleshooting',
        description: 'Another test session. Displaying this means the flow can return multiple items.',
        hostName: 'Support Crew',
        date: 'Sometime Soon, 2024',
        tags: ['Testing', 'Support', 'Development'],
        imageUrl: 'https://placehold.co/600x400.png',
        price: '$10 (Debug Discount)',
      }
    ];

    // Simulate a small delay as if an operation was performed
    await new Promise(resolve => setTimeout(resolve, 200)); 

    console.log("DEBUG: suggestGroupSessionsFlow_DebugHardcoded returning hardcoded suggestions:", hardcodedSuggestions);
    return hardcodedSuggestions;
  }
);


// The original prompt and complex flow logic are commented out below for now.
// We will re-introduce them once the hardcoded version works.

/*
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
  imageUrl: z.string().optional().nullable(), // Input from system should be valid URL if present
  participantCount: z.number().optional().nullable(),
  maxParticipants: z.number().optional().nullable(),
  price: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
});


const recommendationPrompt = ai.definePrompt({
  name: 'recommendGroupSessionsPrompt',
  input: { 
    schema: z.object({
      menteeProfile: SuggestGroupSessionsInputSchema.shape.menteeProfile,
      availableSessions: z.array(GroupSessionZodSchema) // Expecting validated sessions
    })
  },
  output: { schema: SuggestGroupSessionsOutputSchema },
  prompt: \`You are an expert academic and career advisor.
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
\`,
});

const suggestGroupSessionsFlow_Original = ai.defineFlow(
  {
    name: 'suggestGroupSessionsFlow', // Original name
    inputSchema: z.object({ 
      menteeProfile: SuggestGroupSessionsInputSchema.shape.menteeProfile,
      availableSessions: z.array(GroupSessionZodSchema) // Expecting validated sessions
    }),
    outputSchema: SuggestGroupSessionsOutputSchema,
  },
  async ({ menteeProfile, availableSessions }) => {
    if (!availableSessions || availableSessions.length === 0) {
      console.log("suggestGroupSessionsFlow_Original: No available sessions to process for recommendations.");
      return [];
    }
    
    try {
        console.log("suggestGroupSessionsFlow_Original: Calling recommendationPrompt with menteeProfile and availableSessions:", { menteeProfile: menteeProfile.substring(0,50), availableSessionsCount: availableSessions.length });
        const { output } = await recommendationPrompt({ menteeProfile, availableSessions });
        
        if (output === null || output === undefined) {
          console.log("suggestGroupSessionsFlow_Original: recommendationPrompt returned null or undefined. Returning empty array.");
          return [];
        }

        if (!Array.isArray(output)) {
          console.warn("suggestGroupSessionsFlow_Original: recommendationPrompt did not return an array. Output:", output);
          // Attempt to handle if a single object was returned instead of an array
          if (typeof output === 'object' && output !== null && 'id' in output) {
            const singleSessionParse = SuggestedSessionSchema.safeParse(output);
            if (singleSessionParse.success) {
              return [singleSessionParse.data];
            }
          }
          return []; // If not an array and not a parseable single object, return empty.
        }
        
        const validatedOutput = output.map(item => SuggestedSessionSchema.safeParse(item))
                                      .filter(result => {
                                        if (!result.success) {
                                          console.warn("suggestGroupSessionsFlow_Original: An item from LLM failed output validation:", result.error.flatten());
                                        }
                                        return result.success;
                                      })
                                      .map(result => (result as { success: true; data: z.infer<typeof SuggestedSessionSchema> }).data);
        
        console.log("suggestGroupSessionsFlow_Original: Successfully processed recommendations. Output items:", validatedOutput.length);
        return validatedOutput;

    } catch (error) {
        console.error("suggestGroupSessionsFlow_Original: Error during prompt execution or processing:", error);
        return []; // Return empty array on error
    }
  }
);


// Original wrapper function that calls getAllGroupSessions, now commented out for debugging
// export async function suggestGroupSessions(input: SuggestGroupSessionsInput): Promise<SuggestGroupSessionsOutput> {
//   const allSessionsFromDb = await getAllGroupSessions(); 

//   if (!allSessionsFromDb || allSessionsFromDb.length === 0) {
//     console.log("SuggestGroupSessions: No group sessions available in the system to suggest from.");
//     return [];
//   }
  
//   const validatedInputSessions = allSessionsFromDb.map(session => {
//     const parseResult = GroupSessionZodSchema.safeParse(session);
//     if (parseResult.success) {
//       return parseResult.data;
//     } else {
//       console.warn(\`SuggestGroupSessions: Session with ID \${session.id} failed validation, excluding from AI suggestions:\`, parseResult.error.flatten());
//       return null;
//     }
//   }).filter((session): session is z.infer<typeof GroupSessionZodSchema> => session !== null);

//   if (validatedInputSessions.length === 0) {
//     console.log("SuggestGroupSessions: No valid group sessions after validation to suggest from.");
//     return [];
//   }
  
//   console.log(\`SuggestGroupSessions: Passing \${validatedInputSessions.length} valid sessions to the AI flow.\`);
//   return suggestGroupSessionsFlow_Original({ menteeProfile: input.menteeProfile, availableSessions: validatedInputSessions });
// }
*/

