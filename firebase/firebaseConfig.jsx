// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/set up#available-libraries

// Your web app's Firebase configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyDvCUv0x37YuGVVFf5QXx3ZrEVzvg3IdBg",
//     authDomain: "capstone-238eb.firebaseapp.com",
//     databaseURL: "https://capstone-238eb-default-rtdb.asia-southeast1.firebasedatabase.app",
//     projectId: "capstone-238eb",
//     storageBucket: "capstone-238eb.firebasestorage.app",
//     messagingSenderId: "194791722201",
//     appId: "1:194791722201:web:48d65963e17129928582c8"
// };
const firebaseConfig = {
  apiKey: "AIzaSyCQo3xeVJe8zhfmzO6SdA2A-jmmJKMPMfc",
  authDomain: "wisenergy-11737.firebaseapp.com",
  databaseURL: "https://wisenergy-11737-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wisenergy-11737",
  storageBucket: "wisenergy-11737.firebasestorage.app",
  messagingSenderId: "487471591216",
  appId: "1:487471591216:web:c0810e520b8b633c96a2f5",
  measurementId: "G-WBF6EBY2YY"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getDatabase(app);
export const fs = getFirestore(app)
