'use server';
/**
 * @fileOverview Summarizes a travel itinerary, extracting key activities and locations.
 *
 * - summarizeItinerary - A function that summarizes a given itinerary.
 * - SummarizeItineraryInput - The input type for the summarizeItinerary function.
 * - SummarizeItineraryOutput - The return type for the summarizeItinerary function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeItineraryInputSchema = z.object({
  itinerary: z.string().describe('The detailed itinerary to summarize.'),
});
export type SummarizeItineraryInput = z.infer<typeof SummarizeItineraryInputSchema>;

const SummarizeItineraryOutputSchema = z.object({
  summary: z.string().describe('A brief summary of the itinerary.'),
});
export type SummarizeItineraryOutput = z.infer<typeof SummarizeItineraryOutputSchema>;

export async function summarizeItinerary(input: SummarizeItineraryInput): Promise<SummarizeItineraryOutput> {
  return summarizeItineraryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeItineraryPrompt',
  input: {
    schema: z.object({
      itinerary: z.string().describe('The detailed itinerary to summarize.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A brief summary of the itinerary.'),
    }),
  },
  prompt: `You are a travel expert. Please summarize the following itinerary, highlighting key activities and locations, into a brief overview. The itinerary is as follows:\n\n{{{itinerary}}}`,
});

const summarizeItineraryFlow = ai.defineFlow<
  typeof SummarizeItineraryInputSchema,
  typeof SummarizeItineraryOutputSchema
>(
  {
    name: 'summarizeItineraryFlow',
    inputSchema: SummarizeItineraryInputSchema,
    outputSchema: SummarizeItineraryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
