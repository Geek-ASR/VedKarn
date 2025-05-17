
'use server';
/**
 * @fileOverview AI-powered group session suggestion flow.
 *
 * - suggestGroupSessions - A function that suggests group sessions based on mentee profile.
 * - SuggestGroupSessionsInput - The input type for the suggestGroupSessions function.
 * - SuggestGroupSessionsOutput - The output type for the suggestGroupSessions function.
 * - GroupSession - The type for a group session.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { GroupSession as GroupSessionType } from '@/lib/types';

const GroupSessionSchema = z.object({
  id: z.string(),
  title: z.string().describe('The title of the group session.'),
  description: z.string().describe('A brief description of what the group session is about.'),
  hostName: z.string().describe('The name of the host or mentor leading the session.'),
  date: z.string().describe('The date and time of the session (e.g., "October 26th, 2024 at 2:00 PM").'),
  tags: z.array(z.string()).describe('Relevant tags or keywords for the session.'),
  imageUrl: z.string().optional().describe('A URL for a relevant image for the session card.'),
  participantCount: z.number().optional().describe('Current number of participants.'),
  maxParticipants: z.number().optional().describe('Maximum number of participants allowed.'),
  price: z.string().optional().describe('Price of the session (e.g., "Free", "$20").')
});
export type GroupSession = z.infer<typeof GroupSessionSchema>;


const SuggestGroupSessionsInputSchema = z.object({
  menteeProfile: z.string().describe('The profile of the mentee, including their background, interests, and goals.'),
});
export type SuggestGroupSessionsInput = z.infer<typeof SuggestGroupSessionsInputSchema>;

const SuggestGroupSessionsOutputSchema = z.array(GroupSessionSchema);
export type SuggestGroupSessionsOutput = z.infer<typeof SuggestGroupSessionsOutputSchema>;

export async function suggestGroupSessions(input: SuggestGroupSessionsInput): Promise<SuggestGroupSessionsOutput> {
  // Mock implementation - in a real scenario, this would call an LLM or a matching algorithm.
  console.log("Suggesting group sessions for mentee:", input.menteeProfile.substring(0, 50) + "...");
  await new Promise(resolve => setTimeout(resolve, 700)); // Simulate network delay

  const mockSessions: GroupSession[] = [
    {
      id: 'gs1',
      title: 'Mastering Data Structures & Algorithms',
      description: 'Join our interactive group session to tackle common DSA problems and improve your coding interview skills. Collaborative problem-solving.',
      hostName: 'Dr. Code Alchemist',
      date: 'November 5th, 2024 at 4:00 PM PST',
      tags: ['DSA', 'Coding Interview', 'Algorithms', 'Problem Solving'],
      imageUrl: 'https://placehold.co/400x250.png',
      maxParticipants: 15,
      participantCount: 8,
      price: '$25'
    },
    {
      id: 'gs2',
      title: 'Startup Pitch Practice & Feedback',
      description: 'Refine your startup pitch in a supportive group environment. Get constructive feedback from peers and an experienced entrepreneur.',
      hostName: 'Valerie Venture',
      date: 'November 12th, 2024 at 10:00 AM PST',
      tags: ['Startup', 'Pitching', 'Entrepreneurship', 'Feedback'],
      imageUrl: 'https://placehold.co/400x250.png',
      maxParticipants: 10,
      participantCount: 5,
      price: '$20'
    },
    {
      id: 'gs3',
      title: 'Intro to UX Design Principles',
      description: 'A beginner-friendly group session covering the fundamentals of UX design. Learn about user research, wireframing, and usability testing.',
      hostName: 'Desiree Design',
      date: 'November 19th, 2024 at 1:00 PM PST',
      tags: ['UX Design', 'Beginner', 'UI/UX', 'Design Thinking'],
      imageUrl: 'https://placehold.co/400x250.png',
      maxParticipants: 20,
      participantCount: 12,
      price: 'Free'
    }
  ];
  // Simulate some basic matching based on mentee profile string
  if (input.menteeProfile.toLowerCase().includes('data science') || input.menteeProfile.toLowerCase().includes('algorithms')) {
    return [mockSessions[0]];
  }
  if (input.menteeProfile.toLowerCase().includes('startup') || input.menteeProfile.toLowerCase().includes('entrepreneur')) {
    return [mockSessions[1]];
  }
  return mockSessions; // Return all if no specific match or just as a default
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
