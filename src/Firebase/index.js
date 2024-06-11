import { initializeApp } from "firebase/app";
// eslint-disable-next-line 
import { getStorage, ref } from "firebase/storage";
// eslint-disable-next-line 
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDnoWpAlWc7GP5F_fmf1U8Jzxfe1k6WVvk",
    authDomain: "rexmailerdatabase.firebaseapp.com",
    projectId: "rexmailerdatabase",
    storageBucket: "rexmailerdatabase.appspot.com",
    messagingSenderId: "1005833461498",
    appId: "1:1005833461498:web:0894ebd6d11fffd7893343",
    measurementId: "G-CKYEB7NB3Y"
};


const app = initializeApp(firebaseConfig);

const storage = getStorage(app);
const db = getFirestore(app);
// eslint-disable-next-line
const auth = getAuth(app);

export { app, db, storage,auth };

