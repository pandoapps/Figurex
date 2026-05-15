import { api } from './api';
import type { Ticket, TicketMessage } from '../types';

export const ticketService = {
  async list(): Promise<Ticket[]> {
    const { data } = await api.get<{ data: Ticket[] }>('/tickets');
    return data.data;
  },

  async show(id: number): Promise<Ticket> {
    const { data } = await api.get<{ data: Ticket }>(`/tickets/${id}`);
    return data.data;
  },

  async sendMessage(ticketId: number, body: string): Promise<TicketMessage> {
    const { data } = await api.post<{ ticket_message: TicketMessage }>(
      `/tickets/${ticketId}/messages`,
      { body },
    );
    return data.ticket_message;
  },
};
