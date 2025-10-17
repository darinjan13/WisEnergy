import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ForgotPassword from "../app/(auth)/forgotPassword/index";

import { generate_otp } from "../services/apiService";
import { router } from "expo-router";

describe("Forgot Password - CASE 012", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should send OTP successfully and redirect to verification screen", async () => {
    const { getByPlaceholderText, getByText } = render(<ForgotPassword />);

    const emailInput = getByPlaceholderText("Enter Email Address");
    fireEvent.changeText(emailInput, "darinjan13@gmail.com");

    const sendButton = getByText("Proceed");
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(generate_otp).toHaveBeenCalledWith("darinjan13@gmail.com", false);
      expect(router.navigate).toHaveBeenCalledWith({
        pathname: "/forgotPassword/verification",
        params: {
          email: "darinjan13@gmail.com",
          from: "forgotPassword",
        },
      });
    });
  });
});
