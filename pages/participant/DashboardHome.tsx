import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Spinner from '../../components/ui/Spinner';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { dashboardService } from '../../services/dashboardService';
import { resolveErrorMessage } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { transactionTone } from '../../utils/status';
import type { ParticipantDashboard } from '../../types';

export default function DashboardHome() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState<ParticipantDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .participant()
      .then(setData)
      .catch((error) => toast.error(resolveErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [toast]);

  const cards = data
    ? [
        { label: 'Anúncios ativos', value: String(data.cards.active_ads), icon: '📦' },
        { label: 'Anúncios pendentes', value: String(data.cards.pending_ads), icon: '⏳' },
        { label: 'Vendas realizadas', value: String(data.cards.completed_sales), icon: '💰' },
        { label: 'Saldo disponível', value: formatCurrency(data.cards.balance), icon: '💳' },
      ]
    : [];

  return (
    <div>
      <DashboardHeader
        title={`Olá, ${user?.name ?? 'Colecionador'}!`}
        subtitle="Bem-vindo de volta à Figurex."
      />

      {loading ? (
        <Spinner label="Carregando seu painel..." />
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {cards.map((card) => (
              <div key={card.label} className="glass p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl">{card.icon}</span>
                  <span className="text-[#b0bec5] text-[10px] uppercase font-bold tracking-widest text-right">
                    {card.label}
                  </span>
                </div>
                <div className="text-2xl font-bold">{card.value}</div>
              </div>
            ))}
          </div>

          <div className="glass overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="font-bold">Atividades recentes</h3>
            </div>
            {data && data.activities.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-white/5 uppercase text-[10px] tracking-widest text-[#b0bec5]">
                    <th className="px-6 py-4">Evento</th>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.activities.map((activity) => (
                    <tr
                      key={activity.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-all"
                    >
                      <td className="px-6 py-4">{activity.description}</td>
                      <td className="px-6 py-4 text-[#b0bec5]">
                        {formatDateTime(activity.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        {activity.status && (
                          <StatusBadge
                            label={activity.status}
                            tone={transactionTone(activity.status)}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-10">
                <EmptyState
                  icon="🗒️"
                  title="Nenhuma atividade ainda"
                  description="Suas ações na plataforma aparecerão aqui."
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
