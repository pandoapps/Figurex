import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'motion/react';
import Sidebar, { type SidebarItem } from './Sidebar';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const ITEMS: SidebarItem[] = [
  { to: '/painel', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/painel/anuncios', label: 'Meus Anúncios', icon: '📦' },
  { to: '/painel/compras', label: 'Minhas Compras', icon: '🛒' },
  { to: '/painel/vendas', label: 'Minhas Vendas', icon: '💰' },
  { to: '/painel/chamados', label: 'Meus Chamados', icon: '🎧' },
  { to: '/painel/perfil', label: 'Meu Perfil', icon: '👤' },
];

export default function ParticipantLayout() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [desktopExpanded, setDesktopExpanded] = useState(true);
  // Abaixo de 1024px o menu fica sempre recolhido (só ícones).
  const sidebarOpen = isDesktop && desktopExpanded;

  return (
    <div className="flex min-h-screen">
      <Sidebar
        items={ITEMS}
        subtitle="Painel do Participante"
        isOpen={sidebarOpen}
        canToggle={isDesktop}
        onToggle={() => setDesktopExpanded((open) => !open)}
        logoTo="/mercado"
      />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-grow min-w-0 p-6 md:p-10"
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
