import React from "react";
import { render, fireEvent, waitFor, screen, act } from "@testing-library/react-native";
import DeviceDetails from "../app/(tabs)/appliances/[deviceId]/index";
import { get, set } from "firebase/database";

describe("Add Appliance - CASE 038", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    get
      .mockResolvedValueOnce({ exists: () => true }) // "Refrigerator" already exists
      .mockResolvedValueOnce({ exists: () => false }); // "Refrigerator_1" is new
  });

  it("should accept duplicate appliance and rename it with _1 suffix", async () => {
    const { getByTestId, getByText } = render(<DeviceDetails />);

    await waitFor(() => {
      expect(screen.getByTestId("add-appliance-btn")).not.toBeDisabled();
    });
    const addButton = getByTestId("add-appliance-btn");
    fireEvent.press(addButton);

    await waitFor(() => {
      expect(screen.getByTestId("appliance-input")).not.toBeDisabled();
    });
    const input = await screen.findByTestId("appliance-input");
    fireEvent.changeText(input, "Refrigerator");

    const confirmBtn = screen.getByTestId("confirm-add-btn");
    await act(async () => {
      fireEvent.press(confirmBtn);
    });

    await waitFor(() => {
      expect(get).toHaveBeenCalledTimes(2);
      expect(set).toHaveBeenCalled();
    });
  });
});
