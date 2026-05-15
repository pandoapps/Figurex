import { useEffect, useRef, useState } from 'react';
import { Send, MessageCircle, RefreshCw, X } from 'lucide-react';
import GlassModal from './GlassModal';
import Spinner from './Spinner';
import { evolutionService, type WhatsAppMessage } from '../../services/evolutionService';
import { resolveErrorMessage } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import type { User } from '../../types';

interface Props {
  user: User | null;
  onClose: () => void;
}

function messageText(msg: WhatsAppMessage): string {
  return (
    msg.message?.conversation ??
    msg.message?.extendedTextMessage?.text ??
    '[mensagem de mídia]'
  );
}

function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function WhatsAppChat({ user, onClose }: Props) {
  const toast = useToast();
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = () => {
    if (!user) return;
    setLoading(true);
    evolutionService
      .getMessages(user.id)
      .then((msgs) => {
        const sorted = [...msgs].sort((a, b) => a.messageTimestamp - b.messageTimestamp);
        setMessages(sorted);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
      })
      .catch((error) => toast.error(resolveErrorMessage(error)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) {
      setMessages([]);
      setText('');
      loadMessages();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !text.trim()) return;
    setSending(true);
    try {
      await evolutionService.sendMessage(user.id, text.trim());
      setText('');
      toast.success('Mensagem enviada.');
      loadMessages();
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <GlassModal isOpen={Boolean(user)} onClose={onClose} maxWidthClass="max-w-xl w-full" hideCloseButton>
      <div className="flex flex-col w-full" style={{ height: '600px' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
              <MessageCircle size={18} className="text-green-400" />
            </div>
            <div>
              <div className="font-bold">{user?.name}</div>
              <div className="text-xs text-[#b0bec5]">{user?.phone ?? 'Sem telefone'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadMessages}
              disabled={loading}
              className="p-2 glass hover:text-[#f5c518] transition-colors"
              aria-label="Atualizar"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 glass hover:text-red-400 transition-colors"
              aria-label="Fechar"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {loading && messages.length === 0 ? (
            <Spinner label="Carregando mensagens..." />
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-[#b0bec5] gap-2">
              <MessageCircle size={40} className="opacity-30" />
              <span className="text-sm">Nenhuma mensagem encontrada nesta conversa.</span>
            </div>
          ) : (
            messages.map((msg) => {
              const fromMe = msg.key.fromMe;
              return (
                <div
                  key={msg.key.id}
                  className={`flex ${fromMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                      fromMe
                        ? 'bg-green-600/30 border border-green-500/30 rounded-br-sm'
                        : 'bg-white/10 border border-white/10 rounded-bl-sm'
                    }`}
                  >
                    <p className="break-words">{messageText(msg)}</p>
                    <p className={`text-[10px] mt-1 ${fromMe ? 'text-green-300/60' : 'text-[#b0bec5]'}`}>
                      {formatTime(msg.messageTimestamp)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/10 flex gap-3">
          {!user?.phone ? (
            <p className="text-xs text-red-400 w-full text-center py-2">
              Colecionador sem telefone cadastrado. Edite o perfil para adicionar.
            </p>
          ) : (
            <>
              <input
                type="text"
                className="input-field flex-1 py-2 text-sm"
                placeholder="Digite sua mensagem..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className="btn-primary px-4 py-2 flex items-center gap-2"
              >
                <Send size={14} />
              </button>
            </>
          )}
        </form>
      </div>
    </GlassModal>
  );
}
