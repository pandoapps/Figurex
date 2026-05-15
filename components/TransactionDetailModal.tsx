import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import GlassModal from './ui/GlassModal';
import StickerImage from './ui/StickerImage';
import type { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { transactionService } from '../services/transactionService';
import { resolveErrorMessage } from '../services/api';
import { useToast } from '../hooks/useToast';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  perspective: 'buyer' | 'seller';
  onClose: () => void;
  onUpdated?: (transaction: Transaction) => void;
}

const STEPS = [
  { id: 'aguardando_envio', label: 'Aguardando envio', icon: '📦' },
  { id: 'enviado', label: 'Enviado', icon: '🚚' },
  { id: 'entregue', label: 'Entregue', icon: '✅' },
];

export default function TransactionDetailModal({
  transaction,
  perspective,
  onClose,
  onUpdated,
}: TransactionDetailModalProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    transaction?.evidence_image_url ?? null,
  );
  const [trackingCode, setTrackingCode] = useState(transaction?.tracking_code ?? '');
  const [submitting, setSubmitting] = useState(false);

  if (!transaction) {
    return null;
  }

  const currentIndex = STEPS.findIndex((step) => step.id === transaction.shipping_status);
  const isSeller = perspective === 'seller';
  const canRegisterShipping = isSeller && transaction.shipping_status !== 'entregue';

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : transaction.evidence_image_url);
  };

  const handleRegisterShipping = async () => {
    if (!photo && !trackingCode.trim()) {
      toast.error('Adicione uma foto ou informe o código de rastreio.');
      return;
    }

    setSubmitting(true);
    try {
      const updated = await transactionService.registerShipping(transaction.id, {
        evidence_image: photo,
        tracking_code: trackingCode.trim(),
      });
      toast.success('Evidência de envio registrada com sucesso.');
      onUpdated?.(updated);
      onClose();
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassModal isOpen={Boolean(transaction)} onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="p-8">
        <div className="flex gap-6 mb-8 items-center">
          <div className="w-24 h-32 glass bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
            <StickerImage
              imageUrl={transaction.item_image_url}
              alt={transaction.item_name}
              emojiClassName="text-5xl"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{transaction.item_name}</h2>
            <p className="text-[#b0bec5] text-sm">Transação #{transaction.id}</p>
            <div className="mt-2 text-[#f5c518] font-bold text-xl">
              {formatCurrency(transaction.value)}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#b0bec5] mb-6">
              Status do pedido
            </h3>
            <div className="relative flex justify-between">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/10 -z-10 mx-6" />
              {STEPS.map((step, index) => {
                const isActive = index === currentIndex;
                const isPast = index < currentIndex;
                return (
                  <div key={step.id} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? 'bg-[#f5c518] border-[#f5c518] text-[#0a1628] scale-110'
                          : isPast
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'bg-[#0a1628] border-white/10 text-white/40'
                      }`}
                    >
                      {isPast ? '✓' : step.icon}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-tight text-center w-20 ${
                        isActive ? 'text-[#f5c518]' : 'text-[#b0bec5]'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {canRegisterShipping ? (
            <div className="glass p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#b0bec5] mb-4">
                Evidência de envio
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#b0bec5]">Foto do envio</label>
                  <div className="flex items-center gap-4">
                    <span className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <StickerImage
                        imageUrl={photoPreview}
                        emoji="📷"
                        alt="Evidência de envio"
                        emojiClassName="text-3xl"
                      />
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
                    >
                      <Upload size={16} />
                      {photo || transaction.evidence_image_url ? 'Trocar foto' : 'Enviar foto'}
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
                  <label className="text-xs font-medium text-[#b0bec5]">Código de rastreio</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ex: BR123456789BR"
                    value={trackingCode}
                    onChange={(event) => setTrackingCode(event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRegisterShipping}
                  disabled={submitting}
                  className="btn-primary w-full py-3"
                >
                  {submitting ? 'Salvando...' : 'Registrar envio'}
                </button>
              </div>
            </div>
          ) : (
            <div className="glass p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#b0bec5] mb-4">
                Evidência de envio
              </h3>
              {transaction.evidence_image_url || transaction.tracking_code ? (
                <div className="space-y-4">
                  {transaction.tracking_code && (
                    <div>
                      <span className="text-xs text-[#b0bec5]">Código de rastreio</span>
                      <p className="font-bold tracking-wide">{transaction.tracking_code}</p>
                    </div>
                  )}
                  {transaction.evidence_image_url && (
                    <a
                      href={transaction.evidence_image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-40 h-40 rounded-xl overflow-hidden bg-white/5 border border-white/10"
                    >
                      <img
                        src={transaction.evidence_image_url}
                        alt="Evidência de envio"
                        className="w-full h-full object-cover"
                      />
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#b0bec5]">
                  O vendedor ainda não registrou a evidência de envio.
                </p>
              )}
            </div>
          )}

          <div className="glass p-6 bg-[#f5c518]/5 border-[#f5c518]/20">
            <h3 className="text-sm font-bold flex items-center gap-2 text-[#f5c518] mb-4">
              💡 {isSeller ? 'Instruções para o vendedor' : 'Instruções para o comprador'}
            </h3>
            <div className="space-y-3 text-sm text-[#b0bec5]">
              {isSeller ? (
                <>
                  <p>1. Embale a figurinha com proteção rígida para evitar dobras no transporte.</p>
                  <p>2. Imprima a etiqueta do FreteNet disponível no painel de vendas.</p>
                  <p>3. Leve o pacote até a agência autorizada mais próxima.</p>
                  <p>4. Registre acima a foto do comprovante e o código de rastreio do envio.</p>
                </>
              ) : (
                <>
                  <p>1. Seu pagamento via Asaas foi confirmado e o vendedor foi notificado.</p>
                  <p>2. Assim que o vendedor postar, o código de rastreio aparecerá aqui.</p>
                  <p>3. Ao receber, verifique o estado da figurinha antes de confirmar.</p>
                </>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs">
            <span className="text-[#b0bec5]">
              {isSeller ? 'Comprador: ' : 'Vendedor: '}
              <strong className="text-white">
                {isSeller ? transaction.buyer.name : transaction.seller.name}
              </strong>
            </span>
            <span className="text-[#b0bec5]">Data: {formatDate(transaction.created_at)}</span>
          </div>
        </div>
      </div>
    </GlassModal>
  );
}
