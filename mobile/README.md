# Korevyn Mobile App

AI-powered landing page generator — React Native (Expo) mobile client.

## Setup

1. Copy env template:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` — set `EXPO_PUBLIC_API_BASE_URL` to your backend URL:
   ```
   EXPO_PUBLIC_API_BASE_URL=https://your-server.onrender.com
   ```

## Run

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your phone, or press:
- `a` — Android emulator
- `i` — iOS simulator (Mac only)

## Project Structure

```
mobile/
├── App.tsx                    # Entry point
├── app.json                   # Expo config (name, splash, permissions)
├── .env.example               # Environment variable template
└── src/
    ├── theme/
    │   ├── colors.ts          # Purple/cyan/teal design tokens
    │   └── typography.ts      # Text styles & layout constants
    ├── services/
    │   └── api.ts             # Axios client → backend API
    ├── navigation/
    │   └── AppNavigator.tsx   # Stack navigation (Home → Preview)
    ├── screens/
    │   ├── HomeScreen.tsx     # Generator form + hero
    │   └── PreviewScreen.tsx  # WebView preview + export
    └── components/
        ├── GradientButton.tsx # Purple→cyan gradient CTA button
        ├── GlassCard.tsx      # Glass-morphism card
        ├── LogoPicker.tsx     # Camera/gallery logo picker
        ├── LeadFormSheet.tsx  # Lead capture bottom sheet
        └── LoadingOverlay.tsx # AI generation loading modal
```
