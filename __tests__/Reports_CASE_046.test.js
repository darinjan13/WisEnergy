import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react-native";

// Mocking static data
const userDevices = [
    { id: "device1", device_nickname: "Device 1" },
    { id: "device2", device_nickname: "Device 2" },
];

const userAppliances = [
    { id: "device1", appliances: [{ applianceName: "Appliance 1", latestKwh: 5 }] },
    { id: "device2", appliances: [{ applianceName: "Appliance 2", latestKwh: 3 }] },
];

jest.mock("@react-native-picker/picker", () => {
    const React = require("react");
    const { View, Text } = require("react-native");

    const Picker = ({
        testID,
        selectedValue,
        onValueChange,
        children,
        style,
        ...rest
    }) => (
        <View
            testID={testID}
            style={style}
            {...rest}
            nativeOnValueChange={onValueChange}
        >
            {React.Children.toArray(children).find(
                (child) => child?.props?.value === selectedValue
            )?.props?.label && (
                    <Text testID={`${testID}-selected`}>
                        {React.Children.toArray(children).find(
                            (child) => child?.props?.value === selectedValue
                        ).props.label}
                    </Text>
                )}
            {React.Children.map(children, (child) => {
                if (!child) return null;
                const isSelected = child.props.value === selectedValue;
                return (
                    <Text
                        testID={`${testID}-item-${child.props.value}`}
                        onPress={() => onValueChange?.(child.props.value)}
                        style={{ color: isSelected ? "blue" : "black" }}
                    >
                        {child.props.label}
                    </Text>
                );
            })}
        </View>
    );
    Picker.displayName = "Picker";

    const PickerItem = ({ label }) => <Text>{label}</Text>;
    PickerItem.displayName = "Picker.Item";

    Picker.Item = PickerItem;

    return { Picker };
});
import TemporaryReports from "../app/(tabs)/TemporaryReports"; // Adjust path if needed

describe("Case 46: Device Picker triggers fetching and displaying correct appliance data", () => {
    beforeEach(() => {
        // Render the component before each test
        render(<TemporaryReports />);
    });

    it("should display appliances for all devices when 'All Devices' is selected", async () => {
        // Simulate selecting "All Devices"
        fireEvent.press(screen.getByTestId("device-picker-item-All Devices"));

        // Wait for the appliances to be displayed for both devices
        await waitFor(() => expect(screen.getByText("Appliance 1")).toBeTruthy());
        expect(screen.getByText("Energy Consumption: 5 kWh")).toBeTruthy();
        expect(screen.getByText("Appliance 2")).toBeTruthy();
        expect(screen.getByText("Energy Consumption: 3 kWh")).toBeTruthy();
    });
});
