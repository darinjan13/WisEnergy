// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/set up#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDvCUv0x37YuGVVFf5QXx3ZrEVzvg3IdBg",
    authDomain: "capstone-238eb.firebaseapp.com",
    databaseURL: "https://capstone-238eb-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "capstone-238eb",
    storageBucket: "capstone-238eb.firebasestorage.app",
    messagingSenderId: "194791722201",
    appId: "1:194791722201:web:48d65963e17129928582c8"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
