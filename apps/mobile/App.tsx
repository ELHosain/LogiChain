import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { db } from './src/services/database';
import { getToken, AuthAPI } from './src/services/api';
import { useAuthStore } from './src/store';
import { useNetwork } from './src/hooks/useNetwork';
import AppNavigator from './src/navigation/AppNavigator';
import HeaderLogo from './src/components/HeaderLogo';
import ScreenBackground from './src/components/ScreenBackground';
import { Colors } from './src/utils/theme';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });
function NetworkWatcher() { useNetwork(); return null; }

export default function App() {
  const [ready, setReady] = useState(false);
  const { setAuth } = useAuthStore();
  useEffect(() => {
    (async () => {
      await db.init();
      const token = await getToken();
      if (token) { try { const user = await AuthAPI.me(); setAuth(token, user); } catch {} }
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ScreenBackground />
        <HeaderLogo size="lg" showText={false} />
        <Text style={styles.loadingText}>Logi<Text style={{ color: Colors.primary }}>Chain</Text></Text>
        <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NetworkWatcher />
          <StatusBar style="dark" />
          <AppNavigator />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 26, fontWeight: '800', color: Colors.text, marginTop: 16, letterSpacing: -0.5 },
});
