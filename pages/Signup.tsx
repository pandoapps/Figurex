import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { resolveErrorMessage } from '../services/api';

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (form.password !== form.password_confirmation) {
      toast.error('A confirmação de senha não confere.');
      return;
    }

    setSubmitting(true);
    try {
      await register(form);
      toast.success('Conta criada com sucesso! Faça login para continuar.');
      navigate('/login');
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Link to="/" className="absolute top-8 left-8 text-2xl font-bold text-[#f5c518]">
        ⭐ Figurex
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass w-full max-w-md p-10"
      >
        <h2 className="text-3xl font-bold mb-2 text-center">Crie sua conta</h2>
        <p className="text-[#b0bec5] text-center mb-8">Junte-se a milhares de colecionadores.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300">Nome completo</label>
            <input
              type="text"
              className="input-field py-2.5"
              placeholder="Seu nome"
              value={form.name}
              onChange={updateField('name')}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300">E-mail</label>
            <input
              type="email"
              className="input-field py-2.5"
              placeholder="exemplo@email.com"
              value={form.email}
              onChange={updateField('email')}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300">Senha</label>
            <input
              type="password"
              className="input-field py-2.5"
              placeholder="••••••••"
              value={form.password}
              onChange={updateField('password')}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300">Confirmar senha</label>
            <input
              type="password"
              className="input-field py-2.5"
              placeholder="••••••••"
              value={form.password_confirmation}
              onChange={updateField('password_confirmation')}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full text-lg mt-2" disabled={submitting}>
            {submitting ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#b0bec5]">
          Já tem conta?{' '}
          <Link to="/login" className="text-[#f5c518] hover:underline">
            Fazer login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
