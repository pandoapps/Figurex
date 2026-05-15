import { api } from './api';
import type { AdminDashboard, ParticipantDashboard } from '../types';

export const dashboardService = {
  async participant(): Promise<ParticipantDashboard> {
    const { data } = await api.get<ParticipantDashboard>('/dashboard');
    return data;
  },

  async admin(): Promise<AdminDashboard> {
    const { data } = await api.get<AdminDashboard>('/admin/dashboard');
    return data;
  },
};
