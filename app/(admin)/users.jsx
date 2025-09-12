import { View, Text, ScrollView } from "react-native";
import AdminHeader from "../../components/ui/AdminHeader";
import { useEffect, useState } from "react";
import { fetchTotalUsers } from "../../services/apiService";
import { updateProfile } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";

export default function Users() {
    const [users, setUsers] = useState([]);

    const getUsers = async () => {
        const users = await fetchTotalUsers();
        setUsers(users)
    }

    useEffect(() => {
        getUsers();
    }, [])

    return (
        <View className="flex-1 bg-white">
            <AdminHeader />
            <Text className="text-2xl font-bold text-gray-800 mt-10 text-center">
                USERS
            </Text>

            <ScrollView horizontal className="mt-4">
                <View className="min-w-[900px] p-5">
                    {/* Header */}
                    <View className="flex-row py-3 border-b-2 border-gray-400 bg-gray-100">
                        <Text className="w-[15%] font-bold text-gray-800">UID</Text>
                        <Text className="w-[15%] font-bold text-gray-800">First Name</Text>
                        <Text className="w-[15%] font-bold text-gray-800">Last Name</Text>
                        <Text className="w-[25%] font-bold text-gray-800">Email</Text>
                        <Text className="w-[15%] font-bold text-gray-800">Password</Text>
                        <Text className="w-[15%] font-bold text-gray-800">Status</Text>
                    </View>

                    {/* Rows */}
                    {users.map((u, i) => {
                        const lastSignIn = Number(u.last_sign_in);
                        const minutesAgo = Math.floor((Date.now() - lastSignIn) / 60000);

                        const isActive = minutesAgo <= 5;

                        return (
                            <View key={i} className="flex-row py-3 border-b border-gray-200">
                                <Text className="w-[15%] text-gray-700" numberOfLines={1}>
                                    {u.uid}
                                </Text>
                                <Text className="w-[15%] text-gray-700">{u.first_name}</Text>
                                <Text className="w-[15%] text-gray-700">{u.last_name}</Text>
                                <Text className="w-[25%] text-gray-700" numberOfLines={1} ellipsizeMode="tail">
                                    {u.email}
                                </Text>
                                <Text className="w-[15%] text-gray-700">••••••</Text>
                                <Text className={`w-[15%] ${isActive ? "text-green-600" : "text-red-600"}`}>
                                    ●
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

        </View>

    );
}
