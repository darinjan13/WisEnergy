import React from "react";
import { render, fireEvent, waitFor, screen, act } from "@testing-library/react-native";
import DeviceDetails from "../app/(tabs)/appliances/[deviceId]/index";
import Toast from "react-native-toast-message";
jest.mock("@/firebase/firebaseConfig", () => ({
    auth: { currentUser: { uid: "test-user-id" } },
    db: {},
    fs: {},
}));
describe("Add Appliance - CASE 037", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should add appliance successfully and display success Toast", async () => {
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
            expect(Toast.show).toHaveBeenCalled();
        });
    });
});
