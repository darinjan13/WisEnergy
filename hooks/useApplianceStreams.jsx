import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef } from "react";
import {
  listenToLatestPower,
  listenToLatestKwh,
} from "../services/firebaseUsageService";
import { format } from "date-fns-tz";

export default function useApplianceStreams({
  appliances,
  userId,
  deviceId,
  setAppliancePower,
  setApplianceKWh,
}) {
  const listenersRef = useRef({});

  useFocusEffect(
    useCallback(() => {
      if (!appliances || appliances.length === 0) return;

      let isActive = true;
      const today = format(new Date(), "yyyy-MM-dd", {
        timeZone: "Asia/Manila",
      });

      const unsubPower = [];
      const unsubKwh = [];

      appliances.forEach((appliance) => {
        if (!isActive) return;

        const u1 = listenToLatestPower(
          userId,
          deviceId,
          appliance.name,
          today,
          (power) => {
            if (!isActive) return;
            setAppliancePower((prev) => ({
              ...prev,
              [deviceId]: {
                ...(prev[deviceId] || {}),
                [appliance.name]: power,
              },
            }));
          }
        );

        const u2 = listenToLatestKwh(
          userId,
          deviceId,
          appliance.name,
          (kwh) => {
            if (!isActive) return;
            setApplianceKWh((prev) => ({
              ...prev,
              [deviceId]: {
                ...(prev[deviceId] || {}),
                [appliance.name]: kwh,
              },
            }));
          }
        );

        unsubPower.push(u1);
        unsubKwh.push(u2);
      });

      return () => {
        isActive = false;
        unsubPower.forEach((fn) => fn && fn());
        unsubKwh.forEach((fn) => fn && fn());
      };
    }, [appliances, userId, deviceId])
  );
}
