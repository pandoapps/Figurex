import { api } from './api';
import type { StickerDefinition, Team } from '../types';

export interface TeamPayload {
  name: string;
  flag_photo?: File | null;
  team_photo?: File | null;
}

/** Monta o FormData da seleção (suporta upload da bandeira e da foto do time). */
function buildTeamFormData(payload: TeamPayload): FormData {
  const form = new FormData();
  form.append('name', payload.name);
  if (payload.flag_photo) {
    form.append('flag_photo', payload.flag_photo);
  }
  if (payload.team_photo) {
    form.append('team_photo', payload.team_photo);
  }
  return form;
}

export const teamService = {
  async list(): Promise<Team[]> {
    const { data } = await api.get<{ data: Team[] }>('/teams');
    return data.data;
  },

  async create(payload: TeamPayload): Promise<Team> {
    const { data } = await api.post<{ team: Team }>(
      '/admin/teams',
      buildTeamFormData(payload),
    );
    return data.team;
  },

  async update(id: number, payload: TeamPayload): Promise<Team> {
    // Method spoofing: PUT com multipart é enviado como POST + _method.
    const form = buildTeamFormData(payload);
    form.append('_method', 'PUT');
    const { data } = await api.post<{ team: Team }>(`/admin/teams/${id}`, form);
    return data.team;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/admin/teams/${id}`);
  },
};

export interface StickerDefinitionPayload {
  team_id: number;
  player_name: string;
  rarity: string;
  photo?: File | null;
}

/** Monta o FormData enviado para a API (suporta upload da foto do jogador). */
function buildFormData(payload: StickerDefinitionPayload): FormData {
  const form = new FormData();
  form.append('team_id', String(payload.team_id));
  form.append('player_name', payload.player_name);
  form.append('rarity', payload.rarity);
  if (payload.photo) {
    form.append('photo', payload.photo);
  }
  return form;
}

export const stickerDefinitionService = {
  async list(teamId?: number): Promise<StickerDefinition[]> {
    const { data } = await api.get<{ data: StickerDefinition[] }>('/sticker-definitions', {
      params: teamId ? { team_id: teamId } : {},
    });
    return data.data;
  },

  async create(payload: StickerDefinitionPayload): Promise<StickerDefinition> {
    const { data } = await api.post<{ sticker_definition: StickerDefinition }>(
      '/admin/sticker-definitions',
      buildFormData(payload),
    );
    return data.sticker_definition;
  },

  async update(id: number, payload: StickerDefinitionPayload): Promise<StickerDefinition> {
    // Method spoofing: PUT com multipart é enviado como POST + _method.
    const form = buildFormData(payload);
    form.append('_method', 'PUT');
    const { data } = await api.post<{ sticker_definition: StickerDefinition }>(
      `/admin/sticker-definitions/${id}`,
      form,
    );
    return data.sticker_definition;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/admin/sticker-definitions/${id}`);
  },
};
