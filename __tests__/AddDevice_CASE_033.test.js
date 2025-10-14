import { render, fireEvent, waitFor, screen } from "@testing-library/react-native";
import AddDevice from "../app/(tabs)/devices";
import Toast from "react-native-toast-message";

describe("Add Device - CASE 033", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should successfully add and pair the device with valid credentials", async () => {
        const { getByTestId, getByText } = render(<AddDevice />);

        await waitFor(() => {
            expect(screen.getByTestId("add-btn")).not.toBeDisabled();
        });

        const addButton = getByTestId("add-btn");
        fireEvent.press(addButton);

        await waitFor(() => {
            expect(screen.findByText("Add Device")).toBeTruthy();
        });

        const deviceNameInput = await screen.findByPlaceholderText("Enter Device name");
        fireEvent.changeText(deviceNameInput, "New Device");

        const devicePasswordInput = screen.getByPlaceholderText("Enter Device password");
        fireEvent.changeText(devicePasswordInput, "password123");

        const addButtonModal = getByText("Add");
        fireEvent.press(addButtonModal);

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith(
                expect.objectContaining({
                    text1: "Success",
                    text2: "Device successfully paired!"
                })
            );
        });

        expect(screen.getByTestId('card')).toHaveTextContent('Device Name: New Device');
    });
});
