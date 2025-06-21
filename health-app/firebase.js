// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyApkGewTUjNSGF4hLGZmPFZR45aStKzn_M",
  authDomain: "life-record-1cbf6.firebaseapp.com",
  projectId: "life-record-1cbf6",
  storageBucket: "life-record-1cbf6.appspot.com",
  messagingSenderId: "532855270423",
  appId: "1:532855270423:web:25b33a3219a378d9b10052",
  measurementId: "G-MQKRQ800LR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
