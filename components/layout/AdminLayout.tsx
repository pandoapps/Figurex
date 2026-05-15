import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'motion/react';
import Sidebar, { type SidebarItem } from './Sidebar';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const ITEMS: SidebarItem[] = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/usuarios', label: 'Colecionadores', icon: '👥' },
  { to: '/admin/anuncios', label: 'Anúncios', icon: '📦' },
  { to: '/admin/selecoes', label: 'Seleções', icon: '🏳️' },
  { to: '/admin/jogadores', label: 'Jogadores', icon: '⚽' },
  { to: '/admin/asaas', label: 'Asaas', icon: '💳' },
  { to: '/admin/fretenet', label: 'FreteNet', icon: '🚚' },
  { to: '/admin/whatsapp', label: 'WhatsApp', icon: '💬' },
  { to: '/admin/vendas', label: 'Histórico de Vendas', icon: '📈' },
];

export default function AdminLayout() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [desktopExpanded, setDesktopExpanded] = useState(true);
  // Abaixo de 1024px o menu fica sempre recolhido (só ícones).
  const sidebarOpen = isDesktop && desktopExpanded;

  return (
    <div className="flex min-h-screen">
      <Sidebar
        items={ITEMS}
        subtitle="Administração"
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
