import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CustomProgressBar = ({ progress, maxProgress, color }) => {
    const progressPercentage = (progress / maxProgress) * 100; // Calculate the percentage
    

    return (
        <View style={styles.container}>
            {/* Background bar */}
            <View style={[styles.backgroundBar, { backgroundColor: "#FFFF" }]}>
                {/* Foreground bar (progress) */}
                <View
                    style={[
                        styles.foregroundBar,
                        { width: `${progressPercentage}%`, backgroundColor: color },
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
        width: '70%',
    },
    backgroundBar: {
        height: 20, // Height of the progress bar
        width: '100%',
        borderRadius: 10, // Round the corners of the progress bar
        overflow: 'hidden', // Ensures the foreground bar doesn't overflow the rounded corners
    },
    foregroundBar: {
        height: '100%',
        borderRadius: 10, // Round the corners of the filled portion
    },
    text: {
        marginTop: 5,
        fontSize: 14,
        color: '#333',
    },
});

export default CustomProgressBar;
