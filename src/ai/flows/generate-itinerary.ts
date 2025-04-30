// 'use server';

/**
 * @fileOverview Generates a travel itinerary based on user-provided details.
 *
 * - generateItinerary - A function that generates a travel itinerary.
 * - GenerateItineraryInput - The input type for the generateItinerary function.
 * - GenerateItineraryOutput - The return type for the generateItinerary function.
 */

'use server';

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateItineraryInputSchema = z.object({
  destination: z.string().describe('The destination for the trip.'),
  travelDates: z.string().describe('The travel dates for the trip.'),
  groupSize: z.number().describe('The number of people in the group.'),
  activityPreferences: z.string().describe('The preferred activities for the trip.'),
  groupType: z.string().describe('The type of group (e.g., family, friends, colleagues).'),
  tripLength: z.number().describe('The length of the trip in days.'),
});
export type GenerateItineraryInput = z.infer<typeof GenerateItineraryInputSchema>;

const GenerateItineraryOutputSchema = z.object({
  itinerary: z.string().describe('A detailed and comprehensive travel itinerary.'),
});
export type GenerateItineraryOutput = z.infer<typeof GenerateItineraryOutputSchema>;

export async function generateItinerary(input: GenerateItineraryInput): Promise<GenerateItineraryOutput> {
  return generateItineraryFlow(input);
}

const generateItineraryPrompt = ai.definePrompt({
  name: 'generateItineraryPrompt',
  input: {
    schema: z.object({
      destination: z.string().describe('The destination for the trip.'),
      travelDates: z.string().describe('The travel dates for the trip.'),
      groupSize: z.number().describe('The number of people in the group.'),
      activityPreferences: z.string().describe('The preferred activities for the trip.'),
      groupType: z.string().describe('The type of group (e.g., family, friends, colleagues).'),
      tripLength: z.number().describe('The length of the trip in days.'),
    }),
  },
  output: {
    schema: z.object({
      itinerary: z.string().describe('A detailed and comprehensive travel itinerary.'),
    }),
  },
  prompt: `You are an expert travel planner.

  Based on the following information, create a detailed and comprehensive travel itinerary.

  Destination: {{{destination}}}
  Travel Dates: {{{travelDates}}}
  Group Size: {{{groupSize}}}
  Activity Preferences: {{{activityPreferences}}}
  Group Type: {{{groupType}}}
  Trip Length: {{{tripLength}}} days

  Please use the DeepSeek API to generate the itinerary.  The itinerary should include specific activities and recommendations for each day of the trip.  It should be well-organized and easy to follow.
  `,
});

const generateItineraryFlow = ai.defineFlow<
  typeof GenerateItineraryInputSchema,
  typeof GenerateItineraryOutputSchema
>({
  name: 'generateItineraryFlow',
  inputSchema: GenerateItineraryInputSchema,
  outputSchema: GenerateItineraryOutputSchema,
}, async input => {
  const {output} = await generateItineraryPrompt(input);
  return output!;
});