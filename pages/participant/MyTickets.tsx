import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import { ticketService } from '../../services/ticketService';
import { resolveErrorMessage } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatDateTime } from '../../utils/format';
import { TICKET_STATUS } from '../../utils/status';
import type { Ticket } from '../../types';

export default function MyTickets() {
  const { user } = useAuth();
  const toast = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    ticketService
      .list()
      .then(setTickets)
      .catch((error) => toast.error(resolveErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [toast]);

  const openTicket = async (ticket: Ticket) => {
    try {
      const full = await ticketService.show(ticket.id);
      setSelected(full);
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    }
  };

  const sendMessage = async () => {
    if (!selected || !message.trim()) {
      return;
    }

    setSending(true);
    try {
      const sent = await ticketService.sendMessage(selected.id, message.trim());
      setSelected((current) =>
        current ? { ...current, messages: [...(current.messages ?? []), sent] } : current,
      );
      setMessage('');
      toast.success('Mensagem enviada ao chamado.');
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div>
        <DashboardHeader title="Meus Chamados" />
        <Spinner label="Carregando chamados..." />
      </div>
    );
  }

  if (selected) {
    return (
      <div>
        <DashboardHeader title="Meus Chamados" subtitle="Atendimento entre comprador, vendedor e moderação." />
        <div className="glass h-[600px] flex flex-col">
          <div className="p-4 border-b border-white/5 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-xl hover:text-[#f5c518]"
              aria-label="Voltar"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="font-bold">{selected.subject}</div>
              <div className="text-[10px] text-[#b0bec5]">
                Chamado #{selected.id} • Transação {selected.transaction_id}
              </div>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-4 flex flex-col">
            {(selected.messages ?? []).map((msg) => {
              const isMe = msg.user_id === user?.id;
              const isModerator = msg.role === 'moderator';
              return (
                <div
                  key={msg.id}
                  className={`max-w-[80%] ${
                    isMe ? 'self-end' : isModerator ? 'self-center' : 'self-start'
                  }`}
                >
                  <div
                    className={`text-[9px] font-bold mb-1 ${
                      isMe
                        ? 'text-right text-[#f5c518]'
                        : isModerator
                          ? 'text-center text-blue-400'
                          : 'text-[#b0bec5]'
                    }`}
                  >
                    {isModerator && '🛡️ '}
                    {msg.sender_name}
                  </div>
                  <div
                    className={`p-4 rounded-2xl text-sm ${
                      isMe
                        ? 'bg-[#f5c518] text-[#0a1628] rounded-tr-none'
                        : isModerator
                          ? 'bg-white/5 border border-blue-400/30 text-white italic text-center'
                          : 'glass rounded-tl-none'
                    }`}
                  >
                    {msg.body}
                  </div>
                  <div className="text-[8px] mt-1 text-[#b0bec5]">
                    {formatDateTime(msg.created_at)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-white/5 flex gap-4">
            <input
              type="text"
              className="input-field flex-grow py-3"
              placeholder="Sua mensagem para o chamado..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && sendMessage()}
            />
            <button
              type="button"
              onClick={sendMessage}
              className="btn-primary px-8"
              disabled={sending}
            >
              {sending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader
        title="Meus Chamados"
        subtitle="Acompanhe os atendimentos das suas transações."
      />

      {tickets.length === 0 ? (
        <EmptyState
          icon="🎧"
          title="Nenhum chamado aberto"
          description="Chamados de suporte das suas transações aparecerão aqui."
        />
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => openTicket(ticket)}
              className="glass p-6 flex justify-between items-center cursor-pointer hover:border-[#f5c518]/30 transition-all border border-white/5"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 glass rounded-full flex items-center justify-center text-2xl">
                  🎧
                </div>
                <div>
                  <div className="font-bold mb-1">{ticket.subject}</div>
                  <div className="text-[10px] text-[#b0bec5] uppercase tracking-wider">
                    Chamado #{ticket.id} • Transação {ticket.transaction_id}
                  </div>
                </div>
              </div>
              <StatusBadge
                label={TICKET_STATUS[ticket.status].label}
                tone={TICKET_STATUS[ticket.status].tone}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
