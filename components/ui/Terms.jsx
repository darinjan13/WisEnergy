import { Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { Text, ScrollView, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TermsOfService({ source, close }) {
    const insets = useSafeAreaInsets();
    const pathname = usePathname();
    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: pathname !== "/register" && insets.top }}>
            <View className="flex-row items-center mb-6">
                {pathname !== "/register" && (
                    <TouchableOpacity onPress={() => router.back()}>
                        <Feather name="arrow-left" size={24} color="#23403A" />
                    </TouchableOpacity>
                )}
                <Text className={`${pathname !== "/register" ? "ml-3" : ""} text-2xl font-bold text-[#23403A]`}>
                    Terms of Service
                </Text>
            </View>
            {/* Effective Date */}
            <Text className="font-bold">
                WisEnergy Terms of Service
            </Text>
            <Text className="text-gray-600 mb-1">
                Effective Date: April 26, 2025
            </Text>

            {/* Section 1 */}
            <Text className="font-bold text-lg mt-4 mb-2">1. Acceptance of Terms</Text>
            <Text className="text-gray-700 mb-4">
                By using WisEnergy, you agree to these Terms of Service. If you do not
                agree, please stop using the service.
            </Text>

            {/* Section 2 */}
            <Text className="font-bold text-lg mb-2">2. Eligibility</Text>
            {[
                "You must be at least 18 years old or have parental consent to use WisEnergy.",
                "You are responsible for keeping your account credentialssecure.",
            ].map((item, i) => (
                <Text key={i} className="text-gray-700 mb-1 ml-2">• {item}</Text>
            ))}

            {/* Section 3 */}
            <Text className="font-bold text-lg mb-2">3. User Responsibilities</Text>
            <Text className="text-gray-700 mb-2">You agree to:</Text>
            {[
                "Use WisEnergy only for lawful and personal household energy monitoring.",
                "Provide accurate and updated information when registering.",
                "Not misuse or interfere with the platform (e.g., hacking, unauthorized access, data tampering).",
            ].map((item, i) => (
                <Text key={i} className="text-gray-700 mb-1 ml-2">• {item}</Text>
            ))}

            {/* Section 4 */}
            <Text className="font-bold text-lg mt-4 mb-2">4. Services Provided</Text>
            <Text className="text-gray-700 mb-2">WisEnergy offers:</Text>
            {[
                "Real-time appliance-level energy monitoring.",
                "AI-driven consumption analysis and recommendations.",
                "Budget tracking and notifications.",
                "We may update, improve, or discontinue certain features at any time.",
            ].map((item, i) => (
                <Text key={i} className="text-gray-700 mb-1 ml-2">• {item}</Text>
            ))}

            {/* Section 5 */}
            <Text className="font-bold text-lg mt-4 mb-2">
                5. Payments and Subscriptions (if applicable)
            </Text>
            <Text className="text-gray-700 mb-4">
                Some features may require payment or subscription. Fees, billing
                cycles, and cancellation rules will be disclosed before purchase.
            </Text>

            {/* Section 6 */}
            <Text className="font-bold text-lg mt-4 mb-2">6. Intellectual Property</Text>
            <Text className="text-gray-700 mb-4">
                All content, logos, and software used in WisEnergy remain the property
                of WisEnergy. Users are granted a limited, non-transferable right to
                use the service.
            </Text>

            {/* Section 7 */}
            <Text className="font-bold text-lg mt-4 mb-2">7. Limitation of Liability</Text>
            <Text className="text-gray-700 mb-2">WisEnergy is provided “as is.” We are not liable for losses caused by:</Text>
            {[
                "Misuse of the app or devices.",
                "Service interruptions or data inaccuracies.",
                "Third-party services beyond our control.",
            ].map((item, i) => (
                <Text key={i} className="text-gray-700 mb-1 ml-2">• {item}</Text>
            ))}

            {/* Section 8 */}
            <Text className="font-bold text-lg mt-4 mb-2">8. Termination</Text>
            <Text className="text-gray-700 mb-4">
                We may suspend or terminate your account if you violate these Terms or
                use WisEnergy unlawfully or fraudulently.
            </Text>

            {/* Section 9 */}
            <Text className="font-bold text-lg mt-4 mb-2">9. Governing Law</Text>
            <Text className="text-gray-700 mb-4">
                These Terms are governed by the laws of the Republic of the
                Philippines.
            </Text>

            {/* Section 10 */}
            <Text className="font-bold text-lg mt-4 mb-2">10. Contact Us</Text>
            <Text className="text-gray-700">
                For concerns about these Terms, contact:
            </Text>
            <Text className="text-gray-700">📧 support.wisenergy@gmail.com</Text>
            <Text className="text-gray-700">
                🏢 WisEnergy Support Office, Mandaue City, Cebu, Philippines
            </Text>
            {source && (
                <TouchableOpacity onPress={close} className="mt-2 self-center bg-[#BE4949] px-6 py-2 rounded-md">
                    <Text className="text-white">Close</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}
