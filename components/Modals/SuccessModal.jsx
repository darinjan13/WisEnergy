import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth } from "../../firebase/firebaseConfig";
import { BlurView } from "expo-blur";

export default function SuccessModal({ visible, onClose }) {
    const router = useRouter();

    return (
        <Modal transparent={true} visible={visible} animationType="fade">
            <BlurView intensity={100} tint="dark" className="flex-1 justify-center items-center">

                <View className="bg-white rounded-2xl p-6 items-center w-80">
                    <Feather name="check-circle" size={80} color="green" />
                    <Text className="text-lg font-bold mt-4">{auth?.currentUser.displayName}</Text>
                    <Text className="text-gray-600 text-center mt-2">
                        From now on, you are part of us!
                    </Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                            onClose();
                            router.replace("/(tabs)");
                        }}
                    >
                        <Text className="text-white font-semibold">Explore Home Page</Text>
                    </TouchableOpacity>
                </View>
            </BlurView>
        </Modal>
    );
}

const styles = StyleSheet.create({

    button: {
        marginTop: 24,
        backgroundColor: "black",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 9999,
        width: "100%",
        alignItems: "center",
    },
});