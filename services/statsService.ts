import { api } from './api';
import type { LandingStats } from '../types';

export const statsService = {
  async landing(): Promise<LandingStats> {
    const { data } = await api.get<{ data: LandingStats }>('/stats');
    return data.data;
  },
};
