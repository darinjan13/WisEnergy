import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig"; // Adjust the path based on your setup
import { router } from "expo-router";

export const handleLogout = async () => {
    try {
        await signOut(auth);
        router.replace("/login"); // Redirect to login after logout
    } catch (error) {
        console.error("Logout failed:", error.message);
    }
};