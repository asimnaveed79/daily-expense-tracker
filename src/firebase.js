import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB9ZEVK8fGz_JK25ACj6T3v5WOb3n38Nn4",
  authDomain: "daily-expense-tracker-e2fd1.firebaseapp.com",
  projectId: "daily-expense-tracker-e2fd1",
  storageBucket: "daily-expense-tracker-e2fd1.appspot.com",
  messagingSenderId: "1012253140198",
  appId: "1:1012253140198:web:0c152e54a03a383d783ab6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
