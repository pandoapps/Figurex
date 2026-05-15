import { api } from './api';
import type { Ad } from '../types';

export interface AdCatalogFilters {
  search?: string;
  team_id?: number;
  sort?: 'menor_preco' | 'maior_preco' | 'recentes';
}

export interface AdPayload {
  title: string;
  description?: string;
  price: number;
  sticker_definition_id: number;
}

export const adService = {
  async catalog(filters: AdCatalogFilters = {}): Promise<Ad[]> {
    const { data } = await api.get<{ data: Ad[] }>('/ads', { params: filters });
    return data.data;
  },

  async show(id: number): Promise<Ad> {
    const { data } = await api.get<{ data: Ad }>(`/ads/${id}`);
    return data.data;
  },

  async mine(): Promise<Ad[]> {
    const { data } = await api.get<{ data: Ad[] }>('/my-ads');
    return data.data;
  },

  async create(payload: AdPayload): Promise<Ad> {
    const { data } = await api.post<{ ad: Ad }>('/ads', payload);
    return data.ad;
  },

  async update(id: number, payload: Partial<AdPayload>): Promise<Ad> {
    const { data } = await api.put<{ ad: Ad }>(`/ads/${id}`, payload);
    return data.ad;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/ads/${id}`);
  },

  async adminCreate(payload: AdPayload & { user_id: number }): Promise<Ad> {
    const { data } = await api.post<{ ad: Ad }>('/admin/ads', payload);
    return data.ad;
  },

  async adminList(params: { status?: string; search?: string } = {}): Promise<Ad[]> {
    const { data } = await api.get<{ data: Ad[] }>('/admin/ads', { params });
    return data.data;
  },

  async approve(id: number): Promise<Ad> {
    const { data } = await api.patch<{ ad: Ad }>(`/admin/ads/${id}/approve`);
    return data.ad;
  },

  async reject(id: number): Promise<Ad> {
    const { data } = await api.patch<{ ad: Ad }>(`/admin/ads/${id}/reject`);
    return data.ad;
  },

  async adminUpdate(id: number, payload: Partial<AdPayload>): Promise<Ad> {
    const { data } = await api.put<{ ad: Ad }>(`/admin/ads/${id}`, payload);
    return data.ad;
  },

  async adminRemove(id: number): Promise<void> {
    await api.delete(`/admin/ads/${id}`);
  },
};
