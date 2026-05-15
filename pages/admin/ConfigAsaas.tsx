import { useEffect, useState } from 'react';
import { Copy } from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Spinner from '../../components/ui/Spinner';
import { settingService, type SettingValues } from '../../services/settingService';
import { resolveErrorMessage } from '../../services/api';
import { useToast } from '../../hooks/useToast';

export default function ConfigAsaas() {
  const toast = useToast();
  const [settings, setSettings] = useState<SettingValues>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingService
      .get('asaas')
      .then(setSettings)
      .catch((error) => toast.error(resolveErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [toast]);

  const updateField = (key: string) => (value: string) =>
    setSettings((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await settingService.update('asaas', settings);
      setSettings(updated);
      toast.success('Configurações do Asaas salvas com sucesso.');
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <DashboardHeader title="Configurar Asaas" />
        <Spinner label="Carregando configurações..." />
      </div>
    );
  }

  const isSandbox = settings.environment !== 'production';

  return (
    <div>
      <DashboardHeader
        title="Configurar Asaas"
        subtitle="Gateway de pagamento para processar compras e saques."
      />

      <form onSubmit={handleSubmit} className="glass p-10 space-y-6 max-w-2xl">
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#b0bec5] uppercase tracking-wider">
            Chave API de Produção
          </label>
          <input
            type="password"
            className="input-field"
            placeholder="$aact_prod_..."
            value={settings.api_key_production ?? ''}
            onChange={(event) => updateField('api_key_production')(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#b0bec5] uppercase tracking-wider">
            Chave API Sandbox
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="$aact_sandbox_..."
            value={settings.api_key_sandbox ?? ''}
            onChange={(event) => updateField('api_key_sandbox')(event.target.value)}
          />
        </div>

        <div className="flex items-center justify-between p-4 glass bg-white/5">
          <div>
            <div className="font-bold">Ambiente de testes (Sandbox)</div>
            <div className="text-xs text-[#b0bec5]">
              Ative para testar fluxos sem cobrança real.
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              updateField('environment')(isSandbox ? 'production' : 'sandbox')
            }
            className={`w-14 h-7 rounded-full relative p-1 transition-all ${
              isSandbox ? 'bg-[#f5c518]' : 'bg-white/20'
            }`}
            aria-label="Alternar ambiente"
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-all ${
                isSandbox ? 'ml-auto' : ''
              }`}
            />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#b0bec5] uppercase tracking-wider">
            URL de Webhook
          </label>
          <div className="relative">
            <input
              type="text"
              className="input-field opacity-60 cursor-default pr-10"
              value={settings.webhook_url ?? ''}
              readOnly
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b0bec5] hover:text-[#f5c518] transition-colors"
              title="Copiar URL"
              onClick={() =>
                navigator.clipboard.writeText(settings.webhook_url ?? '').then(() =>
                  toast.success('URL copiada!')
                )
              }
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#b0bec5] uppercase tracking-wider">
            Token de Autenticação do Webhook
          </label>
          <input
            type="password"
            className="input-field"
            placeholder="Token configurado no painel do Asaas"
            value={settings.webhook_token ?? ''}
            onChange={(event) => updateField('webhook_token')(event.target.value)}
          />
          <p className="text-[10px] text-[#b0bec5]">
            Configure o mesmo token no painel do Asaas em Integrações &gt; Webhooks para validar a origem das notificações.
          </p>
        </div>

        <button type="submit" className="btn-primary w-full py-4 text-lg" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </form>
    </div>
  );
}
