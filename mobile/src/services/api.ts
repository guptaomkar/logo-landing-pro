import axios, { AxiosError } from 'axios';
import Constants from 'expo-constants';

const API_BASE_URL =
    (Constants.expoConfig?.extra?.apiBaseUrl as string) ||
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    'http://localhost:3001';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 90000, // 90s — AI generation can be slow
});

// Error interceptor
apiClient.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
        if (error.response) {
            throw new Error((error.response.data as any)?.error || 'Server error');
        } else if (error.request) {
            throw new Error('Network error — check your connection or API URL');
        } else {
            throw new Error(error.message);
        }
    }
);

export interface GeneratePayload {
    companyName: string;
    companyDescription: string;
    logoBase64: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
    theme: 'light' | 'dark';
}

export interface LeadPayload {
    name: string;
    email: string;
    contactNumber: string;
    businessName: string;
    location: string;
    downloadFormat: 'html' | 'react';
}

export const api = {
    landingPages: {
        generate: async (data: GeneratePayload) => {
            const res = await apiClient.post('/api/landing-pages/generate', data);
            return res.data;
        },
        getById: async (id: string) => {
            const res = await apiClient.get(`/api/landing-pages/${id}`);
            return res.data;
        },
    },
    downloadLeads: {
        create: async (data: LeadPayload) => {
            const res = await apiClient.post('/api/download-leads', data);
            return res.data;
        },
    },
};
