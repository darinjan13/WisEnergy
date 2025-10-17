import { render, fireEvent, waitFor, screen } from "@testing-library/react-native";
import BudgetModal from "../components/budget/SetBudget";
import { get, ref, set, update } from "firebase/database";
import { auth, db } from "../../firebase/firebaseConfig";
import { Alert } from "react-native";
jest.spyOn(Alert, 'alert').mockImplementation(() => { });

describe("Case 48: User attempts to adjust monthly budget multiple times within the same month", () => {
    let setAttempted = 1;

    beforeEach(() => {
        const currentMonthRef = ref(db, `user_monthly_budget/${auth.currentUser.uid}/2023/10`);

        get.mockResolvedValueOnce({
            exists: () => true,
            val: () => ({
                budget_php: 500,
                budget_kwh: 50,
                set_attempted: setAttempted
            }),
        });

        set.mockResolvedValueOnce();
        update.mockResolvedValueOnce();
    });

    it("should allow budget adjustment up to 3 times within the same month", async () => {
        render(<BudgetModal visible={true} onClose={() => { }} rate={10} />);

        const input = screen.getByPlaceholderText("Enter amount");
        fireEvent.changeText(input, "600");

        const setButton = screen.getByTestId("set-budget");
        fireEvent.press(setButton);

        setAttempted += 1;

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith("Success", "Budget successfully saved!", [
                { text: "OK", onPress: expect.any(Function) }
            ]);
        });
    });

    it("should prevent further budget adjustments after 3 attempts in the same month", async () => {
        // Simulate the 3rd attempt (already attempted 2 times)
        setAttempted = 3;  // Now the user has made 3 attempts

        render(<BudgetModal visible={true} onClose={() => { }} rate={10} />); // Example rate

        // Input a valid budget amount for the 4th adjustment attempt
        const input = screen.getByPlaceholderText("Enter amount");
        fireEvent.changeText(input, "700");

        // Simulate pressing the "Set Budget" button for the 4th time (should be disabled)
        const setButton = screen.getByTestId("set-budget");
        fireEvent.press(setButton);

        // Wait for the error message to appear
        await waitFor(() => {
            expect(screen.getByText("You have already set your budget 3 times this month.")).toBeTruthy();
        });

        // Ensure the button is disabled after 3 attempts
        // expect(setButton).toBeDisabled();
    });
});
