export type User = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
};

export type Credentials = {
  email: string;
  password: string;
  code?: string;
};

export type Registration = Credentials & {
  name: string;
  password_confirmation: string;
};

export type AuthResponse = {
  user: User;
  token: string;
  expires_at: string;
};

type ErrorBody = {
  message?: string;
  errors?: Record<string, string[]>;
  two_factor_required?: boolean;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: ErrorBody = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '') ?? '';

export async function api<T>(
  path: string,
  options: { method?: 'GET' | 'POST'; body?: unknown; token?: string } = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error('Falta configurar EXPO_PUBLIC_API_URL en el archivo .env.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(API_URL + path, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token ? { Authorization: 'Bearer ' + options.token } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      credentials: 'omit',
      signal: controller.signal,
    });

    if (response.status === 204) return undefined as T;

    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('El servidor no respondió como una API. Revisa la dirección de conexión.');
    }

    const body = await response.json();
    if (!response.ok) {
      const details = body as ErrorBody;
      const message = response.status === 429
        ? 'Demasiados intentos. Espera un minuto antes de volver a intentar.'
        : Object.values(details.errors ?? {}).flat().join('\n') || details.message || 'No se pudo completar la solicitud.';
      throw new ApiError(message, response.status, details);
    }

    return body as T;
  } catch (error) {
    if (error instanceof TypeError || (error instanceof Error && error.name === 'AbortError')) {
      throw new Error('No pudimos conectar con Wellness. Revisa tu conexión e intenta nuevamente.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
