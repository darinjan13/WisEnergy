import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { auth } from "../../firebase/firebaseConfig";
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "expo-router";

const RegisterForm = ({ onSubmit, isLoading = false }) => {

    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.replace("/(tabs)"); // Redirect to home if already logged in
            }
        });

        return unsubscribe;
    }, []);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!name.trim()) newErrors.name = "Name is required";
        if (!email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";

        if (!password) newErrors.password = "Password is required";
        else if (password.length < 8)
            newErrors.password = "Password must be at least 8 characters";

        if (password !== confirmPassword)
            newErrors.confirmPassword = "Passwords do not match";
        if (!acceptTerms)
            newErrors.terms = "You must accept the terms and conditions";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        // console.log(email + " " + password);
        // if (validateForm() && onSubmit) {

        //     // onSubmit({ name, email, password });
        //     createUserWithEmailAndPassword(auth, email, password)
        //         .then(res => {
        //             const user = res.user;
        //             console.log(user);

        //         })
        // }
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            console.log('Success' + res.user)
            Alert.alert('Success', "Account Created.")
        } catch (e) {
            Alert.alert('Failed', e.message)
        }
    };

    return (
        <ScrollView style={{ backgroundColor: "white", padding: 16, borderRadius: 8, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, width: "100%", maxWidth: 350 }}>
            <View style={{ gap: 16 }}>
                <View>
                    <Text style={{ color: "#374151", marginBottom: 4, fontWeight: "500" }}>Full Name</Text>
                    <TextInput
                        style={{
                            borderWidth: 1,
                            borderColor: errors.name ? "#EF4444" : "#D1D5DB",
                            borderRadius: 8,
                            padding: 12,
                            backgroundColor: "#F9FAFB",
                        }}
                        placeholder="John Doe"
                        value={name}
                        onChangeText={setName}
                    />
                    {errors.name && <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors.name}</Text>}
                </View>

                <View>
                    <Text style={{ color: "#374151", marginBottom: 4, fontWeight: "500" }}>Email Address</Text>
                    <TextInput
                        style={{
                            borderWidth: 1,
                            borderColor: errors.email ? "#EF4444" : "#D1D5DB",
                            borderRadius: 8,
                            padding: 12,
                            backgroundColor: "#F9FAFB",
                        }}
                        placeholder="you@example.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    {errors.email && <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors.email}</Text>}
                </View>

                <View>
                    <Text style={{ color: "#374151", marginBottom: 4, fontWeight: "500" }}>Password</Text>
                    <View style={{ position: "relative" }}>
                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: errors.password ? "#EF4444" : "#D1D5DB",
                                borderRadius: 8,
                                padding: 12,
                                backgroundColor: "#F9FAFB",
                                paddingRight: 40,
                            }}
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            style={{ position: "absolute", right: 12, top: 12 }}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#6b7280" />
                        </TouchableOpacity>
                    </View>
                    {errors.password && <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors.password}</Text>}
                </View>

                <TouchableOpacity
                    style={{
                        marginTop: 16,
                        borderRadius: 8,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        backgroundColor: isLoading || !name || !email || !password || !confirmPassword || !acceptTerms ? "#818CF8" : "#4F46E5",
                    }}
                    onPress={handleSubmit}
                >
                    <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>
                        {isLoading ? "Creating Account..." : "Create Account"}
                    </Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")} className="bg-gray-300 py-3 rounded-md">
                <Text className="text-blue-600 text-center font-semibold">Login</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default RegisterForm;
