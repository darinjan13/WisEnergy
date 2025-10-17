import { render, screen, waitFor } from "@testing-library/react-native";
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

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => {
    const React = require("react");
    const { View } = require("react-native");

    const inset = { top: 0, bottom: 0, left: 0, right: 0 };
    const frame = { width: 320, height: 640, x: 0, y: 0 };

    const SafeAreaProvider = ({ children }) => <View>{children}</View>;
    SafeAreaProvider.displayName = "SafeAreaProvider";

    const SafeAreaView = (props) => <View {...props} />;
    SafeAreaView.displayName = "SafeAreaView";

    return {
        SafeAreaProvider,
        SafeAreaConsumer: ({ children }) => children(inset),
        SafeAreaView,
        useSafeAreaInsets: () => inset,
        useSafeAreaFrame: () => frame,
    };
});

import TemporaryReports from "../app/(tabs)/TemporaryReports";
describe("TemporaryReports Component - CASE-045", () => {
    it("should display device-level consumption report when a specific device is selected", async () => {
        render(<TemporaryReports />);

        // Find the picker
        const picker = screen.getByTestId("device-picker");

        // Simulate selecting "device1" by triggering the onValueChange prop
        const onValueChange = picker.props.nativeOnValueChange;
        if (onValueChange) {
            onValueChange("device1");
        } else {
            throw new Error("onValueChange not found on picker");
        }

        // Wait for the async state update from handleDeviceChange
        await waitFor(() => {
            expect(screen.getByText("Appliance 1")).toBeTruthy();
            expect(screen.getByText("Energy Consumption: 5 kWh")).toBeTruthy();
        });
    });
});