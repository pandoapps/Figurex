import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle, RefreshCw, Send, Wifi, WifiOff } from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Spinner from '../../components/ui/Spinner';
import { evolutionService, type ConnectionStatus } from '../../services/evolutionService';
import { resolveErrorMessage } from '../../services/api';
import { useToast } from '../../hooks/useToast';

const STATE_LABEL: Record<string, string> = {
  open: 'Conectado',
  connecting: 'Conectando...',
  close: 'Desconectado',
  unknown: 'Sem resposta',
};

const STATE_COLOR: Record<string, string> = {
  open: 'text-green-400',
  connecting: 'text-yellow-400',
  close: 'text-red-400',
  unknown: 'text-[#b0bec5]',
};

export default function ConfigEvolution() {
  const toast = useToast();
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testNumber, setTestNumber] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [sending, setSending] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback((showSpinner = false) => {
    if (showSpinner) setLoading(true);
    return evolutionService
      .connectionStatus()
      .then((s) => {
        setStatus(s);
        return s;
      })
      .catch(() => {
        const fallback: ConnectionStatus = { state: 'unknown', qrcode: null };
        setStatus(fallback);
        return fallback;
      })
      .finally(() => { if (showSpinner) setLoading(false); });
  }, []);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    intervalRef.current = setInterval(async () => {
      const s = await fetchStatus();
      if (s.state === 'open') stopPolling();
    }, 2000);
  }, [fetchStatus, stopPolling]);

  const load = useCallback(async () => {
    const s = await fetchStatus(true);
    if (s.state !== 'open') startPolling();
    else stopPolling();
  }, [fetchStatus, startPolling, stopPolling]);

  useEffect(() => {
    load();
    return stopPolling;
  }, [load, stopPolling]);

  const connected = status?.state === 'open';

  const maskPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits.length ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleTestSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!testNumber.trim() || !testMessage.trim()) return;
    setSending(true);
    try {
      await evolutionService.sendTestMessage(testNumber.trim(), testMessage.trim());
      toast.success('Mensagem de teste enviada com sucesso.');
      setTestMessage('');
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <DashboardHeader
        title="WhatsApp"
        subtitle="Status da conexão com a instância Evolution API."
      />

      <div className="glass p-10 max-w-lg space-y-8">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {connected ? (
              <Wifi size={22} className="text-green-400" />
            ) : (
              <WifiOff size={22} className="text-red-400" />
            )}
            <div>
              <div className="text-xs font-bold text-[#b0bec5] uppercase tracking-wider mb-0.5">
                Status da instância
              </div>
              <div className={`font-bold text-lg ${STATE_COLOR[status?.state ?? 'unknown']}`}>
                {loading ? 'Verificando...' : STATE_LABEL[status?.state ?? 'unknown']}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => load()}
            disabled={loading}
            className="p-2 glass hover:text-[#f5c518] transition-colors"
            aria-label="Atualizar status"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* QR Code */}
        {!loading && !connected && status?.state !== 'unknown' && (
          <div className="space-y-4">
            <p className="text-sm text-[#b0bec5]">
              Escaneie o QR code abaixo com o WhatsApp para conectar a instância.
            </p>
            {status?.qrcode ? (
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-2xl shadow-lg">
                  <img
                    src={status.qrcode}
                    alt="QR Code WhatsApp"
                    className="w-56 h-56"
                  />
                </div>
              </div>
            ) : (
              <div className="p-6 glass bg-white/5 text-center text-sm text-[#b0bec5]">
                QR code não disponível. Clique em atualizar para tentar novamente.
              </div>
            )}
            <p className="text-xs text-center text-[#b0bec5]">
              O QR code expira em alguns segundos — atualize se necessário.
            </p>
          </div>
        )}

        {/* Conectado */}
        {!loading && connected && (
          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <CheckCircle size={20} className="text-green-400 shrink-0" />
            <p className="text-sm text-green-300">
              WhatsApp conectado e pronto para envio de mensagens.
            </p>
          </div>
        )}

        {!loading && status?.state === 'unknown' && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm text-yellow-300">
            Não foi possível comunicar com a Evolution API. O container pode estar iniciando — aguarde alguns segundos e atualize.
          </div>
        )}

        {loading && <Spinner label="Verificando conexão..." />}

        {/* Teste de envio */}
        {!loading && connected && (
          <div className="space-y-4 pt-2 border-t border-white/10">
            <div>
              <div className="text-xs font-bold text-[#b0bec5] uppercase tracking-wider mb-1">
                Testar envio de mensagem
              </div>
              <p className="text-xs text-[#b0bec5]">
                Envie uma mensagem de teste para qualquer número sem precisar de um colecionador cadastrado.
              </p>
            </div>
            <form onSubmit={handleTestSend} className="space-y-3">
              <input
                type="tel"
                className="input-field w-full"
                placeholder="(11) 99999-9999"
                value={testNumber}
                onChange={(e) => setTestNumber(maskPhone(e.target.value))}
                disabled={sending}
              />
              <textarea
                className="input-field w-full resize-none"
                rows={3}
                placeholder="Digite a mensagem..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !testNumber.trim() || !testMessage.trim()}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                <Send size={14} />
                {sending ? 'Enviando...' : 'Enviar mensagem de teste'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
