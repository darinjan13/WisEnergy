
import { db } from "@/firebase/firebaseConfig";
import {
    ref,
    query,
    orderByChild,
    limitToLast,
    endAt,
    get,
    update,
    remove,
} from "firebase/database";

export const fetchUserNotifications = async (userId, lastTimestamp, PAGE_SIZE = 10) => {
    try {
        const notifRef = ref(db, `notifications/${userId}`);
        let notifQuery;

        if (lastTimestamp) {
            notifQuery = query(
                notifRef,
                orderByChild("created_at"),
                endAt(lastTimestamp),
                limitToLast(PAGE_SIZE + 1)
            );
        } else {
            notifQuery = query(
                notifRef,
                orderByChild("created_at"),
                limitToLast(PAGE_SIZE)
            );
        }

        const snapshot = await get(notifQuery);
        if (!snapshot.exists()) {
            return { notifications: [], newLastTimestamp: null, hasMore: false };
        }

        const data = snapshot.val();
        const formatted = Object.entries(data).map(([id, item]) => ({
            id,
            title: item.title,
            message: item.message,
            created_at: item.created_at,
            read_at: item.read_at,
            type: item.type || "system",
        }));

        formatted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        const hasMore = formatted.length >= PAGE_SIZE;
        const newLastTimestamp =
            formatted.length > 0
                ? formatted[formatted.length - 1].created_at
                : null;

        return { notifications: formatted, newLastTimestamp, hasMore };
    } catch (error) {
        console.error("⚠️ Error fetching notifications:", error);
        return { notifications: [], newLastTimestamp: null, hasMore: false };
    }
};

export const markAllNotificationsRead = async (userId, notifications = []) => {
    if (!userId || notifications.length === 0) return;
    const updates = {};
    const now = new Date().toISOString();

    notifications.forEach((n) => {
        updates[`notifications/${userId}/${n.id}/read_at`] = now;
    });

    await update(ref(db), updates);
};
export const deleteNotification = async (userId, notifId) => {
    if (!userId || !notifId) return;
    try {
        const notifRef = ref(db, `notifications/${userId}/${notifId}`);
        await remove(notifRef); // ✅ Proper way to delete in Realtime Database
    } catch (e) {
        console.error("⚠️ Failed to delete notification:", e);
    }
};