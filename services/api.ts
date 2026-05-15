import axios, { AxiosError } from 'axios';

const TOKEN_KEY = 'figurex_token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
  },
});

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Extrai uma mensagem de erro legível para o usuário, evitando expor
 * detalhes técnicos ou um simples "Error 500".
 */
export function resolveErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined;

    if (data?.errors) {
      const first = Object.values(data.errors)[0];
      if (first && first.length > 0) {
        return first[0];
      }
    }

    if (data?.message) {
      return data.message;
    }

    if (error.code === 'ERR_NETWORK') {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
    }
  }

  return 'Ocorreu um erro inesperado. Tente novamente em instantes.';
}
