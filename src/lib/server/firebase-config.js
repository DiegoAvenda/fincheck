// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAn7V6u1mVWNLyQTT4ZEurO-L0G4DJCf20",
  authDomain: "fincheck-f4528.firebaseapp.com",
  projectId: "fincheck-f4528",
  storageBucket: "fincheck-f4528.firebasestorage.app",
  messagingSenderId: "906114032923",
  appId: "1:906114032923:web:b8a12730eba61f24a21fbe",
  measurementId: "G-6DG3KDPXFZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);