import { View } from "react-native";

const Card = ({ children, className }) => (
    <View className={`bg-white rounded-2xl p-4 shadow-md ${className}`}>{children}</View>
);

export default Card;