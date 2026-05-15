import { Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export default function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.info('Você saiu da sua conta.');
    navigate('/');
  };

  return (
    <header className="flex justify-between items-center mb-10 gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">{title}</h1>
        {subtitle && <p className="text-[#b0bec5] text-sm">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
          <div className="font-bold text-sm">{user?.name}</div>
          <div className="text-xs text-[#b0bec5] capitalize">{user?.role}</div>
        </div>
        <div className="w-11 h-11 rounded-full glass flex items-center justify-center text-lg overflow-hidden">
          {user?.image_url ? (
            <img
              src={user.image_url}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            '👤'
          )}
        </div>
        <button type="button" className="relative p-3 glass" aria-label="Notificações">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#f5c518] rounded-full" />
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="p-3 glass text-red-400 hover:bg-red-500/10 transition-all"
          aria-label="Sair"
          title="Sair da conta"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
