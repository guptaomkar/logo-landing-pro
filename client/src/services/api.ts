import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // 60 seconds for AI generation
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response) {
            // Server responded with error status
            console.error('API Error:', error.response.data);
            throw new Error((error.response.data as any)?.error || 'An error occurred');
        } else if (error.request) {
            // Request made but no response
            console.error('Network Error:', error.request);
            throw new Error('Network error - please check your connection');
        } else {
            // Something else happened
            console.error('Error:', error.message);
            throw new Error(error.message);
        }
    }
);

// API methods
export const api = {
    landingPages: {
        generate: async (data: {
            companyName: string;
            companyDescription: string;
            logoBase64: string;
        }) => {
            const response = await apiClient.post('/api/landing-pages/generate', data);
            return response.data;
        },

        getById: async (id: string) => {
            const response = await apiClient.get(`/api/landing-pages/${id}`);
            return response.data;
        },

        getByPublicUrl: async (publicUrl: string) => {
            const response = await apiClient.get(`/api/landing-pages/preview/${publicUrl}`);
            return response.data;
        },

        regenerateSection: async (id: string, sectionType: string) => {
            const response = await apiClient.post(
                `/api/landing-pages/${id}/sections/${sectionType}/regenerate`
            );
            return response.data;
        },
    },

    downloadLeads: {
        create: async (data: {
            name: string;
            email: string;
            contactNumber: string;
            businessName: string;
            location: string;
            downloadFormat: 'html' | 'react';
        }) => {
            const response = await apiClient.post('/api/download-leads', data);
            return response.data;
        },
    },
};
