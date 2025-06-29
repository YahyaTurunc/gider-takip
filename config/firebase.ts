// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCKbgHTyPVTwEGmyEIikz5HuHS7SNbK14A",
    authDomain: "gider-takip-8ebd5.firebaseapp.com",
    projectId: "gider-takip-8ebd5",
    storageBucket: "gider-takip-8ebd5.firebasestorage.app",
    messagingSenderId: "194994651958",
    appId: "1:194994651958:web:1caf6759d52aef7d3ca997"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//auth
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
})

//db
export const firestore = getFirestore(app)