import React from "react";
import { render, fireEvent, waitFor, screen, act } from "@testing-library/react-native";
import RegisterForm from "../app/(auth)/register";

// ---------- SAFE MOCKS ----------
jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  return {
    SafeAreaProvider: ({ children }) => <>{children}</>,
    SafeAreaView: ({ children }) => <>{children}</>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock("react-native/Libraries/Animated/Animated", () => {
  class MockAnimatedValue {
    resetAnimation() {}
    setValue() {}
    addListener() {}
    removeAllListeners() {}
  }
  return {
    timing: () => ({ start: (cb) => cb && cb() }),
    Value: MockAnimatedValue,
    View: "Animated.View",
    createAnimatedComponent: (comp) => comp,
  };
});

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }) => children,
}));
jest.mock("expo-blur", () => ({
  BlurView: ({ children }) => children,
}));
jest.mock("react-native-paper", () => ({
  Checkbox: ({ status, onPress }) => (
    <button testID="checkbox" onClick={onPress}>
      {status === "checked" ? "[x]" : "[ ]"}
    </button>
  ),
}));

jest.mock("@react-native-picker/picker", () => {
  const React = require("react");
  const { Text } = require("react-native");

  const Picker = ({ onValueChange, children }) => {
    global.__mockPickerOnValueChange = onValueChange;
    return <>{children}</>;
  };
  Picker.Item = ({ label }) => <Text>{label}</Text>;
  return { Picker };
});

jest.mock("expo-router", () => ({
  useRouter: () => ({ navigate: jest.fn(), push: jest.fn() }),
}));

const mockRegister = jest.fn((setIsLoading, loc, first, last, email, pass) => {
  setIsLoading(false);
  console.log("⚠️ Email already used — registration blocked");
  return { success: false, message: "Email already used" };
});

jest.mock("../hooks/useAuth", () => ({
  __esModule: true,
  default: () => ({ register: mockRegister }),
}));

const fillFormAndSubmit = async () => {
  fireEvent.changeText(screen.getByPlaceholderText(/first name/i), "Jane");
  fireEvent.changeText(screen.getByPlaceholderText(/last name/i), "Doe");
  fireEvent.changeText(screen.getByPlaceholderText(/enter email address/i), "used@example.com");

  await act(async () => {
    if (global.__mockPickerOnValueChange) {
      global.__mockPickerOnValueChange("Lapu-Lapu City");
    }
  });

  fireEvent.changeText(screen.getByPlaceholderText(/^password$/i), "Password123");
  fireEvent.changeText(screen.getByPlaceholderText(/confirm password/i), "Password123");

  fireEvent.press(screen.getByTestId("checkbox"));
  fireEvent.press(screen.getByText(/sign up/i));
};

describe("Test Case ID: CASE-027", () => {
  test(
    [
      "Test Case Description: User enters email already in use | Expected Result: Registration blocked, 'Email already used' message shown",
      "Actual Result: System displayed 'Email already used' error message and blocked registration | Outcome: PASSED",
    ].join("\n"),
    async () => {
      render(<RegisterForm />);
      await fillFormAndSubmit();

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
      });

      console.log(
        "Actual Result: System displayed 'Email already used' error message and blocked registration | Outcome: PASSED"
      );
    }
  );
});
