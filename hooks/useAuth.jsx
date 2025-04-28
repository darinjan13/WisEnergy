// hooks/useAuth.js
import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { Alert } from "react-native";

export default function useAuth() {
    const [user, setUser] = useState(null);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
            setUser(firebaseUser);
            setCheckingAuth(false);
        });
        return unsubscribe;
    }, []);

    const register = useCallback(async (setIsLoading, firstName, email, password) => {
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(res.user, { displayName: firstName });
            Toast.show({
                type: "success",
                text1: "Registration Successful",
                text2: "You can now log in.",
            });
            router.replace("/(auth)/login");
        } catch (e) {
            let message = "An error occurred. Please try again.";
            if (e.code === "auth/email-already-in-use") {
                message = "This email is already in use.";
            } else if (e.code === "auth/weak-password") {
                message = "Password should be at least 6 characters.";
            }
            Toast.show({
                type: "error",
                text1: "Registration Failed",
                text2: message,
            });
            setIsLoading(false);
        }
    }, [router]);

    const login = useCallback(async (setIsLoading, email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            Toast.show({
                type: "success",
                text1: "Welcome back!",
                text2: "You are now logged in.",
            });
            router.replace("/(tabs)");
        } catch (e) {
            let message = "An error occurred. Please try again.";
            if (e.code === "auth/user-not-found") {
                message = "No user found with this email.";
            } else if (e.code === "auth/wrong-password") {
                message = "Incorrect password.";
            }
            Toast.show({
                type: "error",
                text1: "Login Failed",
                text2: message,
            });
            setIsLoading(false);
        }
    }, [router]);

    const logout = useCallback(async () => {
        try {
            router.replace("/(auth)/login");
            await signOut(auth);
            Toast.show({
                type: "success",
                text1: "Logged out",
                text2: "You’ve been safely signed out.",
            });
        } catch (error) {
            console.error("Logout failed:", error);
            Toast.show({
                type: "error",
                text1: "Logout failed",
                text2: error.message,
            });
        }
    }, [router]);

    return { user, checkingAuth, logout, login, register };
}
