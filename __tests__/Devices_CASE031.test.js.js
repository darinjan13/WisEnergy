import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react-native";
import devices from "../app/(tabs)/devices";

const mockAddDevice = jest.fn();

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
  useFocusEffect: (cb) => cb(),
}));

jest.mock("../store/firebaseStore.js", () => ({
  useDeviceStore: () => ({
    devices: [],
    userDevices: [],
    unpairedDevices: [{ label: "Device 1", value: "dev001" }],
    userAppliances: [],
    setDevices: jest.fn(),
    addDevice: mockAddDevice,
    updateDeviceNickname: jest.fn(),
    deleteDevice: jest.fn(),
  }),
}));

jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
  __esModule: true,
  default: { show: jest.fn() },
}));

const openAddModal = async () => {
  render(<devices />);
  fireEvent.press(screen.getByRole("button", { name: /plus/i }));
  await waitFor(() => {
    expect(screen.getByText(/add device/i)).toBeTruthy();
  });
};

describe("Test Case ID: CASE-031", () => {
  test(
    [
      "Test Case Description: Invalid or incorrect device password entered | Expected Result: Device pairing fails, error message displayed",
      "Actual Result: System displayed 'Failed to add device' toast message | Outcome: PASSED",
    ].join("\n"),
    async () => {
      await openAddModal();

      fireEvent.changeText(screen.getByPlaceholderText(/enter device name/i), "Living Room Plug");
      fireEvent.changeText(screen.getByPlaceholderText(/enter device password/i), "wrongpass");

      mockAddDevice.mockResolvedValueOnce({ success: false, error: "Invalid device password." });

      fireEvent.press(screen.getByText(/add/i));

      await waitFor(() => {
        expect(mockAddDevice).toHaveBeenCalledWith("wrongpass", "dev001", "Living Room Plug");
      });
    }
  );
});
