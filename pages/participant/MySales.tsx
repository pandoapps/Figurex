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

export default function MySales() {
  const toast = useToast();
  const [sales, setSales] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Transaction | null>(null);

  useEffect(() => {
    transactionService
      .sales()
      .then(setSales)
      .catch((error) => toast.error(resolveErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <div>
      <DashboardHeader
        title="Minhas Vendas"
        subtitle="Histórico completo das figurinhas que você vendeu."
      />

      {loading ? (
        <Spinner label="Carregando suas vendas..." />
      ) : sales.length === 0 ? (
        <EmptyState
          icon="💰"
          title="Nenhuma venda realizada"
          description="Quando suas figurinhas forem vendidas, elas aparecerão aqui."
        />
      ) : (
        <div className="glass overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-white/10 uppercase text-[10px] tracking-widest text-[#b0bec5]">
                <th className="px-6 py-4">Figurinha</th>
                <th className="px-6 py-4">Comprador</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr
                  key={sale.id}
                  onClick={() => setSelected(sale)}
                  className="border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer"
                >
                  <td className="px-6 py-4 font-medium flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                      <StickerImage
                        imageUrl={sale.item_image_url}
                        alt={sale.item_name}
                        emojiClassName="text-xl"
                      />
                    </span>
                    {sale.item_name}
                  </td>
                  <td className="px-6 py-4">{sale.buyer.name}</td>
                  <td className="px-6 py-4 text-[#f5c518] font-bold">
                    {formatCurrency(sale.value)}
                  </td>
                  <td className="px-6 py-4 text-[#b0bec5]">{formatDate(sale.created_at)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      label={sale.status_label}
                      tone={transactionTone(sale.status_label)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <TransactionDetailModal
            transaction={selected}
            perspective="seller"
            onClose={() => setSelected(null)}
            onUpdated={(updated) =>
              setSales((current) =>
                current.map((sale) => (sale.id === updated.id ? updated : sale)),
              )
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
