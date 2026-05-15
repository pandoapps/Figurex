import { useState } from 'react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import { authService } from '../../services/authService';
import { resolveErrorMessage } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    cpf: user?.cpf ?? '',
    cep: user?.cep ?? '',
    neighborhood: user?.neighborhood ?? '',
    address: user?.address ?? '',
    number: user?.number ?? '',
    complement: user?.complement ?? '',
    city: user?.city ?? '',
    state: user?.state ?? '',
  });
  const [saving, setSaving] = useState(false);

  const updateField =
    (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await authService.updateProfile(form);
      setUser(updated);
      toast.success('Perfil atualizado com sucesso.');
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <DashboardHeader title="Meu Perfil" subtitle="Mantenha seus dados sempre atualizados." />

      <form onSubmit={handleSubmit} className="glass p-8 space-y-6 max-w-3xl">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#b0bec5]">Nome completo</label>
            <input
              type="text"
              className="input-field"
              value={form.name}
              onChange={updateField('name')}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#b0bec5]">E-mail</label>
            <input type="email" className="input-field opacity-60" value={user?.email} disabled />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#b0bec5]">Telefone</label>
            <input
              type="text"
              className="input-field"
              placeholder="(11) 99999-9999"
              value={form.phone}
              onChange={updateField('phone')}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#b0bec5]">
              CPF <span className="text-amber-400 text-[10px]">obrigatório para compras</span>
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="000.000.000-00"
              value={form.cpf}
              onChange={updateField('cpf')}
              maxLength={14}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#b0bec5]">CEP</label>
            <input
              type="text"
              className="input-field"
              placeholder="00000-000"
              value={form.cep}
              onChange={updateField('cep')}
            />
          </div>
        </div>

        <div className="pt-2">
          <h4 className="text-sm font-bold border-b border-white/5 pb-2 mb-6">
            🚚 Endereço de envio e recebimento
          </h4>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-medium text-[#b0bec5]">Endereço</label>
              <input
                type="text"
                className="input-field"
                placeholder="Rua, avenida..."
                value={form.address}
                onChange={updateField('address')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#b0bec5]">Número</label>
              <input
                type="text"
                className="input-field"
                placeholder="123"
                value={form.number}
                onChange={updateField('number')}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-medium text-[#b0bec5]">Bairro</label>
              <input
                type="text"
                className="input-field"
                placeholder="Centro, Vila Verde..."
                value={form.neighborhood}
                onChange={updateField('neighborhood')}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-medium text-[#b0bec5]">Complemento</label>
              <input
                type="text"
                className="input-field"
                placeholder="Apto, bloco..."
                value={form.complement}
                onChange={updateField('complement')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#b0bec5]">Cidade</label>
              <input
                type="text"
                className="input-field"
                placeholder="São Paulo"
                value={form.city}
                onChange={updateField('city')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#b0bec5]">Estado (UF)</label>
              <input
                type="text"
                className="input-field"
                placeholder="SP"
                maxLength={2}
                value={form.state}
                onChange={updateField('state')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="btn-primary py-2.5 px-8" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
