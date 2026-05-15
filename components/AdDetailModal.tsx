import { motion } from 'motion/react';
import { ShoppingCart } from 'lucide-react';
import { useModalClose } from '../hooks/useModalClose';
import { useAuth } from '../hooks/useAuth';
import type { Ad } from '../types';
import { formatCurrency } from '../utils/format';
import StickerImage from './ui/StickerImage';

interface AdDetailModalProps {
  ad: Ad | null;
  onClose: () => void;
  onBuy: (ad: Ad) => void;
}

export default function AdDetailModal({ ad, onClose, onBuy }: AdDetailModalProps) {
  const { user } = useAuth();
  useModalClose(Boolean(ad), onClose);

  if (!ad) {
    return null;
  }

  const isLegendary = ad.rarity === 'Lendário';
  const soldOut = ad.status === 'vendido' || ad.status === 'reservado';
  const isOwnAd = user?.id === ad.seller.id;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass max-w-4xl w-full overflow-hidden flex flex-col md:flex-row relative z-10"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-white/20 transition-all z-20"
        >
          ✕
        </button>

        <div className="md:w-1/2 h-72 md:h-[460px] bg-white/5 flex items-center justify-center">
          <div className="bg-white/5 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-xl aspect-[3/4.2] flex items-center justify-center h-[80%] overflow-hidden">
            <StickerImage imageUrl={ad.image_url} alt={ad.title} emojiClassName="text-[160px]" />
          </div>
        </div>

        <div className="md:w-1/2 p-10 flex flex-col justify-center">
          <span
            className={`inline-block text-[10px] uppercase font-extrabold tracking-widest py-1 px-3 rounded-full mb-4 w-fit ${
              isLegendary ? 'bg-[#f5c518] text-[#0a1628]' : 'bg-white/10'
            }`}
          >
            {ad.rarity}
          </span>
          <h2 className="text-3xl font-bold mb-2">{ad.title}</h2>
          <p className="text-[#b0bec5] mb-6">{ad.description ?? 'Sem descrição informada.'}</p>

          <div className="space-y-1 mb-8">
            <div className="flex justify-between items-center py-3 border-b border-white/10">
              <span className="text-[#b0bec5]">Anunciante</span>
              <span className="font-bold">👤 {ad.seller.name ?? 'Colecionador'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/10">
              <span className="text-[#b0bec5]">Seleção</span>
              <span className="bg-white/5 px-3 py-1 rounded-lg text-sm">
                {ad.team ?? 'Sem seleção'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-2xl font-bold text-[#f5c518]">{formatCurrency(ad.price)}</span>
              <span className="text-xs text-green-400">Entrega via FreteNet</span>
            </div>
          </div>

          {isOwnAd ? (
            <div className="w-full py-4 text-center text-sm text-[#b0bec5] glass rounded-xl">
              Este é o seu anúncio
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onBuy(ad)}
              disabled={soldOut}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
            >
              <ShoppingCart size={20} />
              {soldOut ? 'FIGURINHA VENDIDA' : 'COMPRAR AGORA'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
