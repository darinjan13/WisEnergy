import AsyncStorage from "@react-native-async-storage/async-storage";

import { unregisterPushTokenForUser } from "@/services/pushTokenService";
import { clearStates } from "@/store/firebaseStore";
import { clearCache } from "@/utils/asyncStorageUtils";

export const clearLocalSession = async (userId) => {
  clearStates();
  await unregisterPushTokenForUser(userId);
  await clearCache();
  await AsyncStorage.multiRemove(["rememberedEmail", "rememberedUser"]);
};
