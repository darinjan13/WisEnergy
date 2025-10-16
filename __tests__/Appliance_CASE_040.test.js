import { validateNickname } from "../utils/validateNickname";
import Toast from "react-native-toast-message";

jest.mock("react-native-toast-message", () => ({
    __esModule: true,
    default: { show: jest.fn() },
}));

test("CASE-040: validateNickname blocks long or invalid nicknames", () => {
    // too long nickname
    const result1 = validateNickname("SuperLongName123");
    expect(result1).toBe(false);
    expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
            type: "error",
            text1: "Nickname Too Long",
        })
    );

    // invalid nickname
    const result2 = validateNickname("@@@###");
    expect(result2).toBe(false);
    expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
            type: "error",
            text1: "Invalid Nickname",
        })
    );

    // valid nickname
    const result3 = validateNickname("Fan_01");
    expect(result3).toBe(true);
});
