import { ScrollView, Text, TouchableOpacity } from 'react-native'

export default function Privacy({ source, close }) {
    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            {/* Effective Date + Version */}
            <Text className="text-gray-600 mb-1">Effective Date: April 26, 2025</Text>
            <Text className="text-gray-600 mb-4">Version: 1.0</Text>

            {/* 1. Introduction */}
            <Text className="font-bold text-lg mb-2">1. Introduction</Text>
            <Text className="text-gray-700 mb-4">
                WisEnergy is committed to protecting your privacy. This policy explains
                how we collect, use, and safeguard your information, in compliance with
                the Data Privacy Act of 2012 (Republic Act No. 10173).
            </Text>

            {/* 2. Information We Collect */}
            <Text className="font-bold text-lg mb-2">2. Information We Collect</Text>
            <Text className="text-gray-700 mb-2">We may collect the following information:</Text>
            {[
                "Personal Information: Name, email address, contact number, and home address.",
                "Energy Usage Data: Real-time and historical electricity consumption from connected appliances.",
                "Device Information: Hardware model, operating system, and other technical details.",
                "Location Data: Geographic location when you enable location services."
            ].map((item, i) => (
                <Text key={i} className="text-gray-700 mb-1 ml-2">• {item}</Text>
            ))}

            {/* 3. How We Use Your Information */}
            <Text className="font-bold text-lg mt-4 mb-2">3. How We Use Your Information</Text>
            <Text className="text-gray-700 mb-2">We use your information to:</Text>
            {[
                "Provide and improve WisEnergy services.",
                "Analyze energy consumption for optimization.",
                "Send notifications and updates about your energy usage.",
                "Comply with legal requirements and enforce our terms."
            ].map((item, i) => (
                <Text key={i} className="text-gray-700 mb-1 ml-2">• {item}</Text>
            ))}

            {/* 4. Data Sharing and Disclosure */}
            <Text className="font-bold text-lg mt-4 mb-2">4. Data Sharing and Disclosure</Text>
            <Text className="text-gray-700 mb-2">
                We do not sell your personal information. We may share data with:
            </Text>
            {[
                "Legal Authorities: When required to comply with legal obligations or to protect WisEnergy’s rights."
            ].map((item, i) => (
                <Text key={i} className="text-gray-700 mb-1 ml-2">• {item}</Text>
            ))}

            {/* 5. Data Security */}
            <Text className="font-bold text-lg mt-4 mb-2">5. Data Security</Text>
            <Text className="text-gray-700 mb-4">
                We apply industry-standard security measures to protect your data from
                unauthorized access, alteration, or loss.
            </Text>

            {/* 6. Your Rights */}
            <Text className="font-bold text-lg mt-4 mb-2">6. Your Rights</Text>
            <Text className="text-gray-700 mb-10">
                You have the right to access, update, and request deletion of your personal
                information, as well as other rights provided under applicable data
                protection laws.
            </Text>
            {source && (
                <TouchableOpacity onPress={close} className="mt-2 self-center bg-[#BE4949] px-6 py-2 rounded-md">
                    <Text className="text-white">Close</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    )
}