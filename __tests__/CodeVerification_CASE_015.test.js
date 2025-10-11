import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import CodeVerification from "../app/(auth)/forgotPassword/verification";
import { Alert } from "react-native";


jest.mock("react-native-otp-textinput", () => {
    return ({ handleTextChange }) => {
        handleTextChange("99999");
        return null;
    };
});

jest.mock("../services/apiService", () => ({
    verify_otp: jest.fn((email, code) => {
        if (code === "12345") return Promise.resolve({ success: true });
        return Promise.resolve({ success: false, message: "Invalid OTP" });
    }),
}));

import { verify_otp } from "../services/apiService";

describe("Code Verification - CASE 015", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, "alert").mockImplementation(() => { });
    });

    it("should show an error alert when user enters incorrect OTP", async () => {
        const { getByText } = render(<CodeVerification />);

        const proceedButton = getByText("Proceed");
        await act(async () => {
            fireEvent.press(proceedButton);
        });

        await waitFor(() => {
            expect(verify_otp).toHaveBeenCalledWith("test@example.com", "99999");
            expect(Alert.alert).toHaveBeenCalledWith("Error", "Invalid OTP");
        });
    });
});
