import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { Colors, Layout } from '../theme';
import { GlassCard, GradientButton, LogoPicker, LoadingOverlay } from '../components';
import { api } from '../services/api';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// ─── Field component at MODULE LEVEL (outside HomeScreen) ────────────────────
// IMPORTANT: Must NOT be defined inside HomeScreen's render function.
// If defined inside, React treats it as a brand-new component type on every
// re-render (state change), which unmounts/remounts the TextInput and causes
// the keyboard to dismiss after each character typed.
const Field = ({
    label,
    value,
    onChange,
    placeholder,
    multiline = false,
    keyboardType = 'default' as any,
    icon,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    multiline?: boolean;
    keyboardType?: any;
    icon?: string;
}) => (
    <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>
            {icon ? <Ionicons name={icon as any} size={13} color={Colors.primary} /> : null}
            {icon ? '  ' : ''}{label}
        </Text>
        <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={Colors.mutedForeground}
            multiline={multiline}
            keyboardType={keyboardType}
            blurOnSubmit={!multiline}
            returnKeyType={multiline ? 'default' : 'next'}
            style={[styles.input, multiline && styles.inputMultiline]}
        />
    </View>
);

// ─────────────────────────────────────────────────────────────────────────────

const HomeScreen = () => {
    const navigation = useNavigation<HomeNavProp>();

    const [companyName, setCompanyName] = useState('');
    const [companyDescription, setCompanyDescription] = useState('');
    const [logoUri, setLogoUri] = useState<string | null>(null);
    const [logoBase64, setLogoBase64] = useState<string | null>(null);
    const [companyEmail, setCompanyEmail] = useState('');
    const [companyPhone, setCompanyPhone] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [isGenerating, setIsGenerating] = useState(false);

    const pulseAnim = useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.08, duration: 2000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const handleGenerate = async () => {
        if (!companyName.trim()) return Alert.alert('Required', 'Please enter your company name.');
        if (!companyDescription.trim()) return Alert.alert('Required', 'Please describe your company.');
        if (!logoBase64) return Alert.alert('Required', 'Please upload a company logo.');
        if (!companyEmail.trim()) return Alert.alert('Required', 'Please enter your company email.');
        if (!companyPhone.trim()) return Alert.alert('Required', 'Please enter a phone number.');
        if (!companyAddress.trim()) return Alert.alert('Required', 'Please enter a company address.');

        setIsGenerating(true);
        try {
            const data = await api.landingPages.generate({
                companyName,
                companyDescription,
                logoBase64,
                companyEmail,
                companyPhone,
                companyAddress,
                theme,
            });
            navigation.navigate('Preview', { generatedPage: data });
        } catch (e: any) {
            Alert.alert('Generation Failed', e.message || 'Something went wrong. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
            <LoadingOverlay visible={isGenerating} />

            {/* Animated background blobs */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Animated.View style={[styles.blob, styles.blob1, { transform: [{ scale: pulseAnim }] }]} />
                <Animated.View style={[styles.blob, styles.blob2, { transform: [{ scale: pulseAnim }] }]} />
                <Animated.View style={[styles.blob, styles.blob3, { transform: [{ scale: pulseAnim }] }]} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── Header ── */}
                    <GlassCard style={styles.header}>
                        <LinearGradient
                            colors={[Colors.gradientStart, Colors.gradientMid]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.logoDot}
                        >
                            <Ionicons name="sparkles" size={18} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.headerTitle}>Korevyn</Text>
                        <View style={{ flex: 1 }} />
                        <Text style={styles.headerTag}>AI Pages</Text>
                    </GlassCard>

                    {/* ── Hero ── */}
                    <View style={styles.hero}>
                        <View style={styles.badgePill}>
                            <Ionicons name="sparkles" size={13} color={Colors.primary} />
                            <Text style={styles.badgeText}>AI-Powered Landing Page Generator</Text>
                        </View>

                        <Text style={styles.heroTitle}>
                            Create Stunning{'\n'}
                            <Text style={styles.heroGradient}>Landing Pages{'\n'}</Text>
                            in Seconds
                        </Text>

                        <Text style={styles.heroSub}>
                            Upload your logo, describe your company, and our AI generates a complete
                            professional landing page — ready to export.
                        </Text>

                        <View style={styles.features}>
                            {[
                                { icon: 'color-wand-outline', label: 'AI Content' },
                                { icon: 'color-palette-outline', label: 'Color Extraction' },
                                { icon: 'code-slash-outline', label: 'Export Ready' },
                            ].map((f) => (
                                <View key={f.label} style={styles.featurePill}>
                                    <Ionicons name={f.icon as any} size={14} color={Colors.primary} />
                                    <Text style={styles.featureText}>{f.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* ── Form ── */}
                    <GlassCard style={styles.formCard}>
                        <View style={styles.formTitle}>
                            <Ionicons name="color-wand" size={20} color={Colors.primary} />
                            <Text style={styles.formTitleText}>Generate Your Page</Text>
                        </View>

                        <Field
                            label="Company Name"
                            value={companyName}
                            onChange={setCompanyName}
                            placeholder="Enter your company name"
                            icon="business-outline"
                        />

                        <Field
                            label="Company Description"
                            value={companyDescription}
                            onChange={setCompanyDescription}
                            placeholder="Describe your company, products/services, target audience and what makes you unique..."
                            multiline
                            icon="document-text-outline"
                        />

                        {/* Logo Picker */}
                        <View style={styles.fieldWrap}>
                            <Text style={styles.fieldLabel}>
                                <Ionicons name="image-outline" size={13} color={Colors.primary} /> {'  '}Company Logo
                            </Text>
                            <LogoPicker
                                logoUri={logoUri}
                                logoBase64={logoBase64}
                                onPick={(uri, b64) => {
                                    setLogoUri(uri);
                                    setLogoBase64(b64);
                                }}
                            />
                        </View>

                        <Field
                            label="Company Email"
                            value={companyEmail}
                            onChange={setCompanyEmail}
                            placeholder="contact@yourcompany.com"
                            keyboardType="email-address"
                            icon="mail-outline"
                        />

                        <Field
                            label="Company Phone"
                            value={companyPhone}
                            onChange={setCompanyPhone}
                            placeholder="+1 (555) 123-4567"
                            keyboardType="phone-pad"
                            icon="call-outline"
                        />

                        <Field
                            label="Company Address"
                            value={companyAddress}
                            onChange={setCompanyAddress}
                            placeholder="123 Main St, City, State, ZIP"
                            icon="location-outline"
                        />

                        {/* Theme Toggle */}
                        <View style={styles.fieldWrap}>
                            <Text style={styles.fieldLabel}>Theme</Text>
                            <View style={styles.themePill}>
                                {(['light', 'dark'] as const).map((t) => (
                                    <TouchableOpacity
                                        key={t}
                                        onPress={() => setTheme(t)}
                                        style={[styles.themeOption, theme === t && styles.themeOptionActive]}
                                    >
                                        <Ionicons
                                            name={t === 'light' ? 'sunny-outline' : 'moon-outline'}
                                            size={14}
                                            color={theme === t ? '#fff' : Colors.mutedForeground}
                                        />
                                        <Text style={[styles.themeLabel, theme === t && styles.themeLabelActive]}>
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Text style={styles.fieldHint}>Choose the theme for your generated landing page</Text>
                        </View>

                        {/* Generate Button */}
                        <GradientButton
                            label="Generate Landing Page"
                            onPress={handleGenerate}
                            loading={isGenerating}
                            icon={!isGenerating ? <Ionicons name="sparkles" size={18} color="#fff" /> : undefined}
                            style={{ marginTop: 8 }}
                        />

                        <Text style={styles.formNote}>
                            Our AI will extract colors from your logo and generate professional content including
                            headlines, features, testimonials, and more.
                        </Text>
                    </GlassCard>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.background },
    scroll: { padding: Layout.screenPadding, paddingBottom: 40, gap: 20 },

    // Blobs
    blob: { position: 'absolute', borderRadius: 999, opacity: 0.15 },
    blob1: { width: 280, height: 280, backgroundColor: Colors.primary, top: -60, left: -80 },
    blob2: { width: 260, height: 260, backgroundColor: Colors.secondary, bottom: 100, right: -80 },
    blob3: { width: 220, height: 220, backgroundColor: Colors.accent, top: '40%', left: '35%' },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
    logoDot: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { color: Colors.foreground, fontSize: 18, fontWeight: '700' },
    headerTag: { color: Colors.mutedForeground, fontSize: 12 },

    // Hero
    hero: { alignItems: 'center', paddingVertical: 8, gap: 14 },
    badgePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.glassBackground,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        borderRadius: 99,
        paddingHorizontal: 14,
        paddingVertical: 7,
    },
    badgeText: { color: Colors.foreground, fontSize: 12, fontWeight: '500' },
    heroTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: Colors.foreground,
        textAlign: 'center',
        lineHeight: 42,
    },
    heroGradient: { color: Colors.primary },
    heroSub: {
        color: Colors.mutedForeground,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 21,
        maxWidth: 320,
    },
    features: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
    featurePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: Colors.glassBackground,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        borderRadius: 99,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    featureText: { color: Colors.mutedForeground, fontSize: 12 },

    // Form
    formCard: { gap: 4 },
    formTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    formTitleText: { color: Colors.foreground, fontSize: 20, fontWeight: '700' },
    fieldWrap: { marginBottom: 14 },
    fieldLabel: { color: Colors.foreground, fontSize: 13, fontWeight: '600', marginBottom: 7 },
    fieldHint: { color: Colors.mutedForeground, fontSize: 11, marginTop: 4 },
    input: {
        backgroundColor: Colors.muted,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Layout.borderRadiusSm,
        padding: 13,
        color: Colors.foreground,
        fontSize: 15,
    },
    inputMultiline: { minHeight: 100, textAlignVertical: 'top', paddingTop: 12 },

    // Theme toggle
    themePill: {
        flexDirection: 'row',
        backgroundColor: Colors.muted,
        borderRadius: Layout.borderRadiusSm,
        padding: 4,
        gap: 4,
    },
    themeOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 8,
    },
    themeOptionActive: { backgroundColor: Colors.primary },
    themeLabel: { color: Colors.mutedForeground, fontSize: 13, fontWeight: '600' },
    themeLabelActive: { color: '#fff' },

    formNote: {
        color: Colors.mutedForeground,
        fontSize: 12,
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 18,
    },
});

export default HomeScreen;
