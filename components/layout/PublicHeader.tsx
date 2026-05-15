import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export default function PublicHeader() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const panelPath = isAdmin ? '/admin' : '/painel';

  const handleLogout = async () => {
    await logout();
    toast.info('Você saiu da sua conta.');
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass h-20 flex items-center justify-between px-6 md:px-8 mx-4 mt-4">
      <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-[#f5c518]">
        ⭐ Figurex
      </Link>
      <nav className="flex items-center gap-3">
        <Link to="/mercado" className="hidden md:block text-sm font-medium hover:text-[#f5c518]">
          Mercado
        </Link>
        {!isAuthenticated ? (
          <>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn-secondary py-2 px-5 text-sm"
            >
              Painel Admin
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn-primary py-2 px-6 text-sm"
            >
              Entrar
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => navigate(panelPath)}
              className="btn-primary py-2 px-6 text-sm"
            >
              Meu Painel
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2.5 glass rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
