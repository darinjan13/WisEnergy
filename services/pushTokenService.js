import AsyncStorage from "@react-native-async-storage/async-storage";
import { get, ref, set } from "firebase/database";

import { db } from "@/firebase/firebaseConfig";

export const PUSH_TOKEN_STORAGE_KEY = "expoPushToken";

export const getStoredPushToken = async () =>
  AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);

export const persistPushToken = async (token) => {
  if (token) {
    await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
  }
};

export const unregisterPushTokenForUser = async (userId) => {
  if (!userId) return;

  try {
    const token = await getStoredPushToken();
    if (!token) return;

    const tokensRef = ref(db, `tokens/${userId}`);
    const snap = await get(tokensRef);
    const tokens = snap.exists() && Array.isArray(snap.val()) ? snap.val() : [];
    const nextTokens = tokens.filter((value) => value !== token);

    await set(tokensRef, nextTokens);
  } catch (err) {
    console.error("Failed to remove push token:", err.message);
  }
};

export const registerPushTokenForUser = async (userId, token) => {
  if (!userId || !token) return;

  const tokensRef = ref(db, `tokens/${userId}`);
  const snap = await get(tokensRef);
  const tokens = snap.exists() && Array.isArray(snap.val()) ? snap.val() : [];

  if (!tokens.includes(token)) {
    await set(tokensRef, [...tokens, token]);
  }
};
