import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Share,
    StatusBar,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Layout } from '../theme';
import { LeadFormSheet, GlassCard } from '../components';
import { RootStackParamList } from '../navigation/AppNavigator';

type PreviewRoute = RouteProp<RootStackParamList, 'Preview'>;
type PreviewNavProp = NativeStackNavigationProp<RootStackParamList, 'Preview'>;

const PreviewScreen = () => {
    const navigation = useNavigation<PreviewNavProp>();
    const route = useRoute<PreviewRoute>();
    const { generatedPage } = route.params;

    const [leadSheetVisible, setLeadSheetVisible] = useState(false);
    const [downloadFormat, setDownloadFormat] = useState<'html' | 'react'>('html');
    const [webviewLoading, setWebviewLoading] = useState(true);

    const handleDownloadPress = (format: 'html' | 'react') => {
        setDownloadFormat(format);
        setLeadSheetVisible(true);
    };

    const handleLeadSuccess = async () => {
        setLeadSheetVisible(false);

        try {
            const content = downloadFormat === 'html' ? generatedPage.html : generatedPage.react;
            const extension = downloadFormat === 'html' ? 'html' : 'jsx';
            const fileName = `landing-page.${extension}`;

            // Write file using expo-file-system v19 class-based API
            const file = new File(Paths.cache, fileName);
            file.create();
            file.write(content);

            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
                await Sharing.shareAsync(file.uri, {
                    mimeType: downloadFormat === 'html' ? 'text/html' : 'text/plain',
                    dialogTitle: `Share ${fileName}`,
                });
            } else {
                Alert.alert('Sharing unavailable', 'File sharing is not supported on this device.');
            }
        } catch (e: any) {
            Alert.alert('Error', 'Failed to prepare file for sharing.');
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out my AI-generated landing page: ${generatedPage.publicUrl || ''}`,
                url: generatedPage.publicUrl,
            });
        } catch (e) {
            // user dismissed
        }
    };

    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

            {/* Top bar */}
            <GlassCard style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={Colors.foreground} />
                </TouchableOpacity>

                <View style={styles.topBarCenter}>
                    <LinearGradient
                        colors={[Colors.gradientStart, Colors.gradientEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.previewDot}
                    >
                        <Ionicons name="eye-outline" size={14} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.topBarTitle}>Preview & Export</Text>
                </View>

                <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
                    <Ionicons name="share-outline" size={22} color={Colors.primary} />
                </TouchableOpacity>
            </GlassCard>

            {/* WebView */}
            <View style={styles.webviewContainer}>
                {webviewLoading && (
                    <View style={styles.webviewLoader}>
                        <Ionicons name="globe-outline" size={40} color={Colors.primary} />
                        <Text style={styles.webviewLoadingText}>Rendering your page...</Text>
                    </View>
                )}
                <WebView
                    source={{ html: generatedPage.html }}
                    style={styles.webview}
                    onLoadEnd={() => setWebviewLoading(false)}
                    originWhitelist={['*']}
                    javaScriptEnabled
                    domStorageEnabled
                />
            </View>

            {/* Action bar */}
            <GlassCard style={styles.actionBar}>
                <Text style={styles.actionBarTitle}>Export Options</Text>
                <View style={styles.actionBtns}>
                    {/* HTML Download */}
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleDownloadPress('html')}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[Colors.gradientStart, Colors.gradientMid]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.actionBtnGradient}
                        >
                            <Ionicons name="download-outline" size={18} color="#fff" />
                            <Text style={styles.actionBtnLabel}>HTML</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* React Download */}
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleDownloadPress('react')}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[Colors.gradientMid, Colors.gradientEnd]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.actionBtnGradient}
                        >
                            <Ionicons name="code-slash-outline" size={18} color="#fff" />
                            <Text style={styles.actionBtnLabel}>React</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Open in Browser */}
                    {generatedPage.publicUrl ? (
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.outlineBtn]}
                            onPress={handleShare}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="open-outline" size={18} color={Colors.primary} />
                            <Text style={styles.outlineBtnLabel}>Share Link</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            </GlassCard>

            {/* Lead form sheet */}
            <LeadFormSheet
                visible={leadSheetVisible}
                onClose={() => setLeadSheetVisible(false)}
                downloadFormat={downloadFormat}
                onSuccess={handleLeadSuccess}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.background },

    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: Layout.screenPadding,
        marginBottom: 10,
        padding: 12,
    },
    backBtn: { padding: 4 },
    topBarCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 12 },
    previewDot: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topBarTitle: { color: Colors.foreground, fontSize: 16, fontWeight: '700' },
    shareBtn: { padding: 4 },

    webviewContainer: {
        flex: 1,
        marginHorizontal: Layout.screenPadding,
        borderRadius: Layout.borderRadius,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
        position: 'relative',
    },
    webview: { flex: 1, backgroundColor: '#fff' },
    webviewLoader: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.card,
        gap: 12,
        zIndex: 10,
    },
    webviewLoadingText: { color: Colors.mutedForeground, fontSize: 14 },

    actionBar: {
        margin: Layout.screenPadding,
        marginTop: 10,
        padding: 16,
        gap: 10,
    },
    actionBarTitle: {
        color: Colors.mutedForeground,
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    actionBtns: { flexDirection: 'row', gap: 8 },
    actionBtn: { flex: 1, borderRadius: Layout.borderRadiusSm, overflow: 'hidden' },
    actionBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 13,
    },
    actionBtnLabel: { color: '#fff', fontSize: 13, fontWeight: '700' },
    outlineBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: Colors.primary,
        paddingVertical: 13,
        backgroundColor: 'rgba(192,132,252,0.06)',
    },
    outlineBtnLabel: { color: Colors.primary, fontSize: 13, fontWeight: '700' },
});

export default PreviewScreen;
