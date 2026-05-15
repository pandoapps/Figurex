import { motion } from 'motion/react';
import type { Ad } from '../types';
import { formatCurrency } from '../utils/format';
import StickerImage from './ui/StickerImage';

interface StickerCardProps {
  ad: Ad;
  onClick?: (ad: Ad) => void;
  footer?: React.ReactNode;
}

export default function StickerCard({ ad, onClick, footer }: StickerCardProps) {
  const isLegendary = ad.rarity === 'Lendário';

  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      onClick={() => onClick?.(ad)}
      className={`glass-card group overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex-grow bg-white/5 flex items-center justify-center relative overflow-hidden group-hover:bg-white/10 transition-colors">
        <StickerImage imageUrl={ad.image_url} alt={ad.title} emojiClassName="text-7xl" />
        <div className="absolute top-2 right-2 z-10">
          <span
            className={`text-[9px] uppercase font-bold py-1 px-2 rounded-lg shadow-lg ${
              isLegendary
                ? 'bg-[#f5c518] text-[#0a1628]'
                : 'bg-white/20 backdrop-blur-md border border-white/10'
            }`}
          >
            {ad.rarity}
          </span>
        </div>
      </div>
      <div className="p-3 bg-black/40 border-t border-white/5">
        <h3 className="font-bold text-sm truncate mb-1">{ad.title}</h3>
        <div className="flex justify-between items-center">
          <span className="text-[#f5c518] font-bold text-sm">{formatCurrency(ad.price)}</span>
          {footer ?? (
            <span className="text-[10px] text-[#b0bec5] bg-white/10 px-2 py-0.5 rounded">
              Ver +
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
