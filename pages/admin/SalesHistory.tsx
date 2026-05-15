import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import { transactionService, type AdminTransactionFilters } from '../../services/transactionService';
import { resolveErrorMessage } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { formatCurrency, formatDate } from '../../utils/format';
import { PAYMENT_STATUS, SHIPPING_STATUS } from '../../utils/status';
import type { Transaction } from '../../types';

export default function SalesHistory() {
  const toast = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AdminTransactionFilters>({
    from: '',
    to: '',
    payment_status: '',
  });

  const remove = async (transaction: Transaction) => {
    if (!window.confirm(`Remover a transação #${transaction.id} (${transaction.item_name}) da plataforma?`)) {
      return;
    }

    try {
      await transactionService.adminRemove(transaction.id);
      setTransactions((current) => current.filter((item) => item.id !== transaction.id));
      toast.success('Transação removida com sucesso.');
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    }
  };

  useEffect(() => {
    setLoading(true);
    transactionService
      .adminList({
        from: filters.from || undefined,
        to: filters.to || undefined,
        payment_status: filters.payment_status || undefined,
      })
      .then(setTransactions)
      .catch((error) => toast.error(resolveErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [filters, toast]);

  return (
    <div>
      <DashboardHeader
        title="Histórico de Vendas"
        subtitle="Todas as transações realizadas na plataforma."
      />

      <div className="glass overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-wrap gap-4 items-end bg-white/5">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[#b0bec5]">Data inicial</label>
            <input
              type="date"
              className="input-field py-2 text-xs bg-[#1a3a5c]"
              value={filters.from}
              onChange={(event) => setFilters({ ...filters, from: event.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[#b0bec5]">Data final</label>
            <input
              type="date"
              className="input-field py-2 text-xs bg-[#1a3a5c]"
              value={filters.to}
              onChange={(event) => setFilters({ ...filters, to: event.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[#b0bec5]">
              Status do pagamento
            </label>
            <select
              className="input-field py-2 text-xs bg-[#1a3a5c]"
              value={filters.payment_status}
              onChange={(event) =>
                setFilters({ ...filters, payment_status: event.target.value })
              }
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Spinner label="Carregando transações..." />
        ) : transactions.length === 0 ? (
          <div className="p-10">
            <EmptyState icon="📈" title="Nenhuma transação no período selecionado" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="bg-white/10 uppercase text-[10px] tracking-widest text-[#b0bec5]">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Figurinha</th>
                <th className="px-6 py-4">Comprador</th>
                <th className="px-6 py-4">Vendedor</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Pagamento</th>
                <th className="px-6 py-4">Envio</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-all"
                >
                  <td className="px-6 py-4 text-[#b0bec5] font-mono">#{transaction.id}</td>
                  <td className="px-6 py-4 font-medium">{transaction.item_name}</td>
                  <td className="px-6 py-4">{transaction.buyer.name}</td>
                  <td className="px-6 py-4">{transaction.seller.name}</td>
                  <td className="px-6 py-4 text-[#f5c518] font-bold">
                    {formatCurrency(transaction.value)}
                  </td>
                  <td className="px-6 py-4 text-[#b0bec5] text-xs">
                    {formatDate(transaction.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      label={PAYMENT_STATUS[transaction.payment_status].label}
                      tone={PAYMENT_STATUS[transaction.payment_status].tone}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      label={SHIPPING_STATUS[transaction.shipping_status].label}
                      tone={SHIPPING_STATUS[transaction.shipping_status].tone}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => remove(transaction)}
                      className="p-2 glass hover:bg-red-500/20 text-red-400 transition-colors"
                      aria-label="Remover"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
