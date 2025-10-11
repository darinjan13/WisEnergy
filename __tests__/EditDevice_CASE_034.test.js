import { render, fireEvent, waitFor, screen, act } from "@testing-library/react-native";
import Devices from "../app/(tabs)/devices";
import Toast from "react-native-toast-message";

jest.mock("react-native-toast-message", () => ({
    show: jest.fn(),
}));

describe("Edit Device - CASE 034", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should block update and show validation error for empty device name", async () => {

        render(<Devices />);

        await waitFor(() => {
            expect(screen.queryByText("Loading...")).toBeNull();
        });

        const editButton = screen.getByTestId("edit-button");
        fireEvent.press(editButton);

        await waitFor(() => {
            expect(screen.getByTestId("modal-title")).toBeTruthy();
            expect(screen.getByText("Edit Device")).toBeTruthy();
            expect(screen.getByTestId("device-name-input")).toBeTruthy();
            expect(screen.getByTestId("confirm-button")).toBeTruthy();
        });

        await waitFor(() => {
            expect(screen.getByTestId("device-name-input")).not.toBeDisabled();
        });
        const deviceNameInput = screen.getByTestId("device-name-input");
        fireEvent.changeText(deviceNameInput, "");

        const confirmButton = screen.getByTestId("confirm-button");
        fireEvent.press(confirmButton);

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: "error",
                    text1: "Error",
                    text2: "Device name cannot be empty."
                })
            );
        });
    });

    it("should block update and show validation error for too long device name", async () => {
        render(<Devices />);

        await waitFor(() => {
            expect(screen.queryByText("Loading...")).toBeNull();
        });

        const editButton = screen.getByTestId("edit-button");
        fireEvent.press(editButton);

        await waitFor(() => {
            expect(screen.getByTestId("modal-title")).toBeTruthy();
            expect(screen.getByText("Edit Device")).toBeTruthy();
            expect(screen.getByTestId("device-name-input")).toBeTruthy();
            expect(screen.getByTestId("confirm-button")).toBeTruthy();
        });

        // Enter too long device name
        await waitFor(() => {
            expect(screen.getByTestId("device-name-input")).not.toBeDisabled();
        });
        const deviceNameInput = screen.getByTestId("device-name-input");
        fireEvent.changeText(deviceNameInput, "A".repeat(101));

        const confirmButton = screen.getByTestId("confirm-button");
        fireEvent.press(confirmButton);

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: "error",
                    text1: "Error",
                    text2: "Device name is too long."
                })
            );
        });
    });
});
