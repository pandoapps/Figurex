import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export interface SidebarItem {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
  subtitle: string;
  isOpen: boolean;
  /** Quando falso, o botão de alternar fica oculto (telas pequenas ficam só com ícones). */
  canToggle: boolean;
  onToggle: () => void;
  logoTo?: string;
}

export default function Sidebar({ items, subtitle, isOpen, canToggle, onToggle, logoTo }: SidebarProps) {
  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.info('Você saiu da sua conta.');
    navigate('/');
  };

  return (
    <aside
      className={`glass border-r border-white/10 min-h-screen sticky top-0 transition-all z-40 flex flex-col gap-8 p-6 shrink-0 ${
        isOpen ? 'w-72' : 'w-20'
      }`}
    >
      <div className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen && (
          <Link to={logoTo ?? '/'} className="flex flex-col hover:opacity-80 transition-opacity">
            <span className="text-xl font-bold text-[#f5c518]">⭐ Figurex</span>
            <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-1">
              {subtitle}
            </span>
          </Link>
        )}
        {canToggle ? (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Alternar menu"
            className="p-2 rounded-lg hover:bg-white/10 transition-all"
          >
            <Menu size={20} />
          </button>
        ) : (
          !isOpen && (
            <Link to={logoTo ?? '/'} aria-label="Ir para o mercado">
              <span className="text-xl">⭐</span>
            </Link>
          )
        )}
      </div>

      <nav className="flex flex-col gap-2 flex-grow">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-4 p-3.5 rounded-xl transition-all ${
                isActive ? 'bg-[#f5c518] text-[#0a1628] font-bold' : 'hover:bg-white/10'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            {isOpen && <span className="font-medium text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-4 p-3.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
      >
        <LogOut size={20} />
        {isOpen && <span className="font-medium text-sm">Sair</span>}
      </button>
    </aside>
  );
}
