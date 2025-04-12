import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD3jMdSfsb_aclnlN4AB6Nbf9IckJ16TrE",
  authDomain: "daily-expense-tracker-8a732.firebaseapp.com",
  projectId: "daily-expense-tracker-8a732",
  storageBucket: "daily-expense-tracker-8a732.appspot.com",
  messagingSenderId: "20751590124",
  appId: "1:20751590124:web:8475e9e959519eadcafbc9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
