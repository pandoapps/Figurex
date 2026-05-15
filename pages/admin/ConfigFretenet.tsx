import { useEffect, useState } from 'react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Spinner from '../../components/ui/Spinner';
import { settingService, type SettingValues } from '../../services/settingService';
import { resolveErrorMessage } from '../../services/api';
import { useToast } from '../../hooks/useToast';

const SHIPPING_TYPES = ['PAC', 'SEDEX', 'Mini Envios'];

export default function ConfigFretenet() {
  const toast = useToast();
  const [settings, setSettings] = useState<SettingValues>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingService
      .get('fretenet')
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
      const updated = await settingService.update('fretenet', settings);
      setSettings(updated);
      toast.success('Configurações do FreteNet salvas com sucesso.');
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <DashboardHeader title="Configurar FreteNet" />
        <Spinner label="Carregando configurações..." />
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader
        title="Configurar FreteNet"
        subtitle="Logística de envio: cálculo de frete e emissão de etiquetas."
      />

      <form onSubmit={handleSubmit} className="glass p-10 space-y-6 max-w-2xl">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#b0bec5] uppercase tracking-wider">
              Chave
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="seu-email@exemplo.com"
              value={settings.chave ?? ''}
              onChange={(event) => updateField('chave')(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#b0bec5] uppercase tracking-wider">
              Senha
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Senha da conta Frenet"
              value={settings.senha ?? ''}
              onChange={(event) => updateField('senha')(event.target.value)}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-[#b0bec5] uppercase tracking-wider">
              Token
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Token gerado no painel Frenet"
              value={settings.token ?? ''}
              onChange={(event) => updateField('token')(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#b0bec5] uppercase tracking-wider">
              CEP de Origem (fallback)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="00000-000"
              value={settings.origin_cep ?? ''}
              onChange={(event) => updateField('origin_cep')(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#b0bec5] uppercase tracking-wider">
              Tipo de Envio Padrão
            </label>
            <select
              className="input-field bg-[#1a3a5c]"
              value={settings.default_shipping_type ?? 'PAC'}
              onChange={(event) => updateField('default_shipping_type')(event.target.value)}
            >
              {SHIPPING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full py-4 text-lg" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </form>
    </div>
  );
}
