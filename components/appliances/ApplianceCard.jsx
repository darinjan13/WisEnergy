import { Card, Text, IconButton, RadioButton } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

export default function ApplianceCard({ power, appliance, applianceKWH, onEdit, onDelete, selectedAppliance, onChange }) {

    return (
        <View>
            <Card className="mb-4" style={{ backgroundColor: 'white' }}>
                <Card.Title
                    title={appliance.name.replace(/_/, ' ')}
                    subtitle={`Added at: ${appliance.added_at || 'N/A'}`}
                    titleStyle={cardStyles.title}
                    subtitleStyle={cardStyles.subtitle}
                    right={(props) => (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <IconButton iconColor='#2E4F4F' icon="pencil" onPress={onEdit} />
                            <IconButton iconColor='red' icon="delete" onPress={onDelete} />
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