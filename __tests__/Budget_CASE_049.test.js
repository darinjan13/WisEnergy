import { render, fireEvent, waitFor, screen } from "@testing-library/react-native";
import BudgetModal from "../components/budget/SetBudget";
import { set, } from "firebase/database";
import { Alert } from "react-native";

jest.spyOn(Alert, "alert").mockImplementation(() => { });

jest.mock("firebase/database", () => ({
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  ref: jest.fn((_db, path) => path),
}));

describe("Case 49: User enters invalid or empty budget input", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show an error if the budget field is empty", async () => {
    render(<BudgetModal visible={true} onClose={() => { }} rate={10} />);

    const setButton = screen.getByTestId("set-budget");
    fireEvent.press(setButton);

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid budget amount.")).toBeTruthy();
    });

    expect(set).not.toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it("should show an error if user enters a non-numeric value", async () => {
    render(<BudgetModal visible={true} onClose={() => { }} rate={10} />);

    const input = screen.getByPlaceholderText("Enter amount");
    fireEvent.changeText(input, "abc"); // invalid input

    const setButton = screen.getByTestId("set-budget");
    fireEvent.press(setButton);

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid budget amount.")).toBeTruthy();
    });

    expect(set).not.toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it("should show an error if user enters 0 or negative amount", async () => {
    render(<BudgetModal visible={true} onClose={() => { }} rate={10} />);

    const input = screen.getByPlaceholderText("Enter amount");
    fireEvent.changeText(input, "0"); // invalid numeric input
    const setButton = screen.getByTestId("set-budget");
    fireEvent.press(setButton);

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid budget amount.")).toBeTruthy();
    });

    expect(set).not.toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });
});
