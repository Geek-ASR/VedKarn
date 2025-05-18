
'use server';
/**
 * @fileOverview AI-powered group session suggestion flow and data access.
 *
 * - suggestGroupSessions - A function that suggests group sessions based on mentee profile.
 * - SuggestGroupSessionsInput - The input type for the suggestGroupSessions function.
 * - SuggestGroupSessionsOutput - The output type for the suggestGroupSessions function.
 * - GroupSession - The type for a group session (imported from lib/types).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { GroupSession } from '@/lib/types'; // GroupSession type is now primarily managed in lib/types and context

// MOCK_GROUP_SESSIONS is now initialized and managed in AuthContext.
// getGroupSessionById is now getGroupSessionDetails in AuthContext.

const SuggestGroupSessionsInputSchema = z.object({
  menteeProfile: z.string().describe('The profile of the mentee, including their background, interests, and goals.'),
});
export type SuggestGroupSessionsInput = z.infer<typeof SuggestGroupSessionsInputSchema>;

const SuggestGroupSessionsOutputSchema = z.array(
  z.object({ // Re-defining schema for AI output, as GroupSession type is richer.
    id: z.string(),
    title: z.string().describe('The title of the group session.'),
    description: z.string().describe('A brief description of what the group session is about.'),
    hostName: z.string().describe('The name of the host or mentor leading the session.'),
    date: z.string().describe('The date and time of the session (e.g., "October 26th, 2024 at 2:00 PM").'),
    tags: z.array(z.string()).describe('Relevant tags or keywords for the session.'),
    imageUrl: z.string().optional().describe('A URL for a relevant image for the session card.'),
    price: z.string().optional().describe('Price of the session (e.g., "Free", "$20").')
    // participantCount, maxParticipants, hostId, hostProfileImageUrl are part of the full GroupSession type
    // but might not be directly part of the AI's initial suggestion schema unless specifically prompted.
    // The AI will suggest based on the fields it is prompted with.
  })
);
export type SuggestGroupSessionsOutput = z.infer<typeof SuggestGroupSessionsOutputSchema>;


// This mock suggestion function now returns data that fits SuggestGroupSessionsOutputSchema.
// For actual display, the frontend will use getGroupSessionDetails from AuthContext to get the full session object.
const MOCK_SUGGESTIONS_FOR_AI_FLOW: SuggestGroupSessionsOutput = [
  {
    id: 'gs1',
    title: 'Mastering Data Structures & Algorithms',
    description: 'Join our interactive group session to tackle common DSA problems and improve your coding interview skills. Collaborative problem-solving, weekly challenges, and mock interview practice. This session is ideal for students preparing for technical interviews or looking to strengthen their fundamental computer science knowledge. We will cover arrays, linked lists, trees, graphs, sorting, searching, and dynamic programming.',
    hostName: 'Dr. Code Alchemist',
    date: 'November 5th, 2024 at 4:00 PM PST',
    tags: ['DSA', 'Coding Interview', 'Algorithms', 'Problem Solving', 'Data Structures'],
    imageUrl: 'https://placehold.co/600x400.png',
    price: '$25'
  },
  {
    id: 'gs2',
    title: 'Startup Pitch Practice & Feedback',
    description: 'Refine your startup pitch in a supportive group environment. Get constructive feedback from peers and an experienced entrepreneur. Learn how to structure your pitch, tell a compelling story, and answer tough questions from investors. Each participant will have a chance to present and receive tailored advice.',
    hostName: 'Valerie Venture',
    date: 'November 12th, 2024 at 10:00 AM PST',
    tags: ['Startup', 'Pitching', 'Entrepreneurship', 'Feedback', 'Business'],
    imageUrl: 'https://placehold.co/600x400.png',
    price: '$20'
  },
  {
    id: 'gs3',
    title: 'Intro to UX Design Principles',
    description: 'A beginner-friendly group session covering the fundamentals of UX design. Learn about user research, persona creation, wireframing, prototyping, and usability testing. We will work through a mini-project to apply these concepts.',
    hostName: 'Desiree Design',
    date: 'November 19th, 2024 at 1:00 PM PST',
    tags: ['UX Design', 'Beginner', 'UI/UX', 'Design Thinking', 'Prototyping'],
    imageUrl: 'https://placehold.co/600x400.png',
    price: 'Free'
  }
];


export async function suggestGroupSessions(input: SuggestGroupSessionsInput): Promise<SuggestGroupSessionsOutput> {
  // Mock implementation - in a real scenario, this would call an LLM or a matching algorithm.
  console.log("Suggesting group sessions for mentee:", input.menteeProfile.substring(0, 50) + "...");
  await new Promise(resolve => setTimeout(resolve, 700)); // Simulate network delay

  // Simulate some basic matching based on mentee profile string
  if (input.menteeProfile.toLowerCase().includes('data science') || input.menteeProfile.toLowerCase().includes('algorithms')) {
    return [MOCK_SUGGESTIONS_FOR_AI_FLOW[0]];
  }
  if (input.menteeProfile.toLowerCase().includes('startup') || input.menteeProfile.toLowerCase().includes('entrepreneur')) {
    return [MOCK_SUGGESTIONS_FOR_AI_FLOW[1]];
  }
  return MOCK_SUGGESTIONS_FOR_AI_FLOW; // Return all if no specific match or just as a default
}

// This flow is a mock and directly returns data, so no LLM prompt is defined.
// If an LLM were used, you would define a prompt similar to suggest-mentors.
const suggestGroupSessionsFlow = ai.defineFlow(
  {
    name: 'suggestGroupSessionsFlow',
    inputSchema: SuggestGroupSessionsInputSchema,
    outputSchema: SuggestGroupSessionsOutputSchema,
  },
  async (input) => {
    return suggestGroupSessions(input); // Calling the mock function directly
  }
);

// getGroupSessionById has been moved to AuthContext as getGroupSessionDetails for a centralized data source.
// The MOCK_GROUP_SESSIONS data is also now centralized in AuthContext.
