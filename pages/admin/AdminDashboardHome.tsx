import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Spinner from '../../components/ui/Spinner';
import { dashboardService } from '../../services/dashboardService';
import { resolveErrorMessage } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/format';
import type { AdminDashboard } from '../../types';

export default function AdminDashboardHome() {
  const toast = useToast();
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .admin()
      .then(setData)
      .catch((error) => toast.error(resolveErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [toast]);

  const cards = data
    ? [
        { label: 'Colecionadores cadastrados', value: String(data.cards.total_users), icon: '👥' },
        { label: 'Anúncios na plataforma', value: String(data.cards.total_ads), icon: '📦' },
        { label: 'Vendas do mês', value: formatCurrency(data.cards.monthly_revenue), icon: '📈' },
        { label: 'Vendas concluídas', value: String(data.cards.completed_sales), icon: '✅' },
      ]
    : [];

  const maxValue = data
    ? Math.max(...data.sales_chart.map((point) => point.value), 1)
    : 1;

  const totalSales = data
    ? data.sales_chart.reduce((sum, point) => sum + point.value, 0)
    : 0;

  return (
    <div>
      <DashboardHeader
        title="Painel de Controle"
        subtitle="Visão geral da plataforma Figurex."
      />

      {loading ? (
        <Spinner label="Carregando indicadores..." />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          <div className="glass p-8">
            <div className="flex flex-wrap justify-between items-start gap-2 mb-6">
              <h3 className="font-bold">Volume de vendas — últimos 15 dias</h3>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold tracking-widest text-[#b0bec5]">
                  Total no período
                </div>
                <div className="text-xl font-bold text-[#f5c518]">
                  {formatCurrency(totalSales)}
                </div>
              </div>
            </div>
            <div className="h-64 flex items-end gap-1.5">
              {data?.sales_chart.map((point) => (
                <div key={point.label} className="flex-grow flex flex-col items-center gap-2 h-full">
                  <div className="flex-grow w-full flex items-end">
                    <div
                      title={`${point.label}: ${formatCurrency(point.value)}`}
                      className="w-full bg-[#f5c518]/20 border-t-2 border-[#f5c518] rounded-t-lg transition-all hover:bg-[#f5c518]/40"
                      style={{ height: `${Math.max((point.value / maxValue) * 100, 4)}%` }}
                    />
                  </div>
                  <span className="text-[9px] uppercase text-[#b0bec5]">{point.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
