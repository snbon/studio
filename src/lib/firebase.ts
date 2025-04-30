import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Connect to emulators if running in development
// Important: Ensure your emulators are running!
// Run `firebase emulators:start` in your terminal.
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Check if already connected to avoid errors during hot-reloads
  // @ts-ignore
  if (!auth.emulatorConfig) {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      console.log("Auth Emulator connected");
    } catch (error) {
      console.error("Error connecting Auth Emulator:", error);
    }
  }
   // @ts-ignore
  if (!db.emulatorConfig) {
     try {
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log("Firestore Emulator connected");
     } catch (error) {
       console.error("Error connecting Firestore Emulator:", error);
     }
  }
  // @ts-ignore
  if (!storage.emulatorConfig) {
    try {
      connectStorageEmulator(storage, 'localhost', 9199);
      console.log("Storage Emulator connected");
    } catch (error) {
      console.error("Error connecting Storage Emulator:", error);
    }
  }
}


export { app, auth, db, storage };

// === Firebase Console Configuration Guide ===
// 1. Go to your Firebase Project Console: https://console.firebase.google.com/
// 2. Project Settings (Gear icon near "Project Overview") > General tab.
// 3. Scroll down to "Your apps".
// 4. If you haven't added a web app, click "Add app" and select the Web icon (</>).
// 5. Register your app (give it a nickname like "WanderWise Web"). You can skip Firebase Hosting setup for now if you're just using the SDK.
// 6. Find the `firebaseConfig` object under "SDK setup and configuration" > "Config".
// 7. Copy the values for `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`, and `measurementId`.
// 8. Paste these values into your `.env` file in the root of your Next.js project, replacing the `YOUR_...` placeholders.
// 9. **Authentication:**
//    - Go to the "Authentication" section in the Firebase console (left sidebar).
//    - Click "Get started".
//    - Go to the "Sign-in method" tab.
//    - Enable the "Email/Password" provider (and any others you plan to use, e.g., Google).
// 10. **Firestore Database:**
//     - Go to the "Firestore Database" section (left sidebar).
//     - Click "Create database".
//     - Choose "Start in **production mode**" (recommended for security, adjust rules later) or "Start in **test mode**" (allows reads/writes for 30 days - useful for initial development, **BUT NOT FOR PRODUCTION**).
//     - Select a Firestore location (choose one close to your users).
//     - Click "Enable".
//     - **Security Rules (IMPORTANT):** Go to the "Rules" tab in Firestore. For development with test mode, the rules might look like:
//       ```
//       rules_version = '2';
//       service cloud.firestore {
//         match /databases/{database}/documents {
//           match /{document=**} {
//             allow read, write: if request.time < timestamp.date(YEAR, MONTH, DAY+30); // Replace with actual date + 30 days
//           }
//         }
//       }
//       ```
//       For production using Email/Password auth, a basic rule allowing logged-in users to access their own data might look like:
//       ```
//       rules_version = '2';
//       service cloud.firestore {
//         match /databases/{database}/documents {
//           // Users can only read/write their own profile
//           match /users/{userId} {
//             allow read, write: if request.auth != null && request.auth.uid == userId;
//           }
//           // Users can only read/write their own itineraries
//           match /itineraries/{itineraryId} {
//             allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
//             // Allow creation only if userId matches authenticated user
//             allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
//           }
//         }
//       }
//       ```
//       **You MUST refine these rules based on your specific application needs.**
// 11. **(Optional) Firebase Storage:**
//     - Go to the "Storage" section (left sidebar).
//     - Click "Get started".
//     - Follow the prompts to set up security rules (similar to Firestore, start in test mode or production mode).
//     - Choose a Storage location.
// 12. **Restart your Next.js development server** (`npm run dev`) after updating `.env`.
