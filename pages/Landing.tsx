import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import PublicHeader from '../components/layout/PublicHeader';
import StickerCard from '../components/StickerCard';
import AdDetailModal from '../components/AdDetailModal';
import Spinner from '../components/ui/Spinner';
import { adService } from '../services/adService';
import { statsService } from '../services/statsService';
import { resolveErrorMessage } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import type { Ad, LandingStats } from '../types';

const STEPS = [
  { icon: '📝', title: 'Cadastre-se', text: 'Crie sua conta gratuita em segundos e monte seu perfil de colecionador.' },
  { icon: '📣', title: 'Anuncie suas figurinhas', text: 'Publique suas repetidas e raras com preço e descrição em poucos cliques.' },
  { icon: '🤝', title: 'Compre e venda', text: 'Negocie com segurança: pagamento via Asaas e envio pela FreteNet.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [ads, setAds] = useState<Ad[]>([]);
  const [stats, setStats] = useState<LandingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  useEffect(() => {
    Promise.all([adService.catalog({ sort: 'recentes' }), statsService.landing()])
      .then(([catalog, landingStats]) => {
        setAds(catalog);
        setStats(landingStats);
      })
      .catch((error) => toast.error(resolveErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleBuy = (ad: Ad) => {
    if (!isAuthenticated) {
      toast.info('Faça login para concluir a sua compra.');
      navigate('/login');
      return;
    }
    navigate(`/checkout/${ad.id}`);
  };

  const statCards = [
    { value: stats ? `+${stats.total_stickers}` : '—', label: 'Figurinhas' },
    { value: stats ? `+${stats.total_collectors}` : '—', label: 'Colecionadores' },
    { value: stats ? `+${stats.total_sales}` : '—', label: 'Vendas' },
    { value: '100%', label: 'Segurança' },
  ];

  return (
    <div className="flex flex-col">
      <PublicHeader />

      <section className="pt-44 pb-20 px-6 md:px-8 max-w-7xl mx-auto text-center relative w-full">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 -right-20 w-80 h-80 bg-[#f5c518]/10 rounded-full blur-[120px] pointer-events-none" />
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-7xl font-black mb-8 tracking-tighter"
        >
          EXPLORE A NOVA ERA DAS <br />
          <span className="text-[#f5c518] italic underline decoration-white/10 underline-offset-8">
            FIGURINHAS
          </span>
        </motion.h1>
        <p className="text-lg md:text-xl text-[#b0bec5] max-w-3xl mx-auto mb-10 leading-relaxed">
          A Figurex é o marketplace premium para colecionadores. Compre, venda e troque figurinhas
          com segurança, pagamento integrado e logística de envio.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/cadastro')}
            className="btn-primary text-lg px-12 py-4"
          >
            Comece Agora
          </button>
          <button
            type="button"
            onClick={() => navigate('/mercado')}
            className="btn-secondary text-lg px-12 py-4"
          >
            Ver Catálogo
          </button>
        </div>
      </section>

      <section className="py-12 px-6 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-[#f5c518] font-bold uppercase tracking-[0.2em] text-xs">
              Mercado Premium
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Figurinhas em Destaque</h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/mercado')}
            className="text-sm font-bold text-[#b0bec5] hover:text-white transition-colors"
          >
            EXPLORAR TODOS →
          </button>
        </div>

        {loading ? (
          <Spinner label="Carregando figurinhas..." />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {ads.slice(0, 6).map((ad) => (
              <StickerCard key={ad.id} ad={ad} onClick={setSelectedAd} />
            ))}
          </div>
        )}
      </section>

      <section className="py-20 px-6 md:px-8 max-w-7xl mx-auto w-full">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">Como funciona</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step, index) => (
            <div key={step.title} className="glass p-8 text-center flex flex-col items-center gap-3">
              <span className="text-5xl mb-2">{step.icon}</span>
              <span className="text-[#f5c518] font-black text-sm">PASSO {index + 1}</span>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-sm text-[#b0bec5]">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 px-6 md:px-8 max-w-7xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="glass p-8 text-center">
            <div className="text-3xl md:text-4xl font-black text-[#f5c518] mb-1">{stat.value}</div>
            <div className="text-xs text-[#b0bec5] uppercase font-bold tracking-[0.2em]">
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      <footer className="py-12 px-6 md:px-8 border-t border-white/5 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-bold text-[#f5c518]">⭐ Figurex</div>
          <div className="text-[#b0bec5] text-sm">
            © {new Date().getFullYear()} Figurex — Construído para colecionadores.
          </div>
          <div className="flex gap-6 text-[#b0bec5] text-sm">
            <span className="hover:text-white cursor-pointer">Central de Ajuda</span>
            <span className="hover:text-white cursor-pointer">Termos de Uso</span>
            <span className="hover:text-white cursor-pointer">Privacidade</span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {selectedAd && (
          <AdDetailModal ad={selectedAd} onClose={() => setSelectedAd(null)} onBuy={handleBuy} />
        )}
      </AnimatePresence>
    </div>
  );
}
