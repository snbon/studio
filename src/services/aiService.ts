
import axios from 'axios';
import Constants from 'expo-constants';
import { GenerateItineraryApiInput, GenerateItineraryApiOutput } from '../types/itinerary'; // Adjust path

// Get the API URL from environment variables via Expo constants
const genkitApiUrl = Constants.expoConfig?.extra?.genkitApiUrl ?? process.env.EXPO_PUBLIC_GENKIT_API_URL;

if (!genkitApiUrl) {
  console.warn('Genkit API URL is not configured. Please set EXPO_PUBLIC_GENKIT_API_URL in your .env file.');
}

// Create an Axios instance for API calls
const apiClient = axios.create({
  baseURL: genkitApiUrl,
  timeout: 30000, // 30 seconds timeout for AI generation
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Calls the Genkit flow to generate a travel itinerary.
 * @param input - The itinerary parameters.
 * @returns A promise that resolves with the generated itinerary output.
 * @throws Throws an error if the API call fails or returns an unexpected format.
 */
export const callGenerateItinerary = async (
  input: GenerateItineraryApiInput
): Promise<GenerateItineraryApiOutput> => {
  if (!genkitApiUrl) {
    throw new Error('Genkit API URL is not configured.');
  }

  try {
    // Assuming the Genkit flow is exposed at a path like '/generateItineraryFlow'
    // Adjust the path '/generateItineraryFlow' if your Genkit server setup is different.
    const response = await apiClient.post<GenerateItineraryApiOutput>('/generateItineraryFlow', input);

    // Basic validation of the response
    if (response.status === 200 && response.data && typeof response.data.itinerary === 'string') {
      return response.data;
    } else {
       console.error('Unexpected AI API response:', response.data);
       throw new Error('Received an unexpected response format from the AI service.');
    }
  } catch (error: any) {
    console.error('Error calling generate itinerary flow:', error.response?.data || error.message);
    // Re-throw the error for the caller component to handle (e.g., show toast)
    if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          throw new Error(`AI service failed: ${error.response.data?.message || `Status ${error.response.status}`}`);
        } else if (error.request) {
          // The request was made but no response was received
          throw new Error('Could not connect to the AI service. Please check the connection.');
        }
    }
    // Other errors
    throw new Error(error.message || 'An unknown error occurred while generating the itinerary.');
  }
};

// Add other AI service calls here if needed (e.g., callSummarizeItinerary)
