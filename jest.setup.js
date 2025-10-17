// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => {
    const React = require("react");
    const { View } = require("react-native");
    return { GestureHandlerRootView: ({ children }) => <View>{children}</View> };
});


jest.mock("@/components/ui/Header", () => () => <></>);
jest.mock("@/components/ui/Tooltip", () => () => <></>);
jest.mock("@/components/appliances/AddApplianceModal", () => () => <></>);
jest.mock("@/components/ui/ConfirmModal", () => () => <></>);
jest.mock("@/components/appliances/ApplianceCard", () => () => <></>);
// Mock Expo Vector Icons
jest.mock('@expo/vector-icons', () => ({
    Ionicons: ({ name, size, color, ...props }) => <div {...props} data-icon={name} style={{ width: size, height: size, backgroundColor: color }} />,
    Feather: ({ name, size, color, ...props }) => <div {...props} data-icon={name} style={{ width: size, height: size, backgroundColor: color }} />,
    MaterialIcons: ({ name, size, color, ...props }) => <div {...props} data-icon={name} style={{ width: size, height: size, backgroundColor: color }} />,
    MaterialCommunityIcons: ({ name, size, color, ...props }) => <div {...props} data-icon={name} style={{ width: size, height: size, backgroundColor: color }} />,
    AntDesign: ({ name, size, color, ...props }) => <div {...props} data-icon={name} style={{ width: size, height: size, backgroundColor: color }} />,
}));

jest.mock("@/components/appliances/AddApplianceModal", () => {
    const React = require("react");
    const { View, TextInput, TouchableOpacity, Text } = require("react-native");

    return ({ visible, onAdd }) =>
        visible ? (
            <View testID="add-modal">
                <TextInput testID="appliance-input" />
                <TouchableOpacity
                    testID="confirm-add-btn"
                    onPress={() =>
                        onAdd({
                            appliance_name: "Refrigerator",
                            appliance_nickname: "Ref",
                        })
                    }
                >
                    <Text>Add</Text>
                </TouchableOpacity>
            </View>
        ) : null;
});

jest.mock("@/firebase/firebaseConfig", () => ({
    auth: { currentUser: { uid: "test-user-id" } },
    db: {},
    fs: {},
}));
jest.mock("firebase/database", () => ({
    ref: jest.fn(() => ({})),
    get: jest.fn(() => Promise.resolve({ exists: () => false })),
    set: jest.fn(() => Promise.resolve()),
    update: jest.fn(() => Promise.resolve()),
    remove: jest.fn(() => Promise.resolve()),
    onValue: jest.fn(() => jest.fn()), // returns unsubscribe fn
    query: jest.fn(),
    orderByKey: jest.fn(),
    limitToLast: jest.fn()
}));
// Mock specific font files for vector icons
jest.mock('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf', () => '');

// Mock services/apiService
jest.mock("./services/apiService", () => ({
    generate_otp: jest.fn((email) => {
        if (email === "darinjan13@gmail.com" || email === "registered@example.com") {
            return Promise.resolve({ success: true });
        } else {
            return Promise.resolve({ success: false, message: "Email not found" });
        }
    }),
    verify_otp: jest.fn((email, code) => {
        if (code === "123456") {
            return Promise.resolve({ success: true });
        } else {
            return Promise.resolve({ success: false, message: "Invalid OTP" });
        }
    }),
}));

const mockStore = {
    devices: [{ id: "device1", status: "paired", paired_at: "2025-10-15" }],
    userDevices: [],
    unpairedDevices: [{ label: "1caf24124b00", value: "1caf24124b00" }],
    // ... other initial state
};
jest.mock("@/hooks/useApplianceStreams", () => jest.fn());
// Mock Firebase Store functions
jest.mock("./store/firebaseStore.js", () => ({
    useDeviceStore: jest.fn(() => ({
        // ...mockStore,
        devices: [{ id: "device1", status: "paired", paired_at: "2025-10-15" }],
        userAppliances: [
            {
                id: "device1",
                appliances: [
                    {
                        name: "Refrigerator",
                        nickname: "Ref",
                        added_at: "2025-10-15",
                    },
                ],
            },
        ],
        _unsubUserAppliances: null,
        setDevices: jest.fn(() => ({ success: true })),
        setDeviceApplianceName: jest.fn(() => ({ success: true })),
        listenToUserAppliances: jest.fn((userId, callback) => {
            callback([]);
        }),
        unsubscribeFromUserAppliances: jest.fn(() => { }),
        setApplianceActive: jest.fn(() => ({ success: true })),
        setOnlyOneActive: jest.fn(() => ({ success: true })),
        addDevice: jest.fn((deviceCode, selectedUnpairedDevice, device_nickname) => {
            if (mockStore.userDevices.some(device => device.device_nickname === device_nickname)) {
                return { success: false, error: "A device with this name already exists." };
            }
            if (!device_nickname) {
                return { success: false, error: "Invalid device name." };
            }
            // Add to userDevices
            // After first successful add
            mockStore.userDevices.push({ device_nickname: "Test Device", deviceCode: "123" });

            return { success: true };
        }),
        updateDeviceNickname: jest.fn(() => ({ success: true })),
        deleteDevice: jest.fn(() => ({ success: true })),
    })),
}));

// Mock for Expo Router
jest.mock("expo-router", () => ({
    router: {
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        navigate: jest.fn(),
        canGoBack: jest.fn(() => true)
    },
    useFocusEffect: jest.fn((cb) => cb()),
    useLocalSearchParams: jest.fn(() => ({
        email: "test@example.com",
        from: "forgotPassword",
        firstName: "Jane",
        lastName: "Doe",
        password: "123456",
        location: "Cebu",
        deviceId: "device1"
    })),
}));

// Mock Toast for notifications
jest.mock("react-native-toast-message", () => ({
    __esModule: true,
    default: { show: jest.fn() },
}));

// Mocking Async Storage
jest.mock("@react-native-async-storage/async-storage", () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
}));
jest.mock("@react-navigation/native", () => ({
    useFocusEffect: (cb) => cb(),
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

jest.mock("react-native-paper", () => {
    const React = require("react");

    // ───── Mock Card Component ─────
    const Card = ({ children, ...props }) => <div {...props}>{children}</div>;
    Card.Title = ({ title, subtitle, right, titleStyle, subtitleStyle, ...props }) => (
        <div {...props}>
            <span style={titleStyle}>{title}</span>
            {subtitle && <span style={subtitleStyle}>{subtitle}</span>}
            {right && right()}
        </div>
    );
    Card.Content = ({ children, ...props }) => <div {...props}>{children}</div>;

    // ───── Mock ActivityIndicator ─────
    const ActivityIndicator = ({ size, color }) => (
        <div
            data-testid="activity-indicator"
            style={{
                width: size === "large" ? 32 : 16,
                height: 16,
                backgroundColor: color,
            }}
        />
    );

    // ───── ✅ Add RadioButton.Group ─────
    const RadioButton = {
        Group: ({ children }) => <>{children}</>,
    };

    return {
        __esModule: true,
        Card,
        RadioButton, // 👈 critical addition
        TextInput: ({ children, ...props }) => <input {...props}>{children}</input>,
        IconButton: ({ onPress, icon, iconColor, ...props }) => (
            <button onClick={onPress} {...props}>{icon}</button>
        ),
        Text: ({ children, ...props }) => <span {...props}>{children}</span>,
        ActivityIndicator,
    };
});

// Mock expo-blur
jest.mock("expo-blur", () => ({
    BlurView: ({ children }) => <>{children}</>,
}));

// Mock react-native-auto-skeleton
jest.mock("react-native-auto-skeleton", () => ({
    AutoSkeletonView: ({ children }) => <>{children}</>,
}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
