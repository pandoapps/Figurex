import { useEffect, useRef, useState } from 'react';
import { Pencil, Plus, Trash2, Upload } from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import StickerImage from '../../components/ui/StickerImage';
import GlassModal from '../../components/ui/GlassModal';
import { teamService, stickerDefinitionService } from '../../services/teamService';
import { resolveErrorMessage } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { rarityTone } from '../../utils/status';
import type { Rarity, StickerDefinition, Team } from '../../types';

const RARITIES: Rarity[] = ['Comum', 'Raro', 'Lendário'];

export default function ManagePlayers() {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<StickerDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StickerDefinition | null>(null);
  const [form, setForm] = useState({
    team_id: '',
    player_name: '',
    rarity: 'Comum' as Rarity,
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [teamFilter, setTeamFilter] = useState('');

  useEffect(() => {
    Promise.all([teamService.list(), stickerDefinitionService.list()])
      .then(([teamList, playerList]) => {
        setTeams(teamList);
        setPlayers(playerList);
      })
      .catch((error) => toast.error(resolveErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [toast]);

  const resetForm = () => {
    setForm({ team_id: '', player_name: '', rarity: 'Comum' });
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openCreate = () => {
    setEditing(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (player: StickerDefinition) => {
    setEditing(player);
    setForm({
      team_id: String(player.team_id),
      player_name: player.player_name,
      rarity: player.rarity,
    });
    setPhoto(null);
    setPhotoPreview(player.image_url);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setModalOpen(true);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : editing?.image_url ?? null);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.team_id) {
      toast.error('Selecione a seleção do jogador.');
      return;
    }

    const payload = {
      team_id: Number(form.team_id),
      player_name: form.player_name,
      rarity: form.rarity,
      photo,
    };

    setSaving(true);
    try {
      if (editing) {
        const updated = await stickerDefinitionService.update(editing.id, payload);
        setPlayers((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
        toast.success('Jogador atualizado.');
      } else {
        const created = await stickerDefinitionService.create(payload);
        setPlayers((current) => [...current, created]);
        toast.success('Jogador cadastrado.');
      }
      setModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (player: StickerDefinition) => {
    if (!window.confirm(`Remover o jogador "${player.player_name}"?`)) {
      return;
    }

    try {
      await stickerDefinitionService.remove(player.id);
      setPlayers((current) => current.filter((item) => item.id !== player.id));
      toast.success('Jogador removido.');
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    }
  };

  const filteredPlayers = teamFilter
    ? players.filter((player) => String(player.team_id) === teamFilter)
    : players;

  return (
    <div>
      <DashboardHeader
        title="Jogadores"
        subtitle="Cadastre os jogadores e suas fotos para uso nas figurinhas."
      />

      <div className="flex justify-end mb-8">
        <button
          type="button"
          onClick={openCreate}
          className="btn-primary py-2.5 px-6 flex items-center gap-2"
        >
          <Plus size={18} /> Adicionar Jogador
        </button>
      </div>

      {loading ? (
        <Spinner label="Carregando jogadores..." />
      ) : players.length === 0 ? (
        <EmptyState icon="⚽" title="Nenhum jogador cadastrado" />
      ) : (
        <div className="glass overflow-hidden">
          <div className="p-6 border-b border-white/10 flex flex-wrap gap-4 justify-between items-center bg-white/5">
            <h3 className="font-bold">Jogadores cadastrados</h3>
            <select
              className="input-field py-2 text-xs bg-[#1a3a5c]"
              value={teamFilter}
              onChange={(event) => setTeamFilter(event.target.value)}
            >
              <option value="">Todas as seleções</option>
              {teams.map((team) => (
                <option key={team.id} value={String(team.id)}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="bg-white/10 uppercase text-[10px] tracking-widest text-[#b0bec5]">
                <th className="px-6 py-4">Foto</th>
                <th className="px-6 py-4">Jogador</th>
                <th className="px-6 py-4">Seleção</th>
                <th className="px-6 py-4">Raridade</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[#b0bec5]">
                    Nenhum jogador encontrado para esta seleção.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => (
                <tr
                  key={player.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-all"
                >
                  <td className="px-6 py-4">
                    <span className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center">
                      <StickerImage
                        imageUrl={player.image_url}
                        alt={player.player_name}
                        emojiClassName="text-2xl"
                      />
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold">{player.player_name}</td>
                  <td className="px-6 py-4">{player.team?.name}</td>
                  <td className="px-6 py-4">
                    <StatusBadge label={player.rarity} tone={rarityTone(player.rarity)} />
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(player)}
                      className="p-2 glass hover:text-[#f5c518] transition-colors"
                      aria-label="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(player)}
                      className="p-2 glass hover:bg-red-500/20 text-red-400 transition-colors"
                      aria-label="Remover"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        </div>
      )}

      <GlassModal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={save} className="p-8 space-y-5">
          <h2 className="text-2xl font-bold">
            {editing ? 'Editar jogador' : 'Novo jogador'}
          </h2>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#b0bec5]">Foto do jogador</label>
            <div className="flex items-center gap-4">
              <span className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <StickerImage
                  imageUrl={photoPreview}
                  emoji="📷"
                  alt="Pré-visualização da foto"
                  emojiClassName="text-3xl"
                />
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
              >
                <Upload size={16} />
                {photo || editing?.image_url ? 'Trocar foto' : 'Enviar foto'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#b0bec5]">Seleção</label>
            <select
              className="input-field bg-[#1a3a5c]"
              value={form.team_id}
              onChange={(event) => setForm({ ...form, team_id: event.target.value })}
              required
            >
              <option value="">Selecione...</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#b0bec5]">Nome do jogador</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ex: Neymar Jr"
              value={form.player_name}
              onChange={(event) => setForm({ ...form, player_name: event.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#b0bec5]">Raridade</label>
            <select
              className="input-field bg-[#1a3a5c]"
              value={form.rarity}
              onChange={(event) => setForm({ ...form, rarity: event.target.value as Rarity })}
            >
              {RARITIES.map((rarity) => (
                <option key={rarity} value={rarity}>
                  {rarity}
                </option>
              ))}
            </select>
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
