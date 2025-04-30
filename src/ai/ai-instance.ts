
import { googleAI } from '@genkit-ai/googleai';
import { configureGenkit } from 'genkit';

// Note: This configuration assumes you're using Google AI (Gemini) via the @genkit-ai/googleai plugin.
// If a specific DeepSeek Genkit plugin exists and is installed, you would configure that instead.
// As of now, there isn't a standard, widely adopted Genkit plugin specifically for DeepSeek.
// Using Google AI is a common fallback or alternative.
// Make sure your Google AI API key is set up correctly (e.g., in your environment variables or ~/.genkit/.env).

configureGenkit({
  plugins: [
    googleAI({
      // You might need to specify the model if the default isn't desired or suitable
      // e.g., apiKey: process.env.GOOGLE_API_KEY, model: 'gemini-1.5-flash'
      // If you have a specific DeepSeek API key, this setup WON'T use it directly.
      // The prompts in the flows still *ask* the LLM (in this case, Gemini) to act like it's using DeepSeek,
      // but the underlying API call goes to Google AI.
    }),
  ],
  logLevel: 'debug', // Set to 'info' or 'warn' in production
  enableTracingAndMetrics: true, // Optional: Enables OpenTelemetry tracing
});

// Re-export startFlowsServer for convenience if needed elsewhere
// (Though usually `genkit start` handles this)
export { startFlowsServer } from '@genkit-ai/flow';
// Export the configured 'ai' object for use in flows
export { ai } from 'genkit/ai';
