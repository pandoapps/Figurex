import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import GlassModal from './ui/GlassModal';
import { adService } from '../services/adService';
import { resolveErrorMessage } from '../services/api';
import { useToast } from '../hooks/useToast';
import type { Ad } from '../types';

interface EditAdModalProps {
  ad: Ad | null;
  onClose: () => void;
  onUpdated: (ad: Ad) => void;
}

export default function EditAdModal({ ad, onClose, onUpdated }: EditAdModalProps) {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ad) {
      setTitle(ad.title);
      setPrice(String(ad.price));
      setDescription(ad.description ?? '');
    }
  }, [ad]);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!ad) return;

    setSubmitting(true);
    try {
      const updated = await adService.adminUpdate(ad.id, {
        title,
        price: Number(price),
        description: description || undefined,
      });
      toast.success('Anúncio atualizado com sucesso.');
      onUpdated(updated);
      onClose();
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassModal isOpen={!!ad} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Pencil size={22} className="text-[#f5c518]" /> Editar anúncio
        </h2>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#b0bec5] uppercase tracking-wider">
            Título
          </label>
          <input
            type="text"
            className="input-field"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>

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
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#b0bec5] uppercase tracking-wider">
            Descrição
          </label>
          <textarea
            className="input-field h-24 resize-none"
            placeholder="Descrição do anúncio..."
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
            disabled={submitting}
          >
            {submitting ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </GlassModal>
  );
}
