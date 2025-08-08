// hooks/useAuth.js
import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseConfig";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { ref, set } from "firebase/database";

const saveUserDetails = async (user_id, location, email, first_name, last_name, role) => {
    const userRef = ref(db, "users/" + user_id);
    const now = new Date();
    const offsetDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    set(userRef, {
        email: email,
        first_name: first_name,
        last_name: last_name,
        location: location,
        role: role,
        budget_kwh: 0,
        total_energy_consumption: 0,
        created_at: offsetDate.toISOString(),
        notify_smart_recommendation: false,
        notify_high_usage_alerts: false,
        notify_system_updates: false,
    });
}


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

    const register = useCallback(async (setIsLoading, location, firstName, lastName, email, password) => {
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(res.user, { displayName: firstName });

            await saveUserDetails(res.user.uid, location, email, firstName, lastName, "user");
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
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            Toast.show({
                type: "success",
                text1: "Welcome back!",
                text2: "You are now logged in.",
            });
            setIsLoading(false);
            router.replace("/(tabs)");
        } catch (e) {
            let message = "An error occurred. Please try again.";
            if (e.code === "auth/user-not-found") {
                message = "No user found with this email.";
            } else if (e.code === "auth/invalid-credential") {
                message = "Incorrect email or password.";
            }
            Toast.show({
                type: "error",
                text1: "Login Failed",
                text2: message,
            });
            setIsLoading(false);
        }
    }, [router]);

    const logout = useCallback(async (setIsLoading) => {
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
            setIsLoading(false);
        }
    }, [router]);

    return { user, checkingAuth, logout, login, register };
}
