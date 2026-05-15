import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { resolveErrorMessage } from '../services/api';

const QUICK_ACCESS = [
  { label: 'Entrar como Administrador', email: 'admin@admin.com' },
  { label: 'Entrar como Colecionador', email: 'vendedor@figurex.com' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const authenticate = async (loginEmail: string, loginPassword: string) => {
    setSubmitting(true);
    try {
      const user = await login(loginEmail, loginPassword);
      toast.success(`Bem-vindo(a), ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/mercado');
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password) {
      toast.error('Informe e-mail e senha para entrar.');
      return;
    }
    void authenticate(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 flex-col gap-8">
      <Link to="/" className="absolute top-8 left-8 text-2xl font-bold text-[#f5c518]">
        ⭐ Figurex
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass w-full max-w-md p-10"
      >
        <h2 className="text-3xl font-bold mb-2 text-center">Boas-vindas!</h2>
        <p className="text-[#b0bec5] text-center mb-8">Acesse sua coleção agora.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">E-mail</label>
            <input
              type="email"
              className="input-field"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Senha</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary w-full text-lg" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#b0bec5]">
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="text-[#f5c518] hover:underline">
            Criar conta
          </Link>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass w-full max-w-md p-6 border-[#f5c518]/30"
      >
        <h3 className="text-sm font-bold text-[#f5c518] flex items-center gap-2 mb-4">
          <Zap size={16} /> Acesso Rápido (Desenvolvimento)
        </h3>
        <div className="grid gap-3">
          {QUICK_ACCESS.map((item) => (
            <button
              key={item.email}
              type="button"
              disabled={submitting}
              onClick={() => void authenticate(item.email, '123456')}
              className="text-xs bg-white/5 hover:bg-white/10 p-3 rounded-lg flex justify-between items-center group transition-all disabled:opacity-50"
            >
              <span>{item.label}</span>
              <span className="text-[#f5c518] opacity-0 group-hover:opacity-100 italic transition-opacity">
                Login instantâneo →
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
