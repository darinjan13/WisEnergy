import { render, fireEvent, waitFor, screen, act } from "@testing-library/react-native";
import Devices from "../app/(tabs)/devices";

describe("Delete Device - CASE 036", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should successfully delete a device", async () => {
        render(<Devices />);

        await waitFor(() => {
            expect(screen.queryByText("Loading...")).toBeNull();
        });

        const deleteButton = screen.getByTestId("delete-button");
        fireEvent.press(deleteButton);
        await waitFor(() => {
            expect(screen.getByText("Are you sure you want to delete this device? This action cannot be undone.")).toBeTruthy();
            expect(screen.getByText("Cancel")).toBeTruthy();
            expect(screen.getByText("Delete")).toBeTruthy();
        });

        const confirmDeleteButton = screen.getByText("Delete");
        fireEvent.press(confirmDeleteButton);

        await waitFor(() => {
            expect(require("react-native-toast-message").default.show).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: "success",
                    text1: "Deleted",
                    text2: "Device successfully unpaired.",
                })
            );
        });
    });
});
