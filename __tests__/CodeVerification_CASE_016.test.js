import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import CodeVerification from "../app/(auth)/forgotPassword/verification";
import { Alert } from "react-native";


jest.mock("react-native-otp-textinput", () => {
    return ({ handleTextChange }) => {
        handleTextChange("expired");
        return null;
    };
});

jest.mock("../services/apiService", () => ({
    verify_otp: jest.fn((email, code) => {
        if (code === "expired") {
            return Promise.resolve({
                success: false,
                message: "OTP expired. Please request a new one.",
            });
        }
        return Promise.resolve({ success: true });
    }),
}));

import { verify_otp } from "../services/apiService";

describe("Code Verification - CASE 016", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, "alert").mockImplementation(() => { });
    });

    it('should show "OTP expired" alert when user enters expired code', async () => {
        const { getByText } = render(<CodeVerification />);

        // Press the Proceed button
        const proceedButton = getByText("Proceed");
        await act(async () => {
            fireEvent.press(proceedButton);
        });

        await waitFor(() => {
            expect(verify_otp).toHaveBeenCalledWith("test@example.com", "expired");
            expect(Alert.alert).toHaveBeenCalledWith(
                "Error",
                "OTP expired. Please request a new one."
            );
        });
    });
});
