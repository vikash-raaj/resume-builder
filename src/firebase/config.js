import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD-ZmNaD88KcVtO9tJEOEEv81C0nZp6PMw",
  authDomain: "resumecraft-app.firebaseapp.com",
  projectId: "resumecraft-app",
  storageBucket: "resumecraft-app.firebasestorage.app",
  messagingSenderId: "390480725789",
  appId: "1:390480725789:web:601147adebfeef814103f4",
  measurementId: "G-WMJT1EFQ7Z",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
