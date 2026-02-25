// Design tokens mirrored from web app's index.css HSL variables
export const Colors = {
    background: '#111827',      // hsl(220 25% 8%) - deep dark navy
    card: '#131f2e',            // hsl(220 25% 10%)
    primary: '#c084fc',         // hsl(271 81% 76%) - purple
    secondary: '#0ea5e9',       // hsl(199 89% 48%) - cyan
    accent: '#06b6d4',          // hsl(188 95% 42%) - teal
    muted: '#1e293b',           // hsl(220 20% 20%)
    mutedForeground: '#94a3b8', // hsl(215 20% 65%)
    foreground: '#f8fafc',      // hsl(210 40% 98%)
    border: '#1e2a3a',          // hsl(220 20% 18%)
    destructive: '#ef4444',     // hsl(0 84% 60%)

    // Gradient stops
    gradientStart: '#c084fc',   // purple
    gradientMid: '#0ea5e9',     // cyan
    gradientEnd: '#06b6d4',     // teal

    // Glass effect
    glassBackground: 'rgba(192, 132, 252, 0.06)',
    glassBorder: 'rgba(192, 132, 252, 0.18)',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
};

export type ColorKeys = keyof typeof Colors;
