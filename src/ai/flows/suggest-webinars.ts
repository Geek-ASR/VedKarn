
'use server';
/**
 * @fileOverview AI-powered webinar suggestion flow.
 * This file provides mock suggestions for webinars.
 * - suggestWebinars - A function that suggests webinars based on mentee profile.
 * - SuggestWebinarsInput - The input type for the suggestWebinars function.
 * - SuggestWebinarsOutput - The output type for the suggestWebinars function.
 * - Webinar - The type for a webinar (imported from lib/types).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Webinar as WebinarType } from '@/lib/types'; // Using WebinarType alias to avoid conflict

// Renamed to avoid conflict with exported Webinar type if any
const WebinarOutputSchema = z.object({
  id: z.string(),
  title: z.string().describe('The title of the webinar.'),
  description: z.string().describe('A brief summary of the webinar content.'),
  speakerName: z.string().describe('The name of the webinar speaker or presenter.'),
  date: z.string().describe('The date and time of the webinar (e.g., "November 10th, 2024 at 11:00 AM PST").'),
  topic: z.string().describe('The main topic or category of the webinar.'),
  imageUrl: z.string().optional().describe('A URL for a relevant image for the webinar card.'),
  duration: z.string().optional().describe('The duration of the webinar (e.g., "60 minutes", "1.5 hours").')
  // hostId and hostProfileImageUrl are part of the full WebinarType, not directly suggested by AI here.
});


const SuggestWebinarsInputSchema = z.object({
  menteeProfile: z.string().describe('The profile of the mentee, including their background, interests, and goals.'),
});
export type SuggestWebinarsInput = z.infer<typeof SuggestWebinarsInputSchema>;

// Output schema for AI uses the simplified WebinarOutputSchema
const SuggestWebinarsOutputSchema = z.array(WebinarOutputSchema);
export type SuggestWebinarsOutput = z.infer<typeof SuggestWebinarsOutputSchema>;

// This function now returns data matching SuggestWebinarsOutput
export async function suggestWebinars(input: SuggestWebinarsInput): Promise<SuggestWebinarsOutput> {
  console.log("Suggesting webinars for mentee:", input.menteeProfile.substring(0, 50) + "...");
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay

  // These mock suggestions only include fields defined in WebinarOutputSchema
  const mockAISuggestions: SuggestWebinarsOutput = [
    {
      id: 'web1', // This ID will be used to fetch full details from AuthContext if needed by frontend
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
    return [mockAISuggestions[0]];
  }
  if (input.menteeProfile.toLowerCase().includes('career') || input.menteeProfile.toLowerCase().includes('networking')) {
    return [mockAISuggestions[1]];
  }
  return mockAISuggestions; // Return all as default
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

// getWebinarById is now handled by getWebinarDetails in AuthContext.
// The MOCK_WEBINARS data is also now centralized in AuthContext.
