import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ref, onValue, off } from "firebase/database";
import { db } from "../firebase/firebaseConfig";
import { streamLiveKWh } from "../utils/energy";

export const useApplianceStreams = (isLoading, appliancesData, userId, setAppliancePower, setApplianceKWH) => {
    useFocusEffect(

        useCallback(() => {
            if (isLoading) return;

            const usageRefs = [];
            const unsubKwhList = [];

            appliancesData?.forEach((device) => {

                const deviceId = device.id;
                const applianceName = device.name;
                const usageRef = ref(db, `usage/${userId}/${deviceId}/${applianceName.replace(/ /g, "_")}`);
                usageRefs.push(usageRef);

                const listener = onValue(usageRef, (applianceSnap) => {
                    let latestDate = "";
                    applianceSnap.forEach((dateSnap) => {
                        if (!latestDate || dateSnap.key > latestDate) latestDate = dateSnap.key;
                    });

                    let power = 0;
                    if (latestDate) {
                        let latestTime = "";
                        const dateSnap = applianceSnap.child(latestDate);
                        dateSnap.forEach((timeSnap) => {
                            if (!latestTime || timeSnap.key > latestTime) {
                                latestTime = timeSnap.key;
                                power = timeSnap.val().power || 0;
                            }
                        });

                        if (latestTime) {
                            const [h, m, s] = latestTime.split("_").map(Number);
                            const ts = new Date(`${latestDate}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
                            const diffSeconds = (Date.now() - ts.getTime()) / 1000;
                            if (diffSeconds > 5) power = 0;
                        }
                    }

                    setAppliancePower((prev) => ({
                        ...prev,
                        [applianceName]: power
                    }));
                });

                const unsub = streamLiveKWh(userId, deviceId, applianceName, setApplianceKWH);

                unsubKwhList.push(unsub);
            });

            return () => {
                usageRefs.forEach((r) => off(r));
                unsubKwhList.forEach((unsub) => unsub());
                console.log("Cleaned up appliance streams");
            };
        }, [userId, isLoading])
    );
};
