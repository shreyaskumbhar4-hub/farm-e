import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA2E8o6KZqQawyE90vXdzHk0gL58hdzfrM",
  authDomain: "farm-e-31335.firebaseapp.com",
  projectId: "farm-e-31335",
  storageBucket: "farm-e-31335.appspot.com",
  messagingSenderId: "694206682175",
  appId: "1:694206682175:web:9d2e6802f0ec8ffd30548a",
  measurementId: "G-GCHT8WNMRD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth export (you are using this in App.jsx)
export const auth = getAuth(app);