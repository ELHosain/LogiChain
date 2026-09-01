import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontWeight, Typography } from '../utils/theme';
import { Button, Field, GlassCard } from '../components/ui';
import ScreenBackground from '../components/ScreenBackground';
import HeaderLogo from '../components/HeaderLogo';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoggingIn, loginError } = useAuth();

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) { Alert.alert('Champs requis', 'Email et mot de passe.'); return; }
    login({ email: email.trim(), password });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <ScreenBackground />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + Spacing.xxl, paddingBottom: insets.bottom + Spacing.xl }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.brand}>
            <HeaderLogo size="lg" showText={false} />
            <Text style={styles.brandName}>Logi<Text style={{ color: Colors.primary }}>Chain</Text></Text>
            <Text style={styles.tagline}>Logistics Management Platform</Text>
          </View>

          <GlassCard strong style={styles.card}>
            <Text style={styles.cardTitle}>Bienvenue</Text>
            <Text style={styles.cardSub}>Connectez-vous à votre espace</Text>
            <View style={{ marginTop: Spacing.lg }}>
              <Field label="Email" value={email} onChangeText={setEmail} placeholder="vous@logichain.fr" keyboardType="email-address" autoCapitalize="none" icon="mail" />
              <Field label="Mot de passe" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry icon="lock" />
              {loginError && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>Identifiants incorrects</Text>
                </View>
              )}
              <Button label="Se connecter" onPress={handleLogin} loading={isLoggingIn} size="lg" fullWidth style={{ marginTop: Spacing.sm }} />
            </View>
          </GlassCard>

          <Text style={styles.footer}>LA MANU · Projet M2 Data · 2026</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: Spacing.lg, justifyContent: 'center' },
  brand: { alignItems: 'center', marginBottom: Spacing.xl },
  brandName: { fontSize: 34, fontWeight: FontWeight.black, color: Colors.text, marginTop: Spacing.md, letterSpacing: -1 },
  tagline: { fontSize: 13, color: Colors.textMuted, marginTop: 6, letterSpacing: 0.3 },
  card: { padding: Spacing.lg },
  cardTitle: { ...Typography.h2 },
  cardSub: { ...Typography.body, marginTop: 4 },
  errorBox: { backgroundColor: Colors.redDim, borderRadius: Radius.sm, padding: Spacing.sm, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.red + '30' },
  errorText: { color: Colors.red, fontSize: 13, fontWeight: FontWeight.semibold, textAlign: 'center' },
  demo: { padding: Spacing.md, marginTop: Spacing.lg },
  demoTitle: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.textMuted, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: Spacing.sm },
  demoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 10 },
  demoBorder: { borderTopWidth: 1, borderTopColor: Colors.glassLine },
  demoRole: { fontSize: 13, fontWeight: FontWeight.bold, color: Colors.text },
  demoEmail: { fontSize: 11, color: Colors.textMuted },
  demoUse: { fontSize: 12, color: Colors.primary, fontWeight: FontWeight.bold },
  footer: { fontSize: 11, color: Colors.textFaint, textAlign: 'center', marginTop: Spacing.xl },
});
