import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Text,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/theme';

// Keep native splash visible until we're ready to show our custom one
SplashScreen.preventAutoHideAsync();

const SPLASH_DURATION = 2200; // ms

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const spinnerOpacity = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Hide native splash immediately, show our JS one
    SplashScreen.hideAsync();

    // Animate logo in
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Fade in spinner after logo appears
      Animated.timing(spinnerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    });

    // After duration, fade out the custom splash
    const timer = setTimeout(() => {
      setAppReady(true);
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setShowCustomSplash(false));
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.root}>
      {/* Main app — rendered behind splash so it's ready instantly */}
      {appReady && <AppNavigator />}

      {/* Custom JS splash screen */}
      {showCustomSplash && (
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.splash, { opacity: splashOpacity }]}
          pointerEvents="none"
        >
          {/* Background gradient blobs */}
          <View style={[styles.blob, styles.blob1]} />
          <View style={[styles.blob, styles.blob2]} />

          {/* Logo */}
          <Animated.View
            style={[
              styles.logoWrap,
              { opacity: logoOpacity, transform: [{ scale: logoScale }] },
            ]}
          >
            <Image
              source={require('./assets/app-icon.png')}
              style={styles.logoImg}
              resizeMode="contain"
            />
          </Animated.View>

          {/* App name */}
          <Animated.Text style={[styles.appName, { opacity: logoOpacity }]}>
            Korevyn
          </Animated.Text>
          <Animated.Text style={[styles.tagline, { opacity: logoOpacity }]}>
            AI Landing Page Generator
          </Animated.Text>

          {/* Spinner */}
          <Animated.View style={[styles.spinnerWrap, { opacity: spinnerOpacity }]}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  splash: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.12,
  },
  blob1: {
    width: 300,
    height: 300,
    backgroundColor: '#7c3aed',
    top: -80,
    left: -80,
  },
  blob2: {
    width: 280,
    height: 280,
    backgroundColor: '#06b6d4',
    bottom: -60,
    right: -80,
  },
  logoWrap: {
    width: 110,
    height: 110,
    borderRadius: 28,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    // Shadow
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  logoImg: {
    width: 70,
    height: 70,
  },
  appName: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tagline: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  spinnerWrap: {
    position: 'absolute',
    bottom: 80,
  },
});
