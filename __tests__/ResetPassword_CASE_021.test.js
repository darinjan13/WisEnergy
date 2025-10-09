jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  return {
    SafeAreaProvider: ({ children }) => <>{children}</>,
    SafeAreaView: ({ children }) => <>{children}</>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock("react-native/Libraries/Animated/Animated", () => {
  class MockAnimatedValue {
    resetAnimation() {} 
    setValue() {}
    addListener() {}
    removeAllListeners() {}
  }

  return {
    timing: () => ({ start: (cb) => cb && cb() }),
    Value: MockAnimatedValue,
    View: "Animated.View",
  };
});

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }) => children,
}));

import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react-native";
import ResetPasswordScreen from "../app/(auth)/forgotPassword/resetpassword";
import { router, useLocalSearchParams } from "expo-router";
import { reset_password } from "../services/apiService";

jest.mock("expo-router", () => ({
  router: { navigate: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));

jest.mock("../services/apiService", () => ({
  reset_password: jest.fn(),
}));

const fillAndSubmit = async (pass, confirm) => {
  fireEvent.changeText(screen.getByPlaceholderText(/enter password/i), pass);
  fireEvent.changeText(screen.getByPlaceholderText(/confirm password/i), confirm);
  fireEvent.press(screen.getByText(/update password/i));
};

describe("Test Case ID: CASE-021", () => {
  beforeEach(() => {
    useLocalSearchParams.mockReturnValue({ email: "user@example.com" });
  });

  test(
    [
      "Test Case Description: User inputs mismatched new and confirm password | Expected Result: Reset fails with error message",
      "Actual Result: System displayed 'Passwords do not match' and prevented reset | Outcome: PASSED",
    ].join("\n"),
    async () => {
      render(<ResetPasswordScreen />);

      await fillAndSubmit("Password123", "Mismatch321");

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeTruthy();
        expect(reset_password).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
      });
    }
  );
});
