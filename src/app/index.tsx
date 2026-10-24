import { useState } from 'react';
import { Text, View } from 'react-native';

import { Action, Brand, ErrorMessage, Page, styles } from '@/components/wellness-ui';
import { useAuth } from '@/providers/auth-provider';

export default function HomeScreen() {
  const { user, logout, refresh } = useAuth();
  const [busy, setBusy] = useState<'refresh' | 'logout' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: 'refresh' | 'logout') {
    if (busy) return;
    setBusy(action);
    setError(null);
    try {
      await (action === 'logout' ? logout() : refresh());
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No se pudo completar la solicitud.');
    } finally {
      setBusy(null);
    }
  }

  if (!user) return null;

  return (
    <Page>
      <Brand />
      <View>
        <Text style={styles.eyebrow}>Mi espacio</Text>
        <Text style={styles.title}>Hola, {user.name.split(' ')[0]}.</Text>
        <Text style={styles.subtitle}>Tu bienestar comienza contigo. Este es tu espacio para dar el siguiente paso.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Tu cuenta</Text>
        <View><Text style={styles.label}>Nombre</Text><Text style={styles.subtitle}>{user.name}</Text></View>
        <View><Text style={styles.label}>Correo electrónico</Text><Text style={styles.subtitle}>{user.email}</Text></View>
        <Text style={styles.footer}>{user.email_verified_at ? 'Correo verificado' : 'Tu correo está pendiente de verificación. Puedes verificarlo desde la web.'}</Text>
      </View>
      <ErrorMessage message={error} />
      <View style={{ gap: 12 }}>
        <Action title="Actualizar mis datos" secondary busy={busy !== null} onPress={() => { void run('refresh'); }} />
        <Action title="Cerrar sesión" busy={busy !== null} onPress={() => { void run('logout'); }} />
      </View>
    </Page>
  );
}
