
import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';

// Safely access environment variables from Expo constants
const firebaseConfig: FirebaseOptions = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey ?? process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain ?? process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId ?? process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket ?? process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId ?? process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.firebaseAppId ?? process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId ?? process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate essential config keys
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    'Firebase config is missing essential keys (apiKey, projectId). Check your .env file and expo constants setup.'
  );
}


// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  // Initialize Auth with persistence for React Native
  initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Note: Connecting to Firebase emulators in React Native/Expo requires careful setup,
// especially ensuring the emulator host is accessible from the device/simulator.
// This might involve using your machine's local network IP instead of 'localhost'.
// It's often easier to manage emulator connections during development directly
// in your testing environment or via build variants if needed.
// Example (adjust IP/ports if necessary):
/*
if (__DEV__) {
  try {
    // Replace 'localhost' with your machine's local IP if running on a physical device
    const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
    console.log(`Connecting Firebase Emulators to host: ${host}`);

    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, host, 8080);
    connectStorageEmulator(storage, host, 9199);

    console.log("Firebase Emulators connected (potentially)");
  } catch (error) {
    console.error("Error connecting Firebase Emulators:", error);
  }
}
*/


export { app, auth, db, storage };


// === Firebase Console Configuration Guide (for React Native/Expo) ===
// 1. Go to your Firebase Project Console: https://console.firebase.google.com/
// 2. Project Settings (Gear icon near "Project Overview") > General tab.
// 3. Scroll down to "Your apps".
// 4. Add BOTH an **iOS app** AND an **Android app**.
//    - **iOS:**
//      - Use a unique Bundle ID (e.g., `com.yourcompany.wanderwise`). **This MUST match the `bundleIdentifier` in your `app.json`.**
//      - Download the `GoogleService-Info.plist` file. You'll place this in your project's root directory (Expo manages placing it correctly during builds).
//    - **Android:**
//      - Use a unique Package name (e.g., `com.yourcompany.wanderwise`). **This MUST match the `package` in your `app.json`.**
//      - Download the `google-services.json` file. Place this in your project's root directory.
// 5. Go back to Project Settings > General tab > "Your apps".
// 6. Select the **Web app** (</>) icon. If you don't have one, create it (as done for the Next.js version). You ONLY need the configuration values from this, not the app itself for RN.
// 7. Find the `firebaseConfig` object under "SDK setup and configuration" > "Config".
// 8. Copy the values for `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`, and `measurementId`.
// 9. Create a `.env` file in the root of your React Native project.
// 10. Paste these values into your `.env` file, **prefixed with `EXPO_PUBLIC_`**:
//     ```env
//     EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
//     EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
//     EXPO_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
//     EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
//     EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
//     EXPO_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
//     EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
//     ```
// 11. **Authentication:**
//     - Go to the "Authentication" section in the Firebase console.
//     - Click "Get started".
//     - Go to the "Sign-in method" tab.
//     - Enable the "Email/Password" provider.
// 12. **Firestore Database:**
//     - Go to the "Firestore Database" section.
//     - Click "Create database".
//     - Choose "Start in **production mode**" or "Start in **test mode**".
//       - **Test mode** is easier for initial development but insecure:
//         ```
//         rules_version = '2';
//         service cloud.firestore {
//           match /databases/{database}/documents {
//             match /{document=**} {
//               allow read, write: if request.time < timestamp.date(YEAR, MONTH, DAY+30);
//             }
//           }
//         }
//         ```
//       - **Production mode** is secure (recommended). A basic rule for user-specific data:
//         ```
//         rules_version = '2';
//         service cloud.firestore {
//           match /databases/{database}/documents {
//             // Users can manage their own data
//             match /users/{userId} {
//               allow read, write: if request.auth != null && request.auth.uid == userId;
//             }
//             // Itineraries are linked to users
//             match /itineraries/{itineraryId} {
//               allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
//               allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
//             }
//           }
//         }
//         ```
//     - Select a Firestore location. Click "Enable".
// 13. **(Optional) Firebase Storage:**
//     - Go to the "Storage" section.
//     - Click "Get started", configure rules (similar to Firestore), choose location.
// 14. **Restart your Expo development server** (`npx expo start -c` to clear cache) after updating `.env` or adding `google-services.json`/`GoogleService-Info.plist`.
