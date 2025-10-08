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

describe("Authentication Module Unit Tests", () => {
    test("Case-001: Login fails with invalid email", async () => {
        render(<LoginForm />);

        fireEvent.changeText(screen.getByPlaceholderText(/email/i), "invalidEmail");

        // press the actual Sign In button (last occurrence)
        fireEvent.press(screen.getAllByText(/sign in/i).pop());

        await waitFor(() =>
            expect(screen.getByText(/email is invalid/i)).toBeTruthy()
        );
    });
});
