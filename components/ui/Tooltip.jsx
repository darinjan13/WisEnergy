// Tooltip.jsx
import { View, Text, Pressable } from "react-native";

export default function Tooltip({ toolTip, setToolTip, content, from }) {
    if (!toolTip) return null;

    const offsetTop =
        from === "Devices" ? 190 :
            from === "Budget" ? 160 :
                150;

    return (
        <Pressable
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9998,          // sits above everything else
                elevation: 30,
                backgroundColor: "transparent",
            }}
            onPress={() => setToolTip(false)}   // ✅ tap anywhere outside
        >
            <View
                style={{
                    position: "absolute",
                    top: offsetTop,
                    alignSelf: "center",
                    zIndex: 9999,        // tooltip box above overlay
                    elevation: 5,
                    backgroundColor: "white",
                    borderColor: "#d1d5db",
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 10,
                    width: "95%",
                    shadowColor: "#000",
                }}
            >
                <Text className="text-gray-600 text-xs text-center">{content}</Text>
            </View>
        </Pressable>
    );
}
