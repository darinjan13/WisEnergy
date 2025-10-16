import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Reports from "../app/(tabs)/reports";
import { useUsageStore } from "@/store/firebaseStore";

// ──────────────── STORE MOCKS ────────────────
jest.mock("@/store/firebaseStore", () => {
    const mockFetchTotals = jest.fn();

    // 🔹 stable references
    const mockDeviceArray = Object.freeze([{ id: "device1", device_nickname: "Device 1" }]);
    const mockApplianceArray = Object.freeze([{ id: "device1", appliances: [] }]);

    return {
        useUsageStore: jest.fn(() => ({
            reportHistory: {},
            fetchTotals: mockFetchTotals,
            fetchAllMonthlyTotalConsumption: jest.fn(),
            dailyTotals: [{ barData: [] }],
            weeklyTotals: [{ barData: [] }],
            monthlyTotals: [{ barData: [] }],
        })),
        useDeviceStore: jest.fn(() => ({
            userDevices: mockDeviceArray,
            userAppliances: mockApplianceArray,
            devices: mockDeviceArray,
        })),
        useBudgetStore: jest.fn(() => ({
            allBudget: [],
            fetchAllBudget: jest.fn(),
        })),
    };
});

jest.mock("react-native-gifted-charts", () => ({
    LineChart: () => null,
    BarChart: () => null, // ✅ add this line
}));
jest.mock("@/firebase/firebaseConfig", () => ({
    auth: { currentUser: { uid: "test-user" } },
}));

jest.mock("react-native-gifted-charts", () => ({
    LineChart: () => null,
}));

jest.spyOn(console, "error").mockImplementation(() => { });

// ──────────────── TEST ────────────────
test("CASE-044: switches between Daily, Weekly, and Monthly categories", async () => {
    const { getByText } = render(<Reports />);
    await waitFor(() => {
        expect(() => getByText("Loading your reports data...")).toThrow();
    });

    fireEvent.press(getByText("Weekly"));
    fireEvent.press(getByText("Monthly"));
    fireEvent.press(getByText("Daily"));

    await waitFor(() => {
        const { useUsageStore } = require("@/store/firebaseStore");
        const store = useUsageStore();
        expect(store.fetchTotals).toHaveBeenCalled();
    });
});
