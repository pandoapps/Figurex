import { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import TransactionDetailModal from '../../components/TransactionDetailModal';
import StickerImage from '../../components/ui/StickerImage';
import { transactionService } from '../../services/transactionService';
import { resolveErrorMessage } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { formatCurrency, formatDate } from '../../utils/format';
import { transactionTone } from '../../utils/status';
import type { Transaction } from '../../types';

export default function MyPurchases() {
  const toast = useToast();
  const [purchases, setPurchases] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Transaction | null>(null);

  useEffect(() => {
    transactionService
      .purchases()
      .then(setPurchases)
      .catch((error) => toast.error(resolveErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <div>
      <DashboardHeader
        title="Minhas Compras"
        subtitle="Acompanhe o status das figurinhas que você comprou."
      />

      {loading ? (
        <Spinner label="Carregando suas compras..." />
      ) : purchases.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="Nenhuma compra realizada"
          description="Explore o mercado e adquira sua primeira figurinha."
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {purchases.map((purchase) => (
            <div
              key={purchase.id}
              onClick={() => setSelected(purchase)}
              className="glass-card group overflow-hidden cursor-pointer"
            >
              <div className="flex-grow bg-white/5 flex items-center justify-center overflow-hidden">
                <StickerImage
                  imageUrl={purchase.item_image_url}
                  alt={purchase.item_name}
                  emojiClassName="text-6xl"
                />
              </div>
              <div className="p-3 bg-black/40 border-t border-white/5">
                <h4 className="font-bold text-xs truncate mb-1">{purchase.item_name}</h4>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#f5c518] font-bold text-xs">
                    {formatCurrency(purchase.value)}
                  </span>
                  <span className="text-[9px] text-[#b0bec5]">
                    {formatDate(purchase.created_at)}
                  </span>
                </div>
                <StatusBadge
                  label={purchase.status_label}
                  tone={transactionTone(purchase.status_label)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <TransactionDetailModal
            transaction={selected}
            perspective="buyer"
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
