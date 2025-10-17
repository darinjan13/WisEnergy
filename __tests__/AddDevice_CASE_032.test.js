import { render, fireEvent, waitFor, screen } from "@testing-library/react-native";
import AddDevice from "../app/(tabs)/devices";
import Toast from "react-native-toast-message";

jest.mock("react-native-toast-message", () => ({
    show: jest.fn(),
}));

describe("Add Device - CASE 032", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should prevent duplicate device entry and show an error message", async () => {
        const { getByTestId, getByText } = render(<AddDevice />);

        await waitFor(() => {
            expect(screen.getByTestId("add-btn")).not.toBeDisabled();
        });

        const addButton = getByTestId("add-btn");
        fireEvent.press(addButton);

        await screen.findByText("Add Device");

        const deviceNameInput = await screen.findByPlaceholderText("Enter Device name");
        fireEvent.changeText(deviceNameInput, "Test Device");

        const devicePasswordInput = screen.getByPlaceholderText("Enter Device password");
        fireEvent.changeText(devicePasswordInput, "password123");

        const addButtonModal = getByText("Add");
        fireEvent.press(addButtonModal);

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith(
                expect.objectContaining({ text1: "Success", text2: "Device successfully paired!" })
            );
        });

        fireEvent.press(addButton);

        await screen.findByText("Add Device");

        fireEvent.changeText(deviceNameInput, "Test Device");
        fireEvent.changeText(devicePasswordInput, "password123");

        fireEvent.press(addButtonModal);
        console.log("!st1");

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith(
                expect.objectContaining({
                    text1: "Error",
                    text2: "A device with this name already exists."
                })
            );
        }, { timeout: 3000 });
        expect(Toast.show).toHaveBeenCalledTimes(2);
    });
});
