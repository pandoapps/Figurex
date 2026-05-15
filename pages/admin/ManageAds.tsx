import { useEffect, useState } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import StickerImage from '../../components/ui/StickerImage';
import CreateAdModal from '../../components/CreateAdModal';
import EditAdModal from '../../components/EditAdModal';
import { adService } from '../../services/adService';
import { resolveErrorMessage } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/format';
import { AD_STATUS } from '../../utils/status';
import type { Ad, AdStatus } from '../../types';

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'Todos os status' },
  { value: 'pendente', label: 'Pendentes' },
  { value: 'aprovado', label: 'Aprovados' },
  { value: 'reservado', label: 'Reservados' },
  { value: 'rejeitado', label: 'Rejeitados' },
  { value: 'vendido', label: 'Vendidos' },
];

export default function ManageAds() {
  const toast = useToast();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [hideVendidos, setHideVendidos] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  useEffect(() => {
    setLoading(true);
    const timeout = window.setTimeout(() => {
      adService
        .adminList({ status: status || undefined, search: search || undefined })
        .then(setAds)
        .catch((error) => toast.error(resolveErrorMessage(error)))
        .finally(() => setLoading(false));
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [status, search, toast]);

  const visibleAds = hideVendidos && !status
    ? ads.filter((ad) => ad.status !== 'vendido')
    : ads;

  const replaceAd = (updated: Ad) =>
    setAds((current) => current.map((item) => (item.id === updated.id ? updated : item)));

  const approve = async (ad: Ad) => {
    try {
      replaceAd(await adService.approve(ad.id));
      toast.success('Anúncio aprovado.');
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    }
  };

  const reject = async (ad: Ad) => {
    try {
      replaceAd(await adService.reject(ad.id));
      toast.success('Anúncio rejeitado.');
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    }
  };

  const remove = async (ad: Ad) => {
    if (!window.confirm(`Remover o anúncio "${ad.title}" da plataforma?`)) {
      return;
    }

    try {
      await adService.adminRemove(ad.id);
      setAds((current) => current.filter((item) => item.id !== ad.id));
      toast.success('Anúncio removido da plataforma.');
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    }
  };

  return (
    <div>
      <DashboardHeader
        title="Gerenciar Anúncios"
        subtitle="Modere os anúncios publicados pelos colecionadores."
      />

      <div className="glass overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-wrap gap-4 justify-between items-center bg-white/5">
          <h3 className="font-bold">Anúncios da plataforma</h3>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="btn-primary py-2 px-4 text-xs flex items-center gap-2"
            >
              <Plus size={14} /> Criar anúncio
            </button>
            <input
              type="text"
              className="input-field py-2 text-xs w-56"
              placeholder="Buscar anúncio..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="input-field py-2 text-xs bg-[#1a3a5c]"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {STATUS_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
            {!status && (
              <button
                type="button"
                onClick={() => setHideVendidos((v) => !v)}
                className={`py-2 px-3 text-xs glass transition-colors whitespace-nowrap ${
                  hideVendidos ? 'text-[#b0bec5]' : 'text-[#f5c518]'
                }`}
                title={hideVendidos ? 'Exibir vendidos' : 'Ocultar vendidos'}
              >
                {hideVendidos ? 'Exibir vendidos' : 'Ocultar vendidos'}
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <Spinner label="Carregando anúncios..." />
        ) : visibleAds.length === 0 ? (
          <div className="p-10">
            <EmptyState icon="📦" title="Nenhum anúncio encontrado" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="bg-white/10 uppercase text-[10px] tracking-widest text-[#b0bec5]">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Figurinha</th>
                <th className="px-6 py-4">Anunciante</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {visibleAds.map((ad) => (
                <tr key={ad.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                  <td className="px-6 py-4 text-[#b0bec5] font-mono">#{ad.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                        <StickerImage
                          imageUrl={ad.image_url}
                          alt={ad.title}
                          emojiClassName="text-xl"
                        />
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium">{ad.title}</span>
                        <span className="text-[10px] text-[#b0bec5] uppercase">{ad.rarity}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{ad.seller.name}</td>
                  <td className="px-6 py-4 font-bold text-[#f5c518]">
                    {formatCurrency(ad.price)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      label={AD_STATUS[ad.status as AdStatus].label}
                      tone={AD_STATUS[ad.status as AdStatus].tone}
                    />
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    {ad.status === 'pendente' && (
                      <>
                        <button
                          type="button"
                          onClick={() => approve(ad)}
                          className="p-2 glass hover:text-green-400 transition-colors"
                          aria-label="Aprovar"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => reject(ad)}
                          className="p-2 glass hover:text-yellow-400 transition-colors"
                          aria-label="Rejeitar"
                        >
                          <X size={14} />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingAd(ad)}
                      className="p-2 glass hover:text-[#f5c518] transition-colors"
                      aria-label="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(ad)}
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

      <CreateAdModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={(ad) => setAds((current) => [ad, ...current])}
        adminMode
      />

      <EditAdModal
        ad={editingAd}
        onClose={() => setEditingAd(null)}
        onUpdated={replaceAd}
      />
    </div>
  );
}
