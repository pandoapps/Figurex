import type { AdStatus, PaymentStatus, Rarity, ShippingStatus, TicketStatus } from '../types';

type BadgeTone = 'green' | 'yellow' | 'blue' | 'red' | 'gold' | 'neutral';

interface BadgeInfo {
  label: string;
  tone: BadgeTone;
}

export const AD_STATUS: Record<AdStatus, BadgeInfo> = {
  pendente: { label: 'Pendente', tone: 'yellow' },
  aprovado: { label: 'Aprovado', tone: 'green' },
  rejeitado: { label: 'Rejeitado', tone: 'red' },
  reservado: { label: 'Reservado', tone: 'yellow' },
  vendido: { label: 'Vendido', tone: 'blue' },
};

export const PAYMENT_STATUS: Record<PaymentStatus, BadgeInfo> = {
  pendente: { label: 'Pendente', tone: 'yellow' },
  pago: { label: 'Pago', tone: 'green' },
};

export const SHIPPING_STATUS: Record<ShippingStatus, BadgeInfo> = {
  aguardando_envio: { label: 'Aguardando envio', tone: 'yellow' },
  enviado: { label: 'Enviado', tone: 'blue' },
  entregue: { label: 'Entregue', tone: 'green' },
};

export const TICKET_STATUS: Record<TicketStatus, BadgeInfo> = {
  aberto: { label: 'Aberto', tone: 'blue' },
  em_analise: { label: 'Em análise', tone: 'yellow' },
  resolvido: { label: 'Resolvido', tone: 'green' },
};

export function rarityTone(rarity: Rarity): BadgeTone {
  if (rarity === 'Lendário') {
    return 'gold';
  }
  if (rarity === 'Raro') {
    return 'blue';
  }
  return 'neutral';
}

export function transactionTone(label: string): BadgeTone {
  switch (label) {
    case 'Entregue':
      return 'green';
    case 'Enviado':
      return 'blue';
    case 'Pago':
      return 'green';
    case 'Pendente':
      return 'yellow';
    default:
      return 'neutral';
  }
}
