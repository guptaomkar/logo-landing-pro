import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Layout } from '../theme';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => {
    return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.glassBackground,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        borderRadius: Layout.borderRadius,
        padding: 20,
    },
});

export default GlassCard;
