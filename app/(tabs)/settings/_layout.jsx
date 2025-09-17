import { Stack } from "expo-router";

export default function SettingsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false, // or true if you want a top header
            }}
        />
    );
}
