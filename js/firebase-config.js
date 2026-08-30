import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyAzwmGN_ONgtJCnMu0gUTSY4120ttpmSjQ",
  authDomain: "pixellegends-f13d0.firebaseapp.com",
  databaseURL: "https://pixellegends-f13d0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pixellegends-f13d0",
  storageBucket: "pixellegends-f13d0.firebasestorage.app",
  messagingSenderId: "799292344989",
  appId: "1:799292344989:web:594042d56350d249b6a274",
  measurementId: "G-LQYT12PMT6"
};

const appKey = '__pixel_legends_firebase_app__';

if (!globalThis[appKey]) {
  globalThis[appKey] = initializeApp(firebaseConfig);
}

export const app = globalThis[appKey];