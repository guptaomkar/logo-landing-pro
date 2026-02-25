import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { Colors } from '../theme';

interface LoadingOverlayProps {
    visible: boolean;
    message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    visible,
    message = 'Generating magic...',
}) => {
    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.message}>{message}</Text>
                    <Text style={styles.sub}>AI is analyzing your logo and crafting content</Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: Colors.overlay,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: Colors.card,
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        gap: 14,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        width: '100%',
        maxWidth: 320,
    },
    message: {
        color: Colors.foreground,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    sub: {
        color: Colors.mutedForeground,
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
    },
});

export default LoadingOverlay;
