// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Import types
import type { Analytics } from "firebase/analytics";
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9cb7zySwiYnXgqWnQKgb8L84Q4Y-eYZY",
  authDomain: "itinerator-bf719.firebaseapp.com",
  projectId: "itinerator-bf719",
  storageBucket: "itinerator-bf719.appspot.com",
  messagingSenderId: "1086600294636",
  appId: "1:1086600294636:web:75ff5886022f30a853f5c9",
  measurementId: "G-M9TB6E76QY"
};

// Initialize Firebase
let app: FirebaseApp | undefined;
let analytics: Analytics | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

if (typeof window !== 'undefined') {
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  db = getFirestore(app);
  auth = getAuth(app);
}

export { analytics, app, auth, db };
