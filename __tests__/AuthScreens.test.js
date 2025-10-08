import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react-native";
import LoginForm from "../app/(auth)/login";

jest.mock("expo-router", () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("../hooks/useAuth", () => ({
    __esModule: true,
    default: () => ({
        login: jest.fn(),
    }),
}));

describe("Case-001: Login invalid email format", () => {
    test("User enters invalid email format and sees error message", async () => {
        render(<LoginForm />);

        fireEvent.changeText(screen.getByPlaceholderText(/email/i), "invalidEmail");
        fireEvent.changeText(screen.getByPlaceholderText(/password/i), "password123");

        // press the Sign In button (last occurrence)
        fireEvent.press(screen.getAllByText(/sign in/i).pop());

        await waitFor(() =>
            expect(screen.getByText(/email is invalid/i)).toBeTruthy()
        );
    });
});
