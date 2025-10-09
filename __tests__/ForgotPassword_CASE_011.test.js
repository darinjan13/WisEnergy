// Disable Safe Area + Animated internals
jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  return {
    SafeAreaProvider: ({ children }) => <>{children}</>,
    SafeAreaView: ({ children }) => <>{children}</>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock("react-native/Libraries/Animated/Animated", () => {
  const ActualAnimated = jest.requireActual("react-native").Animated || {};
  return {
    ...ActualAnimated,
    timing: () => ({
      start: (cb) => cb && cb(),
    }),
  };
});

import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react-native";
import ForgotPasswordScreen from "../app/(auth)/forgotPassword";
import { router } from "expo-router";
import { generate_otp } from "../services/apiService";

jest.mock("expo-router", () => ({
  router: { navigate: jest.fn(), back: jest.fn() },
}));

jest.mock("../services/apiService", () => ({
  generate_otp: jest.fn(),
}));

const fillAndSubmit = async (email) => {
  fireEvent.changeText(screen.getByPlaceholderText(/enter email/i), email);
  fireEvent.press(screen.getByText(/proceed/i));
};

describe("Test Case ID: CASE-011", () => {
  test(
    [
      "Test Case Description: User enters unregistered email | Expected Result: OTP not sent",
      "Actual Result: System displayed 'Email not found' and OTP was not sent | Outcome: PASSED",
    ].join("\n"),
    async () => {
      generate_otp.mockResolvedValueOnce({
        success: false,
        message: "Email not found",
      });

      render(<ForgotPasswordScreen />);
      await fillAndSubmit("unknown@example.com");

      await waitFor(() => {
        expect(generate_otp).toHaveBeenCalledWith("unknown@example.com", false);
        expect(screen.getByText(/email not found/i)).toBeTruthy();
        expect(router.navigate).not.toHaveBeenCalled();
      });
    }
  );
});
