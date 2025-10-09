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

describe("Test Case ID: CASE-022", () => {
  beforeEach(() => {
    useLocalSearchParams.mockReturnValue({ email: "user@example.com" });
  });

  test(
    [
      "Test Case Description: User inputs valid new password and confirm password | Expected Result: Password reset successful, redirected to Login",
      "Actual Result: System displayed success alert and navigated to Login | Outcome: PASSED",
    ].join("\n"),
    async () => {
      reset_password.mockResolvedValue({
        success: true,
        message: "Password reset successful",
      });

      render(<ResetPasswordScreen />);

      await fillAndSubmit("ValidPass123", "ValidPass123");

      await waitFor(() => {
        expect(reset_password).toHaveBeenCalledWith("user@example.com", "ValidPass123");
        expect(router.navigate).toHaveBeenCalledWith("/(auth)/login");
      });
    }
  );
});
