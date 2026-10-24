import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';

import { api, ApiError, type AuthResponse, type Credentials, type Registration, type User } from '@/lib/api';
import { tokenStore } from '@/lib/token-store';

type Session = { user: User; token: string };
type AuthContextValue = {
  user: User | null;
  restoring: boolean;
  restoreError: string | null;
  restore: () => Promise<void>;
  login: (input: Credentials) => Promise<void>;
  register: (input: Registration) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

async function loadSession(): Promise<Session | null> {
  const token = await tokenStore.get();
  if (!token) return null;
  try {
    const data = await api<{ user: User }>('/user', { token });
    return { token, user: data.user };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      await tokenStore.remove();
      return null;
    }
    throw error;
  }
}
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const restore = useCallback(async () => {
    setRestoring(true);
    setRestoreError(null);
    try {
      setSession(await loadSession());
    } catch (error) {
      setRestoreError(error instanceof Error ? error.message : 'No se pudo recuperar la sesión.');
    } finally {
      setRestoring(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void loadSession()
      .then((value) => { if (active) setSession(value); })
      .catch((error: unknown) => {
        if (active) setRestoreError(error instanceof Error ? error.message : 'No se pudo recuperar la sesión.');
      })
      .finally(() => { if (active) setRestoring(false); });
    return () => { active = false; };
  }, []);
  async function authenticate(path: string, input: Credentials | Registration) {
    const data = await api<AuthResponse>(path, {
      method: 'POST',
      body: { ...input, email: input.email.trim().toLowerCase(), device_name: 'Wellness ' + Platform.OS },
    });
    try {
      await tokenStore.set(data.token);
    } catch {
      // Do not leave an active token if the device cannot save the session.
      await api<void>('/logout', { method: 'POST', token: data.token }).catch(() => undefined);
      throw new Error('No pudimos guardar la sesión de forma segura. Intenta nuevamente.');
    }
    setSession({ token: data.token, user: data.user });
  }

  async function logout() {
    if (!session) return;
    try {
      await api<void>('/logout', { method: 'POST', token: session.token });
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) throw error;
    }
    await tokenStore.remove();
    setSession(null);
  }

  async function refresh() {
    if (!session) return;
    try {
      const data = await api<{ user: User }>('/user', { token: session.token });
      setSession({ ...session, user: data.user });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await tokenStore.remove();
        setSession(null);
        return;
      }
      throw error;
    }
  }

  return (
    <AuthContext.Provider value={{
      user: session?.user ?? null,
      restoring,
      restoreError,
      restore,
      login: (input) => authenticate('/login', input),
      register: (input) => authenticate('/register', input),
      logout,
      refresh,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth requiere AuthProvider.');
  return context;
}
