import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Spinner from '../../components/ui/Spinner';
import { evolutionService, type ConnectionStatus } from '../../services/evolutionService';

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
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    evolutionService
      .connectionStatus()
      .then(setStatus)
      .catch(() => setStatus({ state: 'unknown', qrcode: null }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const connected = status?.state === 'open';

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
            onClick={load}
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
      </div>
    </div>
  );
}
