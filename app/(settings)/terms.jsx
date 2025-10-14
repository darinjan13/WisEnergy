import { View } from "react-native";
import { useRouter } from "expo-router";
import Terms from '@/components/ui/Terms'

export default function TermsOfService() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-white p-6">
            <Terms />
        </View>
    );
}
