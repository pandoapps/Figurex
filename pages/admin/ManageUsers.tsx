import { useEffect, useState } from 'react';
import { MessageCircle, Pencil, Search, WifiOff } from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import GlassModal from '../../components/ui/GlassModal';
import WhatsAppChat from '../../components/ui/WhatsAppChat';
import { userService, type UpdateUserPayload } from '../../services/userService';
import { evolutionService } from '../../services/evolutionService';
import { resolveErrorMessage } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/format';
import type { User } from '../../types';

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function ManageUsers() {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<User | null>(null);
  const [chatUser, setChatUser] = useState<User | null>(null);
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [form, setForm] = useState<UpdateUserPayload>({
    name: '',
    email: '',
    role: 'participante',
    status: 'ativo',
    phone: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    evolutionService
      .connectionStatus()
      .then((s) => setWhatsappConnected(s.state === 'open'))
      .catch(() => setWhatsappConnected(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    const timeout = window.setTimeout(() => {
      userService
        .list(search)
        .then(setUsers)
        .catch((error) => toast.error(resolveErrorMessage(error)))
        .finally(() => setLoading(false));
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [search, toast]);

  const openEdit = (user: User) => {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone ?? '',
    });
  };

  const openChat = (user: User) => {
    if (!whatsappConnected) {
      toast.error('WhatsApp desconectado. Conecte a instância em Configurar WhatsApp.');
      return;
    }
    setChatUser(user);
  };

  const saveUser = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) {
      return;
    }

    setSaving(true);
    try {
      const updated = await userService.update(editing.id, form);
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      toast.success('Colecionador atualizado com sucesso.');
      setEditing(null);
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (user: User) => {
    try {
      const updated = await userService.toggleStatus(user.id);
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      toast.success(
        updated.status === 'ativo' ? 'Colecionador ativado.' : 'Colecionador desativado.',
      );
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    }
  };

  return (
    <div>
      <DashboardHeader
        title="Gerenciar Colecionadores"
        subtitle="Modere os colecionadores cadastrados na plataforma."
      />

      <div className="glass overflow-hidden">
        {!whatsappConnected && (
          <div className="px-6 py-3 flex items-center gap-2 text-xs text-yellow-300 bg-yellow-500/10 border-b border-yellow-500/20">
            <WifiOff size={13} />
            WhatsApp desconectado — conecte a instância em{' '}
            <a href="/admin/whatsapp" className="underline hover:text-yellow-200">
              Configurar WhatsApp
            </a>{' '}
            para enviar mensagens.
          </div>
        )}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="font-bold">Colecionadores cadastrados</h3>
          <div className="relative">
            <input
              type="text"
              className="input-field py-2 pl-10 pr-4 text-xs w-64"
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Search size={14} className="absolute left-3 top-2.5 text-[#b0bec5]" />
          </div>
        </div>

        {loading ? (
          <Spinner label="Carregando colecionadores..." />
        ) : users.length === 0 ? (
          <div className="p-10">
            <EmptyState icon="👥" title="Nenhum colecionador encontrado" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="bg-white/10 uppercase text-[10px] tracking-widest text-[#b0bec5]">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">E-mail</th>
                <th className="px-6 py-4">Telefone</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Cadastro</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-all"
                >
                  <td className="px-6 py-4 text-[#b0bec5] font-mono">
                    #{String(user.id).padStart(3, '0')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => openChat(user)}
                      className={`font-medium transition-colors flex items-center gap-1.5 group ${
                        whatsappConnected ? 'hover:text-green-400' : 'cursor-default'
                      }`}
                      title={whatsappConnected ? 'Abrir conversa no WhatsApp' : 'WhatsApp desconectado'}
                    >
                      {user.name}
                      {whatsappConnected && (
                        <MessageCircle
                          size={13}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-green-400"
                        />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-[#b0bec5]">{user.email}</td>
                  <td className="px-6 py-4 text-[#b0bec5] font-mono text-xs">
                    {user.phone ?? <span className="opacity-40">—</span>}
                  </td>
                  <td className="px-6 py-4 capitalize">{user.role}</td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      label={user.status}
                      tone={user.status === 'ativo' ? 'green' : 'red'}
                    />
                  </td>
                  <td className="px-6 py-4 text-[#b0bec5] text-xs">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openChat(user)}
                      className={`p-2 glass transition-colors ${
                        whatsappConnected
                          ? 'hover:text-green-400'
                          : 'opacity-30 cursor-not-allowed'
                      }`}
                      aria-label="WhatsApp"
                      title={whatsappConnected ? 'Enviar mensagem no WhatsApp' : 'WhatsApp desconectado'}
                    >
                      <MessageCircle size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(user)}
                      className="p-2 glass hover:text-[#f5c518] transition-colors"
                      aria-label="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleStatus(user)}
                      className={`p-2 glass transition-colors text-xs ${
                        user.status === 'ativo' ? 'hover:text-red-400' : 'hover:text-green-400'
                      }`}
                    >
                      {user.status === 'ativo' ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </div>

      <GlassModal isOpen={Boolean(editing)} onClose={() => setEditing(null)}>
        <form onSubmit={saveUser} className="p-8 space-y-5">
          <h2 className="text-2xl font-bold">Editar colecionador</h2>
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#b0bec5]">Nome completo</label>
            <input
              type="text"
              className="input-field"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#b0bec5]">E-mail</label>
            <input
              type="email"
              className="input-field"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#b0bec5]">Telefone (WhatsApp)</label>
            <input
              type="tel"
              className="input-field"
              placeholder="(11) 99999-9999"
              value={form.phone ?? ''}
              onChange={(event) => setForm({ ...form, phone: maskPhone(event.target.value) })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#b0bec5]">Tipo</label>
              <select
                className="input-field bg-[#1a3a5c]"
                value={form.role}
                onChange={(event) =>
                  setForm({ ...form, role: event.target.value as UpdateUserPayload['role'] })
                }
              >
                <option value="participante">Participante</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#b0bec5]">Status</label>
              <select
                className="input-field bg-[#1a3a5c]"
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value as UpdateUserPayload['status'] })
                }
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="btn-secondary flex-grow py-3"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-grow py-3" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </GlassModal>

      <WhatsAppChat user={chatUser} onClose={() => setChatUser(null)} />
    </div>
  );
}
