import { handleDeleteConfirmed } from "../app/(tabs)/appliances/[deviceId]/index";
import { ref, remove } from "firebase/database";

jest.mock("firebase/database", () => ({
    ref: jest.fn(() => "mockRef"),
    remove: jest.fn(() => Promise.resolve("deleted")),
}));

test("CASE-041: handleDeleteConfirmed removes appliance in Firebase", async () => {
    const db = {};
    const userId = "test-user";
    const deviceId = "device1";
    const applianceId = "fan";

    const result = await handleDeleteConfirmed(
        userId,
        deviceId,
        applianceId,
        db,
        ref,
        remove
    );

    expect(ref).toHaveBeenCalledWith(db, "appliances/test-user/device1/fan");
    expect(remove).toHaveBeenCalledWith("mockRef");
    expect(result).toBe("mockRef");
});
