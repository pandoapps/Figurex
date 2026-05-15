import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import StickerCard from '../components/StickerCard';
import AdDetailModal from '../components/AdDetailModal';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { adService, type AdCatalogFilters } from '../services/adService';
import { teamService } from '../services/teamService';
import { resolveErrorMessage } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import type { Ad, Team } from '../types';

export default function Market() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [ads, setAds] = useState<Ad[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [teamId, setTeamId] = useState('');
  const [sort, setSort] = useState<AdCatalogFilters['sort']>('recentes');
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  useEffect(() => {
    teamService
      .list()
      .then(setTeams)
      .catch((error) => toast.error(resolveErrorMessage(error)));
  }, [toast]);

  useEffect(() => {
    setLoading(true);
    const timeout = window.setTimeout(() => {
      adService
        .catalog({
          search: search || undefined,
          team_id: teamId ? Number(teamId) : undefined,
          sort,
        })
        .then(setAds)
        .catch((error) => toast.error(resolveErrorMessage(error)))
        .finally(() => setLoading(false));
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [search, teamId, sort, toast]);

  const handleBuy = (ad: Ad) => {
    if (!isAuthenticated) {
      toast.info('Faça login para concluir a sua compra.');
      navigate('/login');
      return;
    }
    navigate(`/checkout/${ad.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="glass h-20 flex items-center justify-between px-6 md:px-8 mx-4 mt-4 sticky top-4 z-50">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-2xl hover:text-[#f5c518]" aria-label="Voltar">
            <ArrowLeft />
          </Link>
          <span className="font-bold text-xl text-[#f5c518]">Mercado Figurex</span>
        </div>
        <button
          type="button"
          onClick={() => navigate(isAuthenticated ? '/painel' : '/login')}
          className="btn-secondary py-2 px-6 text-sm"
        >
          {isAuthenticated ? 'Meu Painel' : 'Entrar'}
        </button>
      </header>

      <main className="flex-grow pt-12 pb-20 px-6 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Todas as figurinhas</h2>
            <p className="text-[#b0bec5]">{ads.length} itens disponíveis para compra.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              className="input-field text-sm py-2 w-56"
              placeholder="Buscar figurinha..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="input-field text-sm py-2 bg-[#1a3a5c]"
              value={teamId}
              onChange={(event) => setTeamId(event.target.value)}
            >
              <option value="">Todas as seleções</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            <select
              className="input-field text-sm py-2 bg-[#1a3a5c]"
              value={sort}
              onChange={(event) => setSort(event.target.value as AdCatalogFilters['sort'])}
            >
              <option value="recentes">Mais recentes</option>
              <option value="menor_preco">Menor preço</option>
              <option value="maior_preco">Maior preço</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Spinner label="Carregando catálogo..." />
        ) : ads.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="Nenhuma figurinha encontrada"
            description="Tente ajustar os filtros de busca ou seleção."
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {ads.map((ad) => (
              <StickerCard key={ad.id} ad={ad} onClick={setSelectedAd} />
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedAd && (
          <AdDetailModal ad={selectedAd} onClose={() => setSelectedAd(null)} onBuy={handleBuy} />
        )}
      </AnimatePresence>
    </div>
  );
}
