# WanderWise - Mobile App

This is a React Native mobile application built with Expo for WanderWise, an AI-powered travel itinerary generator.

## Features

-   User Authentication (Email/Password via Firebase)
-   AI Itinerary Generation (using Genkit flows called via HTTP)
-   Save & View Itineraries (using Firebase Firestore)
-   Form for specifying trip details (Destination, Dates, Group Size, Preferences, etc.)
-   Minimalist UI design

## Tech Stack

-   React Native
-   Expo (Managed Workflow)
-   TypeScript
-   React Navigation
-   Firebase (Auth, Firestore)
-   Genkit (for AI flows, running separately on a server)
-   React Hook Form
-   React Native Vector Icons
-   React Native Toast Message


### Running the App

1.  Start the Expo development server:
    ```bash
    npx expo start
    ```
2.  Scan the QR code with the Expo Go app on your device, or press `a` for Android emulator or `i` for iOS simulator.

### Running Genkit Flows

The AI generation depends on the Genkit flows (`generate-itinerary.ts`, etc.) running on a server accessible from your mobile app/simulator.

1.  **Ensure the Genkit project (previously the Next.js app) is running:**
    Navigate to the directory containing the Genkit flows (e.g., the previous `nextn` project).
    ```bash
    cd ../nextn # Or your Genkit project directory
    npm run genkit:dev # Or `genkit start -- tsx src/ai/dev.ts`
    ```
2.  **Verify the URL:** Make sure the `EXPO_PUBLIC_GENKIT_API_URL` in your `.env` file points to the correct address and port where Genkit is serving the flows (default is often `http://localhost:3400`). If running on a physical device, ensure your device can reach the server running Genkit (e.g., use your computer's local network IP instead of `localhost`).

## Project Structure

-   `App.tsx`: Root component, sets up navigation and context providers.
-   `app.json`: Expo configuration file.
-   `babel.config.js`: Babel configuration for Expo.
-   `assets/`: Static assets like images, fonts.
-   `components/`: Reusable UI components (e.g., `StyledButton`, `LoadingOverlay`).
-   `constants/`: Theme colors, dimensions, etc.
-   `contexts/`: React context providers (e.g., `AuthContext`).
-   `hooks/`: Custom hooks (e.g., `useToast`).
-   `navigation/`: React Navigation setup (`AppNavigator`).
-   `screens/`: Application screens (e.g., `HomeScreen`, `SignInScreen`).
-   `services/`: Modules for interacting with external services (Firebase, AI API).
-   `types/`: TypeScript type definitions.
