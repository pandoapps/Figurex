import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle, Clock, Copy, Package, Truck } from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import StickerImage from '../components/ui/StickerImage';
import { adService } from '../services/adService';
import { transactionService } from '../services/transactionService';
import { shippingService } from '../services/shippingService';
import { authService } from '../services/authService';
import { resolveErrorMessage } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/format';
import type { Ad, ShippingOption, Transaction } from '../types';

export default function Checkout() {
  const { adId } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2>(1);
  const [generating, setGenerating] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [paid, setPaid] = useState(false);

  // Endereço — pré-preenchido com dados salvos no perfil
  const [cep, setCep] = useState(user?.cep ?? '');
  const [rua, setRua] = useState(user?.address ?? '');
  const [numero, setNumero] = useState(user?.number ?? '');
  const [bairro, setBairro] = useState(user?.neighborhood ?? '');
  const [cidade, setCidade] = useState(user?.city ?? '');
  const [estado, setEstado] = useState(user?.state ?? '');
  const [complemento, setComplemento] = useState(user?.complement ?? '');
  const [loadingCep, setLoadingCep] = useState(false);
  const numeroRef = useRef<HTMLInputElement>(null);

  // CPF — pré-preenchido se já salvo no perfil
  const [cpf, setCpf] = useState(user?.cpf ?? '');

  const handleCpfChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    let masked = digits;
    if (digits.length > 9) masked = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    else if (digits.length > 6) masked = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    else if (digits.length > 3) masked = `${digits.slice(0, 3)}.${digits.slice(3)}`;
    setCpf(masked);
  };

  // Frete
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);

  const stopPollingRef = useRef<(() => void) | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!adId) {
      navigate('/mercado');
      return;
    }

    adService
      .show(Number(adId))
      .then((loadedAd) => {
        setAd(loadedAd);
        // Se o usuário já tem CEP salvo, calcula o frete automaticamente
        if (user?.cep) {
          fetchShippingOptions(loadedAd.id, user.cep);
        }
      })
      .catch((error) => {
        toast.error(resolveErrorMessage(error));
        navigate('/mercado');
      })
      .finally(() => setLoading(false));
  }, [adId, navigate, toast]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      stopPollingRef.current?.();
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  useEffect(() => {
    if (step !== 2 || paid || !transaction) return;

    setSecondsLeft(60);
    countdownRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(countdownRef.current!);
          handleExpire();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [step, paid]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExpire = async () => {
    stopPollingRef.current?.();
    if (transaction) {
      try {
        await transactionService.cancel(transaction.id);
      } catch {
        // ignora — o admin pode limpar manualmente
      }
    }
    toast.error('Tempo esgotado. A figurinha voltou ao mercado.');
    navigate('/mercado');
  };

  const fetchShippingOptions = async (adId: number, rawCep: string) => {
    setLoadingShipping(true);
    setShippingOptions([]);
    setSelectedShipping(null);
    try {
      const options = await shippingService.quote(adId, rawCep);
      setShippingOptions(options);
      setSelectedShipping(options[0] ?? null);
    } catch {
      toast.error('Não foi possível calcular o frete. Tente novamente.');
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleCepChange = async (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    const masked = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setCep(masked);

    if (digits.length === 8 && ad) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setRua(data.logradouro ?? '');
          setBairro(data.bairro ?? '');
          setCidade(data.localidade ?? '');
          setEstado(data.uf ?? '');
          numeroRef.current?.focus();
          await fetchShippingOptions(ad.id, masked);
        } else {
          toast.error('CEP não encontrado.');
        }
      } catch {
        toast.error('Erro ao buscar o CEP.');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleGeneratePix = async () => {
    if (!ad || !selectedShipping) return;

    const rawCep = cep.replace(/\D/g, '');
    if (rawCep.length !== 8) {
      toast.error('Informe um CEP válido para continuar.');
      return;
    }

    const rawCpf = cpf.replace(/\D/g, '');
    if (rawCpf.length !== 11) {
      toast.error('Informe um CPF válido para continuar.');
      return;
    }

    setGenerating(true);
    try {
      // Salva CPF e endereço no perfil antes de gerar a cobrança.
      const updatedUser = await authService.updateProfile({
        name: user!.name,
        cpf,
        cep,
        neighborhood: bairro,
        address: rua,
        number: numero,
        complement: complemento,
        city: cidade,
        state: estado,
      });
      setUser(updatedUser);

      const tx = await transactionService.checkout({
        adId: ad.id,
        destinationCep: cep,
        shippingService: selectedShipping.service,
      });
      setTransaction(tx);
      setStep(2);

      const stop = await transactionService.pollUntilPaid(tx.id, (updated) => {
        setTransaction(updated);
        if (updated.payment_status === 'pago') {
          setPaid(true);
          stopPollingRef.current = null;
          if (countdownRef.current) clearInterval(countdownRef.current);
          setTimeout(() => navigate('/painel/compras'), 3000);
        }
      });

      stopPollingRef.current = stop;
    } catch (error) {
      toast.error(resolveErrorMessage(error));
    } finally {
      setGenerating(false);
    }
  };

  const copyPixCode = () => {
    if (!transaction?.pix_payload) return;
    navigator.clipboard.writeText(transaction.pix_payload).then(() => {
      toast.success('Código PIX copiado!');
    });
  };

  if (loading) {
    return <Spinner label="Carregando checkout..." />;
  }

  if (!ad) {
    return null;
  }

  const shippingCost = selectedShipping?.price ?? 0;
  const total = ad.price + shippingCost;
  const canCheckout = !!selectedShipping && !loadingShipping && !loadingCep && cpf.replace(/\D/g, '').length === 11;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="glass h-20 flex items-center px-6 md:px-8 mx-4 mt-4 gap-4">
        <button
          type="button"
          onClick={() => navigate('/mercado')}
          className="text-2xl hover:text-[#f5c518]"
          aria-label="Voltar"
        >
          <ArrowLeft />
        </button>
        <span className="font-bold text-xl text-[#f5c518]">Checkout Figurex</span>
      </header>

      <main className="flex-grow py-12 px-6 md:px-8 max-w-4xl mx-auto w-full">
        {step === 1 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-3 gap-8"
          >
            <div className="md:col-span-2 space-y-8">
              {/* Endereço */}
              <div className="glass p-8">
                <h3 className="text-xl font-bold mb-6">🚚 Informações de entrega</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#b0bec5]">CEP</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="00000-000"
                      value={cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      maxLength={9}
                      disabled={loadingCep}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#b0bec5]">Rua</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Rua, avenida..."
                        value={rua}
                        onChange={(e) => setRua(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#b0bec5]">Número</label>
                      <input
                        ref={numeroRef}
                        type="text"
                        className="input-field"
                        placeholder="123"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#b0bec5]">Bairro</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Centro..."
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#b0bec5]">Cidade</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="São Paulo"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#b0bec5]">Estado</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="SP"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        maxLength={2}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#b0bec5]">Complemento</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Apto, bloco... (opcional)"
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Opções de frete */}
              {(loadingShipping || shippingOptions.length > 0) && (
                <div className="glass p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#f5c518]" />
                    Modalidade de envio
                  </h3>
                  {loadingShipping ? (
                    <div className="flex items-center gap-3 text-[#b0bec5] text-sm">
                      <div className="w-4 h-4 border-2 border-[#f5c518] border-t-transparent rounded-full animate-spin" />
                      Calculando frete para seu CEP…
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {shippingOptions.map((option) => {
                        const isSelected = selectedShipping?.service === option.service;
                        return (
                          <button
                            key={option.service}
                            type="button"
                            onClick={() => setSelectedShipping(option)}
                            className={`w-full p-4 glass flex items-center justify-between transition-all ${
                              isSelected ? 'border border-[#f5c518]' : 'border border-transparent hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <Package className={`w-5 h-5 ${isSelected ? 'text-[#f5c518]' : 'text-[#b0bec5]'}`} />
                              <div className="text-left">
                                <div className="font-bold">{option.service}</div>
                                {option.delivery_days != null && (
                                  <div className="text-xs text-[#b0bec5]">
                                    Prazo estimado: até {option.delivery_days} dia{option.delivery_days !== 1 ? 's' : ''} úteis
                                  </div>
                                )}
                                {option.fallback && (
                                  <div className="text-[10px] text-amber-400">
                                    Preço fixo (FreteNet não configurado)
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`font-bold ${isSelected ? 'text-[#f5c518]' : ''}`}>
                                {formatCurrency(option.price)}
                              </span>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? 'border-[#f5c518]' : 'border-white/30'
                              }`}>
                                {isSelected && <div className="w-2.5 h-2.5 bg-[#f5c518] rounded-full" />}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Pagamento */}
              <div className="glass p-8">
                <h3 className="text-xl font-bold mb-6">💳 Forma de pagamento</h3>
                <div className="w-full p-4 glass border-[#f5c518] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#f5c518] text-[#0a1628] rounded-lg flex items-center justify-center font-bold text-xs">
                      PIX
                    </div>
                    <div className="text-left">
                      <div className="font-bold">PIX Instantâneo</div>
                      <div className="text-xs text-[#b0bec5]">Liberação imediata da figurinha</div>
                    </div>
                  </div>
                  <div className="w-6 h-6 border-2 border-[#f5c518] rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-[#f5c518] rounded-full" />
                  </div>
                </div>

                <div className="mt-6 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#b0bec5]">
                    CPF do pagador
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => handleCpfChange(e.target.value)}
                    maxLength={14}
                  />
                </div>
              </div>
            </div>

            {/* Resumo */}
            <div className="space-y-6">
              <div className="glass p-6 sticky top-28">
                <h3 className="font-bold mb-6">Resumo do pedido</h3>
                <div className="flex gap-4 mb-6 border-b border-white/5 pb-6">
                  <div className="w-16 h-20 glass bg-white/5 flex items-center justify-center overflow-hidden">
                    <StickerImage
                      imageUrl={ad.image_url}
                      alt={ad.title}
                      emojiClassName="text-4xl"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="text-sm font-bold">{ad.title}</div>
                    <div className="text-xs text-[#b0bec5]">{ad.rarity}</div>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#b0bec5]">Subtotal</span>
                    <span>{formatCurrency(ad.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#b0bec5]">
                      {selectedShipping ? `Frete (${selectedShipping.service})` : 'Frete'}
                    </span>
                    {loadingShipping ? (
                      <span className="text-[#b0bec5] text-xs">calculando…</span>
                    ) : selectedShipping ? (
                      <span className="text-green-400">{formatCurrency(selectedShipping.price)}</span>
                    ) : (
                      <span className="text-[#b0bec5] text-xs">informe o CEP</span>
                    )}
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-[#f5c518]">
                      {selectedShipping ? formatCurrency(total) : '—'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGeneratePix}
                  className="btn-primary w-full mt-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!canCheckout || generating}
                >
                  {generating
                    ? 'Gerando PIX…'
                    : loadingShipping
                      ? 'Calculando frete…'
                      : !selectedShipping
                        ? 'Informe o CEP'
                        : 'Gerar PIX'}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center"
          >
            {paid ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-10 space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="flex justify-center"
                >
                  <CheckCircle className="w-20 h-20 text-green-400" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-green-400">Pagamento confirmado!</h2>
                  <p className="text-[#b0bec5] text-sm mt-2">
                    A figurinha foi adicionada ao seu histórico de compras. Redirecionando…
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="glass p-10 space-y-8">
                <div className="flex flex-col items-center">
                  <div className="text-5xl mb-4">⚡</div>
                  <h2 className="text-2xl font-bold">Quase lá!</h2>
                  <p className="text-[#b0bec5] text-sm">
                    Escaneie o QR Code ou copie o código PIX abaixo.
                  </p>
                </div>

                {/* QR Code */}
                <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto flex items-center justify-center">
                  {transaction?.pix_qrcode ? (
                    <img
                      src={`data:image/png;base64,${transaction.pix_qrcode}`}
                      alt="QR Code PIX"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full border-4 border-black flex items-center justify-center bg-gray-50">
                      <div className="font-bold text-black text-[10px] text-center p-2">
                        Carregando<br />QR Code…
                      </div>
                    </div>
                  )}
                </div>

                {/* Valor */}
                <div className="text-center">
                  <span className="text-[#b0bec5] text-sm">Valor a pagar</span>
                  <div className="text-2xl font-bold text-[#f5c518]">
                    {transaction ? formatCurrency(transaction.total) : formatCurrency(total)}
                  </div>
                  {transaction?.shipping_service && (
                    <div className="text-xs text-[#b0bec5] mt-1">
                      Frete via {transaction.shipping_service}
                    </div>
                  )}
                </div>

                {/* Código PIX copia e cola */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-left text-[#b0bec5] uppercase tracking-widest">
                    Código PIX (copia e cola)
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      className="input-field flex-grow font-mono text-[10px]"
                      value={transaction?.pix_payload ?? ''}
                      placeholder="Aguardando código PIX…"
                    />
                    <button
                      type="button"
                      className="glass px-4 py-2 text-xs flex items-center gap-1 hover:text-[#f5c518]"
                      onClick={copyPixCode}
                      disabled={!transaction?.pix_payload}
                    >
                      <Copy className="w-3 h-3" />
                      Copiar
                    </button>
                  </div>
                </div>

                {/* Countdown + status */}
                <div className="pt-6 border-t border-white/10 space-y-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className={`text-4xl font-bold tabular-nums ${secondsLeft <= 10 ? 'text-red-400' : 'text-[#f5c518]'}`}>
                      {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${secondsLeft <= 10 ? 'bg-red-400' : 'bg-[#f5c518]'}`}
                        style={{ width: `${(secondsLeft / 60) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#b0bec5]">
                      Pague dentro deste tempo para garantir a figurinha.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-[#b0bec5]">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span className="text-sm">Aguardando confirmação do pagamento…</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
