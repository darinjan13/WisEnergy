import { Card, Text, IconButton, RadioButton } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { onValue, ref, update } from 'firebase/database';
import { db } from '../../firebase/firebaseConfig';

export default function ApplianceCard({ power, appliance, applianceKWH, onEdit, onDelete, selectedAppliance, onChange }) {

    return (
        <View>
            <Card className="mb-4" style={{ backgroundColor: 'white' }}>
                <Card.Title
                    title={appliance.name}
                    subtitle={`Added at: ${appliance.added_at || 'N/A'}`}
                    titleStyle={cardStyles.textBlack}
                    subtitleStyle={cardStyles.textBlack}
                    right={(props) => (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <IconButton iconColor='blue' icon="pencil" onPress={onEdit} />
                            <IconButton iconColor='red' icon="delete" onPress={onDelete} />
                            <RadioButton
                                value={appliance.name}
                                status={selectedAppliance === appliance.name ? 'checked' : 'unchecked'}
                                onPress={() => onChange(appliance.name)}
                            />
                        </View>
                    )}
                />
                <Card.Content>
                    <Text style={cardStyles.textBlack} variant="bodyMedium">Power: {power?.toFixed(2)} W</Text>
                    <Text style={cardStyles.textBlack} variant="bodyMedium">Usage: {applianceKWH?.toFixed(2)} kWh</Text>
                </Card.Content>
            </Card>
        </View>
    );
}

const cardStyles = StyleSheet.create({
    textBlack: {
        color: 'black',
    }
});