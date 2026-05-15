import { api } from './api';

export interface WhatsAppMessage {
  key: {
    id: string;
    fromMe: boolean;
    remoteJid: string;
  };
  message?: {
    conversation?: string;
    extendedTextMessage?: { text: string };
  };
  messageTimestamp: number;
  status?: string;
}

export interface ConnectionStatus {
  state: 'open' | 'connecting' | 'close' | 'unknown';
  qrcode: string | null;
}

export const evolutionService = {
  async connectionStatus(): Promise<ConnectionStatus> {
    const { data } = await api.get<ConnectionStatus>('/admin/whatsapp/status');
    return data;
  },

  async getMessages(userId: number): Promise<WhatsAppMessage[]> {
    const { data } = await api.get<{ messages: WhatsAppMessage[] }>(
      `/admin/whatsapp/${userId}/messages`,
    );
    return data.messages;
  },

  async sendMessage(userId: number, message: string): Promise<void> {
    await api.post(`/admin/whatsapp/${userId}/send`, { message });
  },
};
