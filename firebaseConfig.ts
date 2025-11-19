import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWPS1g6_qTkSvcVyhjk_iuKBS6XtoaD8E",
  authDomain: "ultravolei-3e682.firebaseapp.com",
  projectId: "ultravolei-3e682",
  storageBucket: "ultravolei-3e682.firebasestorage.app",
  messagingSenderId: "786479802744",
  appId: "1:786479802744:web:0a012fc7773c0645fec08d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
