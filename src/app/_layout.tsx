import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Action, Brand, ErrorMessage, Page, palette, styles } from '@/components/wellness-ui';
import { AuthProvider, useAuth } from '@/providers/auth-provider';

function Navigator() {
  const { user, restoring, restoreError, restore } = useAuth();

  if (restoring || restoreError) {
    return (
      <Page>
        <Brand />
        {restoring ? <><ActivityIndicator color={palette.primary} /><Text style={styles.footer}>Preparando tu espacio…</Text></> : (
          <><ErrorMessage message={restoreError} /><Action title="Volver a intentar" onPress={() => { void restore(); }} /></>
        )}
      </Page>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="index" />
        <Stack.Screen name="explore" />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Navigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
