import { render, fireEvent, waitFor, screen } from "@testing-library/react-native";
import BudgetModal from "../components/budget/SetBudget";
import { Alert } from "react-native";

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => { });

describe("Case 47: User sets a valid monthly budget on the 1st day of the month", () => {
  it("should successfully set a valid budget on the 1st day of the month", async () => {
    render(<BudgetModal visible={true} onClose={() => { }} rate={10} />);

    await waitFor(() => {
      expect(screen.findByText("Set Monthly Budget")).toBeTruthy();
    });
    const input = screen.getByPlaceholderText("Enter amount");
    expect(input).toBeTruthy();
    fireEvent.changeText(input, "500");

    await waitFor(() => {
      expect(screen.getByTestId("set-budget")).not.toBeDisabled();
    });
    const setButton = screen.getByTestId("set-budget");
    fireEvent.press(setButton);


    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Success", "Budget successfully saved!", [
        { text: "OK", onPress: expect.any(Function) }
      ]);
    });
  });
});
