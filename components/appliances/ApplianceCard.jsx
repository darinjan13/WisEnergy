import { Card, Text, RadioButton } from 'react-native-paper';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ApplianceCard({ power, appliance, applianceKWH, onEdit, onDelete, selectedAppliance, onChange }) {

    return (
        <View>
            <Card className="mb-5" style={{ backgroundColor: 'white' }}>
                <Card.Title
                    title={`${appliance.name.replaceAll("_", ' ')} (${appliance.nickname || " "})`}
                    subtitle={`Added at: ${appliance.added_at || 'N/A'}`}
                    titleStyle={cardStyles.title}
                    subtitleStyle={cardStyles.subtitle}
                    right={(props) => (
                        <View className="flex-row justify-between items-center pr-4">
                            <View className="flex-row justify-between items-center gap-8 pr-5">
                                <TouchableOpacity onPress={onEdit} >
                                    <Feather name="edit" color="#2E4F4F" size={20} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onDelete} >
                                    <MaterialCommunityIcons name="trash-can" color="red" size={20} />
                                </TouchableOpacity>
                            </View>
                            <RadioButton
                                value={appliance.name}
                                status={selectedAppliance === appliance.name ? 'checked' : 'unchecked'}
                            />
                        </View>
                    )}
                />
                <Card.Content>
                    <Text style={cardStyles.contentText} variant="bodyMedium">Power: {power?.toFixed(2)} W</Text>
                    <Text style={cardStyles.contentText} variant="bodyMedium">Usage: {applianceKWH?.toFixed(2)} kWh</Text>
                </Card.Content>
            </Card>
        </View>
    );
}

const cardStyles = StyleSheet.create({
    title: {
        color: "black"
    },
    subtitle: {
        color: '#5f5f5f',
    },
    contentText: {
        color: '#5f5f5f',
    }
});