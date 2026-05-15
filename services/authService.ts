import { api } from './api';
import type { User } from '../types';

interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/login', { email, password });
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/register', payload);
    return data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<{ data: User }>('/me');
    return data.data;
  },

  async logout(): Promise<void> {
    await api.post('/logout');
  },

  async updateProfile(payload: Partial<User>): Promise<User> {
    const { data } = await api.put<{ user: User }>('/profile', payload);
    return data.user;
  },
};
