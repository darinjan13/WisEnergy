import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import CodeVerification from "../app/(auth)/forgotPassword/verification";
import { Alert } from "react-native";
jest.mock("react-native-otp-textinput", () => {
    return ({ handleTextChange }) => {
        handleTextChange("123456");
        return null;
    };
});

jest.mock("../services/apiService", () => ({
    verify_otp: jest.fn((email, code) => {
        if (code === "123456") {
            return Promise.resolve({ success: true });
        }
        return Promise.resolve({ success: false, message: "Invalid OTP" });
    }),
}));

import { verify_otp } from "../services/apiService";
import { router } from "expo-router";

describe("Code Verification - CASE 017", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, "alert").mockImplementation(() => { });
    });

    it("should navigate to reset password when OTP is correct", async () => {
        const { getByText } = render(<CodeVerification />);
        const proceedButton = getByText("Proceed");
        await act(async () => {
            fireEvent.press(proceedButton);
        });
        await waitFor(() => {
            expect(verify_otp).toHaveBeenCalledWith("test@example.com", "123456");
            expect(router.navigate).toHaveBeenCalledWith({
                pathname: "/forgotPassword/resetpassword",
                params: { email: "test@example.com" },
            });
        });
    });
});
