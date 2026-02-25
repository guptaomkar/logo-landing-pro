import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Layout } from '../theme';
import GradientButton from './GradientButton';
import { api, LeadPayload } from '../services/api';

interface LeadFormSheetProps {
    visible: boolean;
    onClose: () => void;
    downloadFormat: 'html' | 'react';
    onSuccess: () => void;
}

const LeadFormSheet: React.FC<LeadFormSheetProps> = ({
    visible,
    onClose,
    downloadFormat,
    onSuccess,
}) => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        contactNumber: '',
        businessName: '',
        location: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const update = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!form.name.trim()) newErrors.name = 'Name is required';
        if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
            newErrors.email = 'Valid email required';
        if (!form.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
        if (!form.businessName.trim()) newErrors.businessName = 'Business name is required';
        if (!form.location.trim()) newErrors.location = 'Location is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        try {
            await api.downloadLeads.create({
                ...form,
                downloadFormat,
            } as LeadPayload);
            onSuccess();
            // Reset
            setForm({ name: '', email: '', contactNumber: '', businessName: '', location: '' });
            setErrors({});
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    const Field = ({
        label,
        field,
        placeholder,
        keyboardType = 'default',
    }: {
        label: string;
        field: string;
        placeholder: string;
        keyboardType?: any;
    }) => (
        <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{label} *</Text>
            <TextInput
                value={(form as any)[field]}
                onChangeText={(v) => update(field, v)}
                placeholder={placeholder}
                placeholderTextColor={Colors.mutedForeground}
                keyboardType={keyboardType}
                style={[styles.input, errors[field] ? styles.inputError : {}]}
            />
            {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.sheet}
            >
                <View style={styles.handle} />
                <View style={styles.header}>
                    <Text style={styles.title}>
                        Download {downloadFormat.toUpperCase()} Code
                    </Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={22} color={Colors.mutedForeground} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.subtitle}>Fill in your details to receive the generated code.</Text>

                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <Field label="Full Name" field="name" placeholder="John Doe" />
                    <Field label="Email Address" field="email" placeholder="john@example.com" keyboardType="email-address" />
                    <Field label="Contact Number" field="contactNumber" placeholder="+1 234 567 8900" keyboardType="phone-pad" />
                    <Field label="Business Name" field="businessName" placeholder="Acme Inc." />
                    <Field label="Location" field="location" placeholder="New York, USA" />

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <GradientButton
                            label={submitting ? 'Processing...' : 'Download'}
                            onPress={handleSubmit}
                            loading={submitting}
                            style={{ flex: 1 }}
                            icon={
                                !submitting ? (
                                    <Ionicons name="download-outline" size={18} color="#fff" />
                                ) : undefined
                            }
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
        backgroundColor: Colors.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderColor: Colors.glassBorder,
        maxHeight: '80%',
    },
    handle: {
        width: 36,
        height: 4,
        backgroundColor: Colors.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    title: {
        color: Colors.foreground,
        fontSize: 18,
        fontWeight: '700',
    },
    subtitle: {
        color: Colors.mutedForeground,
        fontSize: 13,
        marginBottom: 16,
    },
    fieldWrap: { marginBottom: 14 },
    fieldLabel: {
        color: Colors.foreground,
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 6,
    },
    input: {
        backgroundColor: Colors.muted,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Layout.borderRadiusSm,
        padding: 12,
        color: Colors.foreground,
        fontSize: 15,
    },
    inputError: { borderColor: Colors.destructive },
    errorText: { color: Colors.destructive, fontSize: 11, marginTop: 3 },
    actions: { flexDirection: 'row', gap: 10, marginTop: 20 },
    cancelBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Layout.borderRadius,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
    },
    cancelText: { color: Colors.mutedForeground, fontSize: 15, fontWeight: '600' },
});

export default LeadFormSheet;
