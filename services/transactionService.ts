import { api } from './api';
import type { Transaction } from '../types';

export interface AdminTransactionFilters {
  from?: string;
  to?: string;
  payment_status?: string;
}

export interface RegisterShippingPayload {
  evidence_image?: File | null;
  tracking_code?: string;
}

export interface CheckoutPayload {
  adId: number;
  destinationCep: string;
  shippingService: string;
}

export const transactionService = {
  async purchases(): Promise<Transaction[]> {
    const { data } = await api.get<{ data: Transaction[] }>('/purchases');
    return data.data;
  },

  async sales(): Promise<Transaction[]> {
    const { data } = await api.get<{ data: Transaction[] }>('/sales');
    return data.data;
  },

  async checkout({ adId, destinationCep, shippingService }: CheckoutPayload): Promise<Transaction> {
    const { data } = await api.post<{ transaction: Transaction }>('/transactions', {
      ad_id: adId,
      destination_cep: destinationCep,
      shipping_service: shippingService,
    });
    return data.transaction;
  },

  async show(id: number): Promise<Transaction> {
    const { data } = await api.get<{ data: Transaction }>(`/transactions/${id}`);
    return data.data;
  },

  async registerShipping(id: number, payload: RegisterShippingPayload): Promise<Transaction> {
    const form = new FormData();
    if (payload.evidence_image) {
      form.append('evidence_image', payload.evidence_image);
    }
    if (payload.tracking_code !== undefined) {
      form.append('tracking_code', payload.tracking_code);
    }

    const { data } = await api.post<{ transaction: Transaction }>(
      `/transactions/${id}/shipping`,
      form,
    );
    return data.transaction;
  },

  async cancel(id: number): Promise<void> {
    await api.post(`/transactions/${id}/cancel`);
  },

  async adminRemove(id: number): Promise<void> {
    await api.delete(`/admin/transactions/${id}`);
  },

  async adminList(filters: AdminTransactionFilters = {}): Promise<Transaction[]> {
    const { data } = await api.get<{ data: Transaction[] }>('/admin/transactions', {
      params: filters,
    });
    return data.data;
  },

  async pollUntilPaid(
    id: number,
    onUpdate: (t: Transaction) => void,
    intervalMs = 5000,
  ): Promise<() => void> {
    let active = true;

    const poll = async () => {
      if (!active) return;
      try {
        const transaction = await transactionService.show(id);
        onUpdate(transaction);
        if (transaction.payment_status !== 'pago' && active) {
          setTimeout(poll, intervalMs);
        }
      } catch {
        if (active) setTimeout(poll, intervalMs);
      }
    };

    setTimeout(poll, intervalMs);

    return () => {
      active = false;
    };
  },
};
