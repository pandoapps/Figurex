import { api } from './api';
import type { User, UserRole, UserStatus } from '../types';

export interface UpdateUserPayload {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string | null;
}

export const userService = {
  async list(search = ''): Promise<User[]> {
    const { data } = await api.get<{ data: User[] }>('/admin/users', {
      params: search ? { search } : {},
    });
    return data.data;
  },

  async update(id: number, payload: UpdateUserPayload): Promise<User> {
    const { data } = await api.put<{ user: User }>(`/admin/users/${id}`, payload);
    return data.user;
  },

  async toggleStatus(id: number): Promise<User> {
    const { data } = await api.patch<{ user: User }>(`/admin/users/${id}/toggle-status`);
    return data.user;
  },
};
