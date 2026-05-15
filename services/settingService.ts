import { api } from './api';

export type SettingGroup = 'asaas' | 'fretenet';
export type SettingValues = Record<string, string>;

export const settingService = {
  async get(group: SettingGroup): Promise<SettingValues> {
    const { data } = await api.get<{ settings: SettingValues }>(`/admin/settings/${group}`);
    return data.settings;
  },

  async update(group: SettingGroup, settings: SettingValues): Promise<SettingValues> {
    const { data } = await api.put<{ settings: SettingValues }>(`/admin/settings/${group}`, {
      settings,
    });
    return data.settings;
  },
};
