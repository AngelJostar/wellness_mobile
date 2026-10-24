import type { PropsWithChildren } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const palette = {
  background: '#F5F7F4', ink: '#152F2B', muted: '#586B65',
  primary: '#176B55', border: '#D9E2DB', white: '#FFFFFF', error: '#9F3038',
};

export function Page({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
          <View style={styles.container}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Brand() {
  return <View style={styles.brand}><View style={styles.mark}><Text style={styles.markText}>w</Text></View><Text style={styles.brandName}>wellness</Text></View>;
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#788780"
        style={styles.input}
        {...props}
      />
    </View>
  );
}

export function Action({ title, onPress, busy = false, secondary = false }: {
  title: string; onPress: () => void; busy?: boolean; secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: busy, busy }}
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [styles.button, secondary && styles.secondary, (busy || pressed) && { opacity: 0.65 }]}>
      {busy ? <ActivityIndicator color={secondary ? palette.primary : palette.white} /> : (
        <Text style={[styles.buttonText, secondary && { color: palette.primary }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function ErrorMessage({ message }: { message: string | null }) {
  return message ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{message}</Text> : null;
}

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 36, justifyContent: 'center' },
  container: { width: '100%', maxWidth: 440, alignSelf: 'center', gap: 24 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  mark: { backgroundColor: palette.primary, width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  markText: { color: palette.white, fontSize: 28, fontWeight: '700', lineHeight: 32 },
  brandName: { color: palette.ink, fontSize: 24, fontWeight: '700', letterSpacing: -0.8 },
  eyebrow: { color: palette.primary, fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  title: { color: palette.ink, fontSize: 34, lineHeight: 40, fontWeight: '700', letterSpacing: -1 },
  subtitle: { color: palette.muted, fontSize: 16, lineHeight: 24, marginTop: 12 },
  card: { backgroundColor: palette.white, padding: 24, borderRadius: 24, borderWidth: 1, borderColor: palette.border, gap: 18 },
  field: { gap: 8 },
  label: { color: palette.ink, fontSize: 14, fontWeight: '600' },
  input: { color: palette.ink, backgroundColor: '#FAFCFA', borderWidth: 1, borderColor: palette.border, borderRadius: 12, minHeight: 52, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  button: { minHeight: 52, backgroundColor: palette.primary, borderRadius: 14, justifyContent: 'center', alignItems: 'center', padding: 14 },
  buttonText: { color: palette.white, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  secondary: { backgroundColor: '#E7F0E9' },
  footer: { color: palette.muted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  link: { color: palette.primary, fontWeight: '700' },
  error: { color: palette.error, backgroundColor: '#FFF0F0', borderRadius: 12, padding: 14, lineHeight: 22 },
});
