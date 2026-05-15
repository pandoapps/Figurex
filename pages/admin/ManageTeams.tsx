import { useEffect, useRef, useState } from 'react';
import { Pencil, Plus, Trash2, Upload } from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import StickerImage from '../../components/ui/StickerImage';
import GlassModal from '../../components/ui/GlassModal';
import { teamService } from '../../services/teamService';
import { resolveErrorMessage } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import type { Team } from '../../types';

export default function ManageTeams() {
  const toast = useToast();
  const flagInputRef = useRef<HTMLInputElement>(null);
  const teamInputRef = useRef<HTMLInputElement>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [name, setName] = useState('');
  const [flagPhoto, setFlagPhoto] = useState<File | null>(null);
  const [teamPhoto, setTeamPhoto] = useState<File | null>(null);
  const [flagPreview, setFlagPreview] = useState<string | null>(null);
  const [teamPreview, setTeamPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    teamService
      .list()
      .then(setTeams)
      .catch((error) => toast.error(resolveErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [toast]);

  const resetForm = () => {
    setName('');
    setFlagPhoto(null);
    setTeamPhoto(null);
    setFlagPreview(null);
    setTeamPreview(null);
    if (flagInputRef.current) flagInputRef.current.value = '';
    if (teamInputRef.current) teamInputRef.current.value = '';
  };

  const openCreate = () => {
    setEditing(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (team: Team) => {
    setEditing(team);
    setName(team.name);
    setFlagPhoto(null);
    setTeamPhoto(null);
    setFlagPreview(team.flag_photo_url);
    setTeamPreview(team.team_photo_url);
    if (flagInputRef.current) flagInputRef.current.value = '';
    if (teamInputRef.current) teamInputRef.current.value = '';
    setModalOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { name, flag_photo: flagPhoto, team_photo: teamPhoto };
      if (editing) {
        const updated = await teamService.update(editing.id, payload);
        setTeams((current) => current.map((item) => (item.id === updated.id ? updated : item)));
        toast.success('Seleção atualizada.');
      } else {
        const created = await teamService.create(payload);
        setTeams((current) => [...current, created]);
        toast.success('Seleção adicionada.');
      }
      setModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (team: Team) => {
    if (!window.confirm(`Remover a seleção "${team.name}"?`)) {
      return;
    }

    try {
      await teamService.remove(team.id);
      setTeams((current) => current.filter((item) => item.id !== team.id));
      toast.success('Seleção removida.');
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    }
  };

  return (
    <div>
      <DashboardHeader
        title="Gerenciar Seleções"
        subtitle="Cadastre as seleções, suas bandeiras e fotos."
      />

      <div className="flex justify-end mb-8">
        <button
          type="button"
          onClick={openCreate}
          className="btn-primary py-2.5 px-6 flex items-center gap-2"
        >
          <Plus size={18} /> Adicionar Seleção
        </button>
      </div>

      {loading ? (
        <Spinner label="Carregando seleções..." />
      ) : teams.length === 0 ? (
        <EmptyState icon="🏳️" title="Nenhuma seleção cadastrada" />
      ) : (
        <div className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="bg-white/10 uppercase text-[10px] tracking-widest text-[#b0bec5]">
                <th className="px-6 py-4">Bandeira</th>
                <th className="px-6 py-4">Seleção</th>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Figurinhas</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                  <td className="px-6 py-4">
                    <span className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
                      <StickerImage
                        imageUrl={team.flag_photo_url}
                        emoji="🏳️"
                        alt={`Bandeira ${team.name}`}
                        emojiClassName="text-xl"
                      />
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
                      <StickerImage
                        imageUrl={team.team_photo_url}
                        emoji="📷"
                        alt={`Foto ${team.name}`}
                        emojiClassName="text-xl"
                      />
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold">{team.name}</td>
                  <td className="px-6 py-4 text-[#b0bec5]">
                    {team.sticker_definitions?.length ?? 0}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(team)}
                      className="p-2 glass hover:text-[#f5c518] transition-colors"
                      aria-label="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(team)}
                      className="p-2 glass hover:bg-red-500/20 text-red-400 transition-colors"
                      aria-label="Remover"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      )}

      <GlassModal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={save} className="p-8 space-y-5">
          <h2 className="text-2xl font-bold">{editing ? 'Editar seleção' : 'Nova seleção'}</h2>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#b0bec5]">Nome da seleção</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ex: Brasil"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#b0bec5]">Bandeira</label>
              <div className="flex flex-col items-center gap-2">
                <span className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                  <StickerImage
                    imageUrl={flagPreview}
                    emoji="🏳️"
                    alt="Pré-visualização da bandeira"
                    emojiClassName="text-3xl"
                  />
                </span>
                <button
                  type="button"
                  onClick={() => flagInputRef.current?.click()}
                  className="btn-secondary py-2 px-4 text-xs flex items-center gap-2"
                >
                  <Upload size={14} /> {flagPreview ? 'Trocar' : 'Enviar'}
                </button>
                <input
                  ref={flagInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setFlagPhoto(file);
                    setFlagPreview(
                      file ? URL.createObjectURL(file) : editing?.flag_photo_url ?? null,
                    );
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[#b0bec5]">Foto da seleção</label>
              <div className="flex flex-col items-center gap-2">
                <span className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                  <StickerImage
                    imageUrl={teamPreview}
                    emoji="📷"
                    alt="Pré-visualização da foto da seleção"
                    emojiClassName="text-3xl"
                  />
                </span>
                <button
                  type="button"
                  onClick={() => teamInputRef.current?.click()}
                  className="btn-secondary py-2 px-4 text-xs flex items-center gap-2"
                >
                  <Upload size={14} /> {teamPreview ? 'Trocar' : 'Enviar'}
                </button>
                <input
                  ref={teamInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setTeamPhoto(file);
                    setTeamPreview(
                      file ? URL.createObjectURL(file) : editing?.team_photo_url ?? null,
                    );
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
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
    </div>
  );
}
