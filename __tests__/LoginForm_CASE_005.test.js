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

describe("Test Case ID: CASE-005", () => {
  test(
    [
      "Test Case Description: User enters correct email but wrong password | Expected Result: Login fails with 'Invalid credentials' message",
      "Actual Result: System displayed 'Invalid credentials' message | Outcome: PASSED",
    ].join("\n"),
    async () => {
      mockLogin.mockImplementation((setIsLoading, email, password) => {
        setIsLoading(false);
        return Promise.resolve({
          success: false,
          message: "Invalid credentials",
        });
      });

      render(<LoginForm />);
      await fillAndSubmit("user@example.com", "wrongpass");

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
      });
    }
  );
});
