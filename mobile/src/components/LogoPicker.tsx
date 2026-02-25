import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Alert,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Layout } from '../theme';

interface LogoPickerProps {
    logoUri: string | null;
    logoBase64: string | null;
    onPick: (uri: string, base64: string) => void;
}

const LogoPicker: React.FC<LogoPickerProps> = ({ logoUri, onPick }) => {
    const [loading, setLoading] = React.useState(false);

    const pickImage = async (source: 'library' | 'camera') => {
        setLoading(true);
        try {
            let result: ImagePicker.ImagePickerResult;

            if (source === 'camera') {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission required', 'Camera permission is needed to take a photo.');
                    return;
                }
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ['images'],
                    quality: 0.8,
                    base64: true,
                    allowsEditing: true,
                    aspect: [1, 1],
                });
            } else {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission required', 'Gallery permission is needed to pick a photo.');
                    return;
                }
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    quality: 0.8,
                    base64: true,
                    allowsEditing: true,
                    aspect: [1, 1],
                });
            }

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                let base64 = asset.base64;

                if (!base64) {
                    Alert.alert('Error', 'Could not read image data. Please try a different image.');
                    return;
                }
                const mimeType = asset.mimeType || 'image/jpeg';
                const dataUri = `data:${mimeType};base64,${base64}`;
                onPick(asset.uri, dataUri);
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleTap = () => {
        Alert.alert('Select Logo', 'Choose a source', [
            { text: 'Camera', onPress: () => pickImage('camera') },
            { text: 'Gallery', onPress: () => pickImage('library') },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    return (
        <TouchableOpacity
            onPress={handleTap}
            activeOpacity={0.8}
            style={[styles.container, logoUri ? styles.containerFilled : styles.containerEmpty]}
        >
            {loading ? (
                <ActivityIndicator color={Colors.primary} size="large" />
            ) : logoUri ? (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: logoUri }} style={styles.previewImage} resizeMode="contain" />
                    <Text style={styles.changeText}>Tap to change</Text>
                </View>
            ) : (
                <View style={styles.placeholder}>
                    <Ionicons name="cloud-upload-outline" size={40} color={Colors.mutedForeground} />
                    <Text style={styles.uploadText}>Upload Company Logo</Text>
                    <Text style={styles.subText}>PNG, JPG, SVG · Max 5MB</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 130,
        borderRadius: Layout.borderRadius,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    containerEmpty: {
        borderColor: Colors.border,
        borderStyle: 'dashed',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    containerFilled: {
        borderColor: Colors.primary,
        borderStyle: 'solid',
        backgroundColor: 'rgba(192,132,252,0.06)',
    },
    placeholder: {
        alignItems: 'center',
        gap: 6,
    },
    uploadText: {
        color: Colors.foreground,
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
    },
    subText: {
        color: Colors.mutedForeground,
        fontSize: 12,
    },
    previewContainer: {
        alignItems: 'center',
        gap: 4,
    },
    previewImage: {
        width: 80,
        height: 80,
    },
    changeText: {
        color: Colors.mutedForeground,
        fontSize: 11,
    },
});

export default LogoPicker;
