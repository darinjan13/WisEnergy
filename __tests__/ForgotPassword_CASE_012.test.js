jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  return {
    SafeAreaProvider: ({ children }) => <>{children}</>,
    SafeAreaView: ({ children }) => <>{children}</>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react-native";
import ForgotPasswordScreen from "../app/(auth)/forgotPassword";
import { router } from "expo-router";
import { generate_otp } from "../services/apiService"; // ✅ Correct path

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

describe("Test Case ID: CASE-012", () => {
  test(
    [
      "Test Case Description: User enters valid registered email | Expected Result: OTP sent successfully",
      "Actual Result: System generated OTP and redirected user to Code Verification screen | Outcome: PASSED",
    ].join("\n"),
    async () => {
      generate_otp.mockResolvedValueOnce({
        success: true,
        message: "OTP sent successfully",
      });

      render(<ForgotPasswordScreen />);
      await fillAndSubmit("registered@example.com");

      await waitFor(() => {
        expect(generate_otp).toHaveBeenCalledWith("registered@example.com", false);
        expect(router.navigate).toHaveBeenCalledWith({
          pathname: "/forgotPassword/verification",
          params: { email: "registered@example.com", from: "forgotPassword" },
        });
      });
    }
  );
});
