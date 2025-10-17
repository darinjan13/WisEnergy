import { View, Text } from 'react-native';
import CustomProgressBar from './CustomProgressBar';

const ApplianceUsage = ({category, data }) => {
    const maxPower = 100; // Max threshold for energy consumption (adjust as needed)

    return (
        <View>
            {data.map((item, index) => {
                let powerUsed = item.barData.reduce((total, current) => total + current.value, 0);

                const percentage = powerUsed ? (powerUsed / maxPower) * 100 : 0;

                return (
                    <View className="w-full flex flex-row flex-wrap items-center mb-5" key={item.applianceName + index}>
                        <Text className="mr-5 w-24">{item.applianceName}</Text>
                        <CustomProgressBar progress={powerUsed} maxProgress={category == "Weekly" ? 50: 10} color="#4CAF50" />
                    </View>
                );
            })}
        </View>
    );
};
export default ApplianceUsage;