import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ForgotPassword from "../app/(auth)/forgotPassword/index";


import { generate_otp } from "../services/apiService";

describe("Forgot Password - CASE 011", () => {
    beforeEach(() => jest.clearAllMocks());

    it("should show error message when user enters unregistered email", async () => {
        const { getByPlaceholderText, getByText, findByText } = render(<ForgotPassword />);

        const emailInput = getByPlaceholderText("Enter Email Address");
        fireEvent.changeText(emailInput, "unknown@example.com");

        const sendButton = getByText("Proceed");
        fireEvent.press(sendButton);

        await waitFor(() => {
            expect(generate_otp).toHaveBeenCalledWith("unknown@example.com", false);
        });

        const error = await findByText("Email not found");
        expect(error).toBeTruthy();
    });
});
