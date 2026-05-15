import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Megaphone } from 'lucide-react';
import GlassModal from './ui/GlassModal';
import StickerImage from './ui/StickerImage';
import StatusBadge from './ui/StatusBadge';
import { teamService, stickerDefinitionService } from '../services/teamService';
import { adService } from '../services/adService';
import { userService } from '../services/userService';
import { resolveErrorMessage } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import type { Ad, StickerDefinition, Team, User } from '../types';

interface CreateAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (ad: Ad) => void;
  adminMode?: boolean;
}

export default function CreateAdModal({ isOpen, onClose, onCreated, adminMode = false }: CreateAdModalProps) {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [definitions, setDefinitions] = useState<StickerDefinition[]>([]);
  const [teamId, setTeamId] = useState('');
  const [stickerId, setStickerId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    teamService
      .list()
      .then(setTeams)
      .catch((error) => toast.error(resolveErrorMessage(error)));

    if (adminMode) {
      userService
        .list()
        .then(setUsers)
        .catch((error) => toast.error(resolveErrorMessage(error)));
    }
  }, [isOpen, adminMode, toast]);

  useEffect(() => {
    if (!teamId) {
      setDefinitions([]);
      setStickerId('');
      return;
    }

    stickerDefinitionService
      .list(Number(teamId))
      .then(setDefinitions)
      .catch((error) => toast.error(resolveErrorMessage(error)));
  }, [teamId, toast]);

  const selectedSticker = useMemo(
    () => definitions.find((definition) => definition.id === Number(stickerId)),
    [definitions, stickerId],
  );

  const resetForm = () => {
    setSelectedUserId('');
    setTeamId('');
    setStickerId('');
    setPrice('');
    setDescription('');
  };

  const handleClose = () => {
    if (submitting) {
      return;
    }
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (adminMode && !selectedUserId) {
      toast.error('Selecione o colecionador anunciante.');
      return;
    }

    if (!teamId || !stickerId || !price) {
      toast.error('Preencha a seleção, o jogador e o preço para publicar.');
      return;
    }

    const team = teams.find((item) => item.id === Number(teamId));
    const payload = {
      title: `${selectedSticker?.player_name} - ${team?.name}`,
      description: description || `Figurinha do ${selectedSticker?.player_name}`,
      price: Number(price),
      sticker_definition_id: Number(stickerId),
    };

    setSubmitting(true);
    try {
      const ad = adminMode
        ? await adService.adminCreate({ ...payload, user_id: Number(selectedUserId) })
        : await adService.create(payload);
      toast.success('Anúncio criado! Ele ficará pendente até a aprovação da moderação.');
      onCreated(ad);
      resetForm();
      onClose();
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassModal isOpen={isOpen} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Megaphone size={22} className="text-[#f5c518]" /> Criar novo anúncio
        </h2>

        {!adminMode && !currentUser?.cep && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
            <AlertTriangle className="mt-0.5 w-5 h-5 shrink-0 text-amber-400" />
            <div className="text-sm">
              <p className="font-semibold text-amber-300">Perfil incompleto</p>
              <p className="text-amber-200/80 mt-0.5">
                Para anunciar é necessário informar o seu CEP — ele é usado para calcular o frete para o comprador.
              </p>
              <button
                type="button"
                onClick={() => { onClose(); navigate('/painel/perfil'); }}
                className="mt-2 underline text-amber-300 hover:text-amber-100 text-xs font-semibold"
              >
                Completar perfil agora →
              </button>
            </div>
          </div>
        )}

        {adminMode && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#b0bec5] uppercase tracking-wider">
              Anunciante
            </label>
            <select
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              className="input-field bg-[#1a3a5c]"
            >
              <option value="">Selecione o colecionador...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#b0bec5] uppercase tracking-wider">
            Passo 1: Escolha a seleção
          </label>
          <select
            value={teamId}
            onChange={(event) => setTeamId(event.target.value)}
            className="input-field bg-[#1a3a5c]"
          >
            <option value="">Selecione uma seleção...</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#b0bec5] uppercase tracking-wider">
            Passo 2: Escolha o jogador
          </label>
          <select
            value={stickerId}
            onChange={(event) => setStickerId(event.target.value)}
            className="input-field bg-[#1a3a5c]"
            disabled={!teamId}
          >
            <option value="">Selecione um jogador...</option>
            {definitions.map((definition) => (
              <option key={definition.id} value={definition.id}>
                {definition.player_name} ({definition.rarity})
              </option>
            ))}
          </select>
        </div>

        {selectedSticker && (
          <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5">
              <StickerImage
                imageUrl={selectedSticker.image_url}
                alt={selectedSticker.player_name}
                emojiClassName="text-5xl"
              />
            </div>
            <div className="flex flex-col items-start gap-1.5">
              <StatusBadge label={selectedSticker.rarity} tone="gold" />
              <span className="font-bold">{selectedSticker.player_name}</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#b0bec5] uppercase tracking-wider">
            Preço (R$)
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            className="input-field"
            placeholder="0,00"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#b0bec5] uppercase tracking-wider">
            Observações / Descrição
          </label>
          <textarea
            className="input-field h-24 resize-none"
            placeholder="Ex: Figurinha impecável, direto do pacote..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="btn-secondary flex-grow py-3"
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary flex-grow py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting || (!adminMode && !currentUser?.cep)}
          >
            {submitting ? 'Publicando...' : 'Publicar anúncio'}
          </button>
        </div>
      </form>
    </GlassModal>
  );
}
