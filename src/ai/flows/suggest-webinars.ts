
'use server';
/**
 * @fileOverview AI-powered webinar suggestion flow.
 *
 * - suggestWebinars - A function that suggests webinars based on mentee profile.
 * - SuggestWebinarsInput - The input type for the suggestWebinars function.
 * - SuggestWebinarsOutput - The output type for the suggestWebinars function.
 * - Webinar - The type for a webinar.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Webinar as WebinarType } from '@/lib/types';

const WebinarSchema = z.object({
  id: z.string(),
  title: z.string().describe('The title of the webinar.'),
  description: z.string().describe('A brief summary of the webinar content.'),
  speakerName: z.string().describe('The name of the webinar speaker or presenter.'),
  date: z.string().describe('The date and time of the webinar (e.g., "November 10th, 2024 at 11:00 AM PST").'),
  topic: z.string().describe('The main topic or category of the webinar.'),
  imageUrl: z.string().optional().describe('A URL for a relevant image for the webinar card.'),
  duration: z.string().optional().describe('The duration of the webinar (e.g., "60 minutes", "1.5 hours").')
});
export type Webinar = z.infer<typeof WebinarSchema>;


const SuggestWebinarsInputSchema = z.object({
  menteeProfile: z.string().describe('The profile of the mentee, including their background, interests, and goals.'),
});
export type SuggestWebinarsInput = z.infer<typeof SuggestWebinarsInputSchema>;

const SuggestWebinarsOutputSchema = z.array(WebinarSchema);
export type SuggestWebinarsOutput = z.infer<typeof SuggestWebinarsOutputSchema>;

export async function suggestWebinars(input: SuggestWebinarsInput): Promise<SuggestWebinarsOutput> {
  // Mock implementation
  console.log("Suggesting webinars for mentee:", input.menteeProfile.substring(0, 50) + "...");
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay

  const mockWebinars: Webinar[] = [
    {
      id: 'web1',
      title: 'The Future of Generative AI',
      description: 'Explore the latest advancements in Generative AI, its applications, and ethical considerations. Led by a leading AI researcher.',
      speakerName: 'Dr. Lex Futura',
      date: 'November 8th, 2024 at 9:00 AM PST',
      topic: 'Artificial Intelligence',
      imageUrl: 'https://placehold.co/400x250.png',
      duration: '90 minutes'
    },
    {
      id: 'web2',
      title: 'Effective Networking in the Tech Industry',
      description: 'Learn strategies for building meaningful professional connections, both online and offline, to advance your career in tech.',
      speakerName: 'Connector Carla',
      date: 'November 15th, 2024 at 12:00 PM PST',
      topic: 'Career Development',
      imageUrl: 'https://placehold.co/400x250.png',
      duration: '60 minutes'
    },
    {
      id: 'web3',
      title: 'Demystifying Cloud Computing',
      description: 'A comprehensive overview of cloud computing concepts, services (AWS, Azure, GCP), and how to get started with cloud technologies.',
      speakerName: 'Prof. Nimbus Stratos',
      date: 'November 22nd, 2024 at 3:00 PM PST',
      topic: 'Cloud Computing',
      imageUrl: 'https://placehold.co/400x250.png',
      duration: '75 minutes'
    }
  ];
   if (input.menteeProfile.toLowerCase().includes('ai') || input.menteeProfile.toLowerCase().includes('artificial intelligence')) {
    return [mockWebinars[0]];
  }
  if (input.menteeProfile.toLowerCase().includes('career') || input.menteeProfile.toLowerCase().includes('networking')) {
    return [mockWebinars[1]];
  }
  return mockWebinars; // Return all as default
}

// This flow is a mock and directly returns data.
const suggestWebinarsFlow = ai.defineFlow(
  {
    name: 'suggestWebinarsFlow',
    inputSchema: SuggestWebinarsInputSchema,
    outputSchema: SuggestWebinarsOutputSchema,
  },
  async (input) => {
    return suggestWebinars(input);
  }
);
