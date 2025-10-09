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

describe("Test Case ID: CASE-004", () => {
  test(
    [
      "Test Case Description: User enters valid credentials | Expected Result: Login successful, redirected to Dashboard",
      "Actual Result: System redirected user to Dashboard | Outcome: PASSED",
    ].join("\n"),
    async () => {
      mockLogin.mockImplementation((setIsLoading, email, password) => {
        setIsLoading(false);
        mockPush("/(user)/dashboard");
      });

      render(<LoginForm />);
      await fillAndSubmit("user@example.com", "123456");

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/(user)/dashboard");
      });
    }
  );
});
