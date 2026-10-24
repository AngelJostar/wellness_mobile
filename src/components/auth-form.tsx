import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Action, Brand, ErrorMessage, Field, Page, styles } from '@/components/wellness-ui';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { login, register } = useAuth();
  const registering = mode === 'register';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [code, setCode] = useState('');
  const [needsCode, setNeedsCode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (busy) return;
    setError(null);
    if (!email.trim() || !password || (registering && !name.trim())) {
      setError('Completa los campos para continuar.');
      return;
    }
    if (registering && password !== confirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (needsCode && !/^\d{6}$/.test(code)) {
      setError('Ingresa el código de verificación de 6 dígitos.');
      return;
    }
    setBusy(true);
    try {
      if (registering) {
        await register({ name: name.trim(), email, password, password_confirmation: confirmation });
      } else {
        await login({ email, password, ...(needsCode ? { code } : {}) });
      }
      setPassword('');
      setConfirmation('');
      setCode('');
    } catch (failure) {
      if (failure instanceof ApiError && failure.body.two_factor_required) setNeedsCode(true);
      setError(failure instanceof Error ? failure.message : 'No se pudo completar la solicitud.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <Brand />
      <View>
        <Text style={styles.eyebrow}>{registering ? 'Un nuevo comienzo' : 'Tu espacio de bienestar'}</Text>
        <Text style={styles.title}>{registering ? 'Empieza por ti.' : 'Qué bueno verte.'}</Text>
        <Text style={styles.subtitle}>
          {registering ? 'Crea tu cuenta y da el primer paso hacia tu bienestar.' : 'Entra a tu cuenta para continuar cuidando de ti.'}
        </Text>
      </View>
      <View style={styles.card}>
        {registering && <Field label="Nombre completo" value={name} onChangeText={setName} autoComplete="name" autoCapitalize="words" editable={!busy} maxLength={255} />}
        <Field label="Correo electrónico" value={email} onChangeText={(value) => { setEmail(value); setNeedsCode(false); setCode(''); }} keyboardType="email-address" autoComplete="email" autoCapitalize="none" autoCorrect={false} editable={!busy} maxLength={255} placeholder="tu@correo.com" />
        <Field label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry autoComplete={registering ? 'new-password' : 'current-password'} editable={!busy} maxLength={255} />
        {registering && <Field label="Confirmar contraseña" value={confirmation} onChangeText={setConfirmation} secureTextEntry autoComplete="new-password" editable={!busy} maxLength={255} />}
        {needsCode && <Field label="Código de tu app de autenticación" value={code} onChangeText={setCode} keyboardType="number-pad" autoComplete="one-time-code" maxLength={6} editable={!busy} />}
        <ErrorMessage message={error} />
        <Action title={registering ? 'Crear mi cuenta' : 'Iniciar sesión'} onPress={() => { void submit(); }} busy={busy} />
      </View>
      {!busy && <Text style={styles.footer}>
        {registering ? '¿Ya tienes cuenta? ' : '¿Es tu primera vez? '}
        <Link href={registering ? '/login' : '/register'} replace style={styles.link}>
          {registering ? 'Inicia sesión' : 'Crea tu cuenta'}
        </Link>
      </Text>}
    </Page>
  );
}
