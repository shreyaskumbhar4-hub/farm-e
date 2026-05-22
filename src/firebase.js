import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: secrets.VITE_FIREBASE_API_KEY,
  authDomain: secrets.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: secrets.VITE_FIREBASE_PROJECT_ID,
  storageBucket: secrets.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: secrets.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: secrets.VITE_FIREBASE_APP_ID,
  measurementId: secrets.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth export (you are using this in App.jsx)
export const auth = getAuth(app);