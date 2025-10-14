// hooks/useAuth.js
import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseConfig";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { get, ref, set, update } from "firebase/database";
import { clearStates, useBudgetStore, useDeviceStore, useUsageStore } from "@/store/firebaseStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { generate_otp } from "@/services/apiService";
import { clearCache } from "@/utils/asyncStorageUtils";



export default function useAuth() {
    const [user, setUser] = useState(null);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [pendingDeletionUser, setPendingDeletionUser] = useState(null);
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
            const usersRef = ref(db, "users");
            const snapshot = await get(usersRef);

            let emailExists = false;
            snapshot.forEach(child => {
                if (child.val()?.email?.toLowerCase() === email.toLowerCase()) {
                    emailExists = true;
                }
            });
            
            if (emailExists) {
                setIsLoading(false);
                return { success: false, code: "email-exists" };
            }
            const result = await generate_otp(email, true);

            if (result.success) {
                router.navigate({
                    pathname: '/forgotPassword/verification',
                    params: {
                        email,
                        from: "register",
                        location,
                        firstName,
                        lastName,
                        password
                    },
                });
            } else {
                Toast.show({
                    type: "error",
                    text1: "OTP Failed",
                    text2: result.message || "Unable to send OTP. Please try again.",
                });
                setIsLoading(false);
            }
        } catch (e) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Something went wrong. Please try again.",
            });
            setIsLoading(false);
        }
    }, [router]);

    const login = useCallback(async (setIsLoading, email, password, rememberMe) => {
        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 🔍 Check if account is flagged for deletion
            const userRef = ref(db, `users/${user.uid}/deletion_date`);
            const snapshot = await get(userRef);
            console.log(snapshot);


            if (snapshot.exists()) {
                setPendingDeletionUser({ uid: user.uid, email: user.email });
                setIsLoading(false);
                return;
            }
            Toast.show({
                type: "success",
                text1: "Welcome back!",
                text2: "You are now logged in.",
            });
            if (rememberMe)
                await AsyncStorage.setItem('rememberedUser', JSON.stringify({ email, password }))
            else
                await AsyncStorage.removeItem('rememberedUser')
            setIsLoading(false);
            router.replace("/(tabs)/dashboard");
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
            clearStates();
            // clearCache();
            await AsyncStorage.removeItem('rememberedUser')
            await signOut(auth);
            router.replace("/(auth)/login");
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
    const cancelDeletionAndProceed = async (userId) => {
        try {
            await update(ref(db, `users/${userId}`), { deletion_date: null });
            Toast.show({
                type: "info",
                text1: "Deletion Canceled",
                text2: "Your account is active again.",
            });
            router.replace("/(tabs)/dashboard");
        } catch (err) {
            console.error("Failed to cancel deletion:", err);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Could not cancel deletion. Please try again.",
            });
        }
    };

    return { user, checkingAuth, logout, login, register, pendingDeletionUser, setPendingDeletionUser, cancelDeletionAndProceed };
}
