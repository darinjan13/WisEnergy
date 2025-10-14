import { render, fireEvent, waitFor, screen, act } from "@testing-library/react-native";
import Devices from "../app/(tabs)/devices";

describe("Edit Device - CASE 035", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should update the device name successfully with a valid name", async () => {
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
        await act(async () => {
            fireEvent.changeText(deviceNameInput, "Updated Device Name");
        });

        const confirmButton = screen.getByTestId("confirm-button");
        await act(async () => {
            fireEvent.press(confirmButton);
        });

        await waitFor(() => {
            expect(require("react-native-toast-message").default.show).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: "success",
                    text1: "Success",
                    text2: "Device name successfully updated.",
                })
            );
        });
    });
});
