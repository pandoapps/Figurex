import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import CreateAdModal from '../../components/CreateAdModal';
import StickerImage from '../../components/ui/StickerImage';
import { adService } from '../../services/adService';
import { resolveErrorMessage } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/format';
import { AD_STATUS } from '../../utils/status';
import type { Ad } from '../../types';

export default function MyAds() {
  const toast = useToast();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    adService
      .mine()
      .then(setAds)
      .catch((error) => toast.error(resolveErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleRemove = async (ad: Ad) => {
    if (!window.confirm(`Remover o anúncio "${ad.title}"?`)) {
      return;
    }

    try {
      await adService.remove(ad.id);
      setAds((current) => current.filter((item) => item.id !== ad.id));
      toast.success('Anúncio removido com sucesso.');
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    }
  };

  return (
    <div>
      <DashboardHeader title="Meus Anúncios" subtitle="Gerencie as figurinhas que você anuncia." />

      <div className="flex justify-end mb-8">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="btn-primary py-2.5 px-6 flex items-center gap-2"
        >
          <Plus size={18} /> Novo Anúncio
        </button>
      </div>

      {loading ? (
        <Spinner label="Carregando seus anúncios..." />
      ) : ads.length === 0 ? (
        <EmptyState
          icon="📦"
          title="Você ainda não tem anúncios"
          description="Clique em 'Novo Anúncio' para publicar sua primeira figurinha."
        />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {ads.map((ad) => (
            <div key={ad.id} className="glass-card group overflow-hidden">
              <div className="flex-grow bg-white/5 flex items-center justify-center relative overflow-hidden">
                <StickerImage imageUrl={ad.image_url} alt={ad.title} emojiClassName="text-6xl" />
                <div className="absolute top-2 right-2 z-10">
                  <StatusBadge label={AD_STATUS[ad.status].label} tone={AD_STATUS[ad.status].tone} />
                </div>
              </div>
              <div className="p-3 bg-black/40 border-t border-white/5">
                <h4 className="font-bold text-xs truncate mb-1">{ad.title}</h4>
                <div className="flex justify-between items-center">
                  <span className="text-[#f5c518] font-bold text-xs">
                    {formatCurrency(ad.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(ad)}
                    className="p-1 hover:text-red-400 transition-colors"
                    aria-label="Remover anúncio"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateAdModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(ad) => setAds((current) => [ad, ...current])}
      />
    </div>
  );
}
