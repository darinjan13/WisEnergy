import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { listenToLatestPower, listenToLatestKwh } from "../services/firebaseUsageService";

export default function useApplianceStreams({ appliances, userId, deviceId, setAppliancePower, setApplianceKWh }) {
    useFocusEffect(
        useCallback(() => {
            if (!appliances || appliances.length === 0) return;
            const today = new Date().toLocaleString("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" });
            const unsubPowers = appliances.map(appliance =>
                listenToLatestPower(
                    userId,
                    deviceId,
                    appliance.name,
                    today,
                    (power) => {
                        setAppliancePower(prev => ({
                            ...prev,
                            [deviceId]: {
                                ...(prev[deviceId] || {}),
                                [appliance.name]: power
                            }
                        }));
                    }
                )
            );

            // const unsubKwhs = appliances.map(appliance =>
            //     listenToLatestKwh(
            //         userId,
            //         deviceId,
            //         appliance.name,
            //         (kwh) => {
            //             setApplianceKWh(prev => ({
            //                 ...prev,
            //                 [appliance.name]: kwh
            //             }));
            //         }
            //     )
            // );

            return () => {
                unsubPowers.forEach(unsub => unsub && unsub());
                // unsubKwhs.forEach(unsub => unsub && unsub());
            };
        }, [appliances, userId, deviceId, setAppliancePower, setApplianceKWh])
    );
}