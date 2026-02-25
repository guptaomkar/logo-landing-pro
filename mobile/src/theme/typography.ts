import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const Typography = StyleSheet.create({
    h1: {
        fontSize: 36,
        fontWeight: '800',
        color: Colors.foreground,
        letterSpacing: -0.5,
        lineHeight: 44,
    },
    h2: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.foreground,
        letterSpacing: -0.3,
    },
    h3: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.foreground,
    },
    body: {
        fontSize: 15,
        color: Colors.foreground,
        lineHeight: 22,
    },
    caption: {
        fontSize: 12,
        color: Colors.mutedForeground,
        lineHeight: 18,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.foreground,
        marginBottom: 6,
    },
});

export const Layout = {
    screenPadding: 20,
    borderRadius: 16,
    borderRadiusSm: 10,
    borderRadiusLg: 24,
};
