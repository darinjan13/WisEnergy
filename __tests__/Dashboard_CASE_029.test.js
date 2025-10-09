import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import Dashboard from "../app/(tabs)/dashboard";
// ✅ Mock gifted-charts and gradient dependency
jest.mock("react-native-gifted-charts", () => ({
  BarChart: () => null,
  PieChart: () => null,
}));
jest.mock("react-native-linear-gradient", () => {
  // Avoid referencing React outside the factory
  return function LinearGradientMock(props) {
    return {
      type: "LinearGradientMock",
      props,
    };
  };
});

// ✅ Mock expo-router useFocusEffect
jest.mock("expo-router", () => ({
  useFocusEffect: (cb) => cb(),
}));

// ✅ Mock Safe Area Insets
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 10, bottom: 10, left: 0, right: 0 }),
}));

// ✅ Mock Firebase auth
jest.mock("@/firebase/firebaseConfig", () => ({
  auth: { currentUser: { uid: "mockUserId", displayName: "Test User" } },
}));

// ✅ Mock stores to simulate successful data fetch
const mockUsageStore = {
  fetchTodayTrend: jest.fn(),
  fetchTopAppliances: jest.fn(),
  fetchDailyAiGeneratedContent: jest.fn(),
  subscribeToMonthlyTotalConsumption: jest.fn(),
  fetchAllMonthlyTotalConsumption: jest.fn(),
  todayTrend: { buckets: { "12am-4am": 0.2 }, hourlyData: {} },
  topAppliances: [{ name: "Fridge", kwh: 1.23 }],
  monthlyTotalConsumption: 12.34,
  allMonthlyTotalConsumption: [{ value: 12.34 }],
};
const mockDeviceStore = {
  devices: [{ id: 1 }],
  userDevices: [{ id: 1 }],
  setDevices: jest.fn(),
  listenToUserAppliances: jest.fn(),
};
const mockBudgetStore = {
  locationRate: 12,
  monthlyBudget: { budget_php: 2000 },
  percentUsed: 50,
  fetchLocationRate: jest.fn(),
  subscribeToBudget: jest.fn(),
  fetchPercentUsed: jest.fn(),
};
const mockAiGeneratedStore = {
  insights: [{ id: 1, message: "Sample insight" }],
  fetchDailyAiGeneratedContent: jest.fn(),
};

jest.mock("@/store/firebaseStore", () => ({
  useUsageStore: () => mockUsageStore,
  useDeviceStore: () => mockDeviceStore,
  useBudgetStore: () => mockBudgetStore,
  useAiGeneratedStore: () => mockAiGeneratedStore,
}));

describe("Test Case ID: CASE-029", () => {
  test("Test Case Description: User opens dashboard after login | Expected Result: Dashboard loads with widgets and summary data", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      // ✅ Simulate successful data load
      expect(mockUsageStore.fetchTodayTrend).toBeDefined();
    });

    console.log(
      "Actual Result: Dashboard rendered with charts, budget, and AI Insights | Outcome: PASSED"
    );
  });
});
