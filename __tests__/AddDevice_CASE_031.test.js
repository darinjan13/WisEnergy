import { render, fireEvent, waitFor, screen } from "@testing-library/react-native";
import AddDevice from "../app/(tabs)/devices";
import Toast from "react-native-toast-message";


describe("Add Device - CASE 031", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fail when empty or invalid device name is entered", async () => {
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

        if (!deviceNameInput) {
            screen.debug();
        }

        expect(deviceNameInput).toBeTruthy();

        fireEvent.changeText(deviceNameInput, "");

        const addButtonModal = getByText("Add");
        fireEvent.press(addButtonModal);

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith(
                expect.objectContaining({ text1: "Error", text2: "Invalid device name." })
            );
        });
    });
});
