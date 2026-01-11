// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA90VF05B-VlW946RiTf_JnHLEukaMVhqk",
    authDomain: "fir-3f9c1.firebaseapp.com",
    projectId: "fir-3f9c1",
    storageBucket: "fir-3f9c1.appspot.com",
    messagingSenderId: "943229613492",
    appId: "1:943229613492:web:c2b3c5ed1e222204bdeee1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
