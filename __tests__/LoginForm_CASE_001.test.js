import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react-native";
import LoginForm from "../app/(auth)/login";

const mockPush = jest.fn();
const mockLogin = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("../hooks/useAuth", () => ({
  __esModule: true,
  default: () => ({ login: mockLogin }),
}));

const fillAndSubmit = async (email, password) => {
  if (email !== undefined)
    fireEvent.changeText(screen.getByPlaceholderText(/email/i), email);
  if (password !== undefined)
    fireEvent.changeText(screen.getByPlaceholderText(/password/i), password);
  fireEvent.press(screen.getAllByText(/sign in/i).pop());
};

describe("Test Case ID: CASE-001", () => {
  test(
    [
      "Test Case Description: User enters invalid email format | Expected Result: Login fails with 'Email is invalid' error message",
      "Actual Result: System displayed 'Email is invalid' error message | Outcome: PASSED",
    ].join("\n"),
    async () => {
      render(<LoginForm />);
      await fillAndSubmit("invalidEmail", "123456");

      await waitFor(() => {
        expect(screen.getByText(/email is invalid/i)).toBeTruthy();
      });
    }
  );
});
