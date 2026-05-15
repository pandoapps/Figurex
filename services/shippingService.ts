import { api } from './api';
import type { ShippingOption } from '../types';

export const shippingService = {
  async quote(adId: number, destinationCep: string): Promise<ShippingOption[]> {
    const { data } = await api.post<{ options: ShippingOption[] }>('/shipping/quote', {
      ad_id: adId,
      destination_cep: destinationCep,
    });
    return data.options;
  },
};
