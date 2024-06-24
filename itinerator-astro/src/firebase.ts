// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Import types
import type { FirebaseApp } from "firebase/app";
import type { Analytics } from "firebase/analytics";
import type { Auth } from "firebase/auth";

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
let app: FirebaseApp;
let analytics: Analytics;
let db: Firestore;
let auth: Auth;

if (typeof window !== 'undefined') {
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  db = getFirestore(app);
  auth = getAuth(app);
}

export { app, analytics, db, auth };