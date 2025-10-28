import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

const TabBar = ({ state, descriptors, navigation }) => {

    const getTabIcon = (routeName, isFocused) => {
        let iconName;

        if (routeName === 'devices') {
            return (
                <MaterialCommunityIcons
                    name={isFocused ? "lightning-bolt" : "lightning-bolt-outline"}
                    size={24}
                    color={isFocused ? "#039400" : "black"}
                />

            );
        }
        switch (routeName) {
            case 'dashboard':
                iconName = isFocused ? 'home' : 'home-outline';
                break;
            case 'reports':
                iconName = isFocused ? 'bar-chart' : 'bar-chart-outline';
                break;
            case 'budget':
                iconName = isFocused ? 'cash' : 'cash-outline';
                break;
            default:
                iconName = 'ellipse-outline';
        }

        return (
            <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? "#039400" : "black"}
                style={{ fontWeight: isFocused ? 'bold' : 'normal' }}
            />
        );
    };

    return (
        <>
            {!(state.routes[state.index]?.name === "notifications") && (
                <View style={styles.container}>
                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];
                        if (options.title === "Appliance" || options.title === "Notifications") {
                            return null;
                        }
                        const label =
                            options.tabBarLabel !== undefined
                                ? options.tabBarLabel
                                : options.title !== undefined
                                    ? options.title
                                    : route.name;

                        const isFocused = state.index === index || (route.name === "devices" && state.routes[state.index]?.name === "appliances/[deviceId]/index");

                        const onPress = () => {
                            const event = navigation.emit({
                                type: "tabPress",
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name, route.params);
                            }
                        };

                        return (
                            <TouchableOpacity
                                key={route.key}
                                onPress={onPress}
                                style={styles.tabItem}
                            >
                                {getTabIcon(route.name, isFocused)}
                                <Text
                                    style={[
                                        styles.tabItemText,
                                        { fontWeight: isFocused ? "bold" : "normal" },
                                        { color: isFocused ? "#039400" : "black" },
                                    ]}
                                >
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </>
    );
}

export default TabBar;

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '93%',
        alignSelf: 'center',
        backgroundColor: "white",
        bottom: 30,
        height: 80,
        borderRadius: 20,
        elevation: 15,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    tabItem: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabItemText: {
        fontSize: 12,
        color: 'black',
        marginTop: 4,
    }
});
