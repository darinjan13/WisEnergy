import React from "react";
import { render, fireEvent, waitFor, screen, act } from "@testing-library/react-native";
import DeviceDetails from "../app/(tabs)/appliances/[deviceId]/index";
import Toast from "react-native-toast-message";
import { get, set } from "firebase/database";
jest.mock("@/components/appliances/AddApplianceModal", () => {
    const React = require("react");
    const { View, TouchableOpacity, Text } = require("react-native");

    return ({ visible, onAdd }) =>
        visible ? (
            <View testID="add-modal">
                <TouchableOpacity
                    testID="confirm-add-btn"
                    onPress={() =>
                        onAdd({
                            appliance_name: "Refrigerator",
                            appliance_nickname: "Fridge@2025", // ❌ invalid nickname
                        })
                    }
                >
                    <Text>Add</Text>
                </TouchableOpacity>
            </View>
        ) : null;
});

describe("Add Appliance - CASE 039", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should prevent adding appliance with invalid nickname and show Toast error", async () => {
        const { getByTestId, getByText } = render(<DeviceDetails />);

        await waitFor(() => {
            expect(screen.getByTestId("add-appliance-btn")).not.toBeDisabled();
        });
        const addButton = getByTestId("add-appliance-btn");
        fireEvent.press(addButton);

        const confirmBtn = await screen.findByTestId("confirm-add-btn");
        await act(async () => fireEvent.press(confirmBtn));

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: "error",
                    text1: "Invalid Nickname",
                })
            );
        });

        // ✅ no DB interaction occurs
        expect(set).not.toHaveBeenCalled();
        expect(get).not.toHaveBeenCalled();
    });
});
