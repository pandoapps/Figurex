export type UserRole = 'admin' | 'participante';
export type UserStatus = 'ativo' | 'inativo';
export type Rarity = 'Comum' | 'Raro' | 'Lendário';
export type AdStatus = 'pendente' | 'aprovado' | 'rejeitado' | 'reservado' | 'vendido';
export type PaymentStatus = 'pendente' | 'pago';
export type ShippingStatus = 'aguardando_envio' | 'enviado' | 'entregue';
export type TicketStatus = 'aberto' | 'em_analise' | 'resolvido';
export type MessageRole = 'buyer' | 'seller' | 'moderator';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone: string | null;
  cpf: string | null;
  cep: string | null;
  neighborhood: string | null;
  address: string | null;
  number: string | null;
  complement: string | null;
  city: string | null;
  state: string | null;
  image_url: string | null;
  balance: number;
  created_at: string | null;
}

export interface SellerRef {
  id: number;
  name: string;
}

export interface Ad {
  id: number;
  title: string;
  description: string | null;
  price: number;
  rarity: Rarity | null;
  image_url: string | null;
  status: AdStatus;
  seller: SellerRef;
  sticker_definition_id: number;
  player_name: string | null;
  team: string | null;
  created_at: string | null;
}

export interface ShippingOption {
  service: string;
  price: number;
  delivery_days: number | null;
  fallback?: boolean;
}

export interface Transaction {
  id: number;
  ad_id: number;
  item_name: string;
  item_image_url: string | null;
  value: number;
  shipping_cost: number;
  destination_cep: string | null;
  shipping_service: string | null;
  total: number;
  payment_status: PaymentStatus;
  shipping_status: ShippingStatus;
  status_label: string;
  evidence_image_url: string | null;
  tracking_code: string | null;
  asaas_payment_id: string | null;
  pix_qrcode: string | null;
  pix_payload: string | null;
  pix_expiration_date: string | null;
  buyer: SellerRef;
  seller: SellerRef;
  created_at: string | null;
}

export interface Team {
  id: number;
  name: string;
  flag_photo_url: string | null;
  team_photo_url: string | null;
  sticker_definitions?: StickerDefinition[];
}

export interface StickerDefinition {
  id: number;
  team_id: number;
  team?: Team;
  player_name: string;
  image_url: string | null;
  rarity: Rarity;
}

export interface Activity {
  id: number;
  description: string;
  status: string | null;
  created_at: string | null;
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  user_id: number | null;
  sender_name: string;
  role: MessageRole;
  body: string;
  created_at: string | null;
}

export interface Ticket {
  id: number;
  transaction_id: number;
  subject: string;
  status: TicketStatus;
  buyer: SellerRef;
  seller: SellerRef;
  messages?: TicketMessage[];
  created_at: string | null;
}

export interface ParticipantDashboard {
  cards: {
    active_ads: number;
    pending_ads: number;
    completed_sales: number;
    balance: number;
  };
  activities: Activity[];
}

export interface SalesChartPoint {
  label: string;
  value: number;
}

export interface AdminDashboard {
  cards: {
    total_users: number;
    total_ads: number;
    monthly_revenue: number;
    completed_sales: number;
  };
  sales_chart: SalesChartPoint[];
}

export interface LandingStats {
  total_stickers: number;
  total_collectors: number;
  total_sales: number;
}

export interface Paginated<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
  };
}
