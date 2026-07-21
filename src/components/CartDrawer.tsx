import { X, Trash2, Plus, Minus, MessageCircle, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../types';
import { useState } from 'react';

import { StoreSettings } from '../hooks/useSettings';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  settings: StoreSettings;
}

export function CartDrawer({ isOpen, onClose, cart, updateQuantity, removeItem, clearCart, settings }: CartDrawerProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerCPF, setCustomerCPF] = useState('');
  const [customerCEP, setCustomerCEP] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const total = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  };

  const formatCEP = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    return digits.replace(/^(\d{5})(\d)/, '$1-$2');
  };

  const nameValid = customerName.trim().length > 0;
  const cpfValid = customerCPF.replace(/\D/g, '').length >= 11;
  const cepValid = customerCEP.replace(/\D/g, '').length >= 8;
  const isFormValid = nameValid && cpfValid && cepValid;

  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

  const getWhatsAppLink = () => {
    let text = `🛍️ *NOVO PEDIDO - ${settings.name}* 🛍️\n\n`;
    text += `👤 *Cliente:* ${customerName.trim()}\n`;
    text += `📄 *CPF:* ${customerCPF}\n`;
    text += `📮 *CEP:* ${customerCEP}\n\n`;

    text += `📋 *RESUMO DO PEDIDO:*\n`;
    cart.forEach((item, index) => {
      text += `\n📦 *${index + 1}. ${item.product.name}*\n`;
      text += `   ↳ 📏 Tam: ${item.size}\n`;
      text += `   ↳ 🎨 Cor: ${item.color}\n`;
      text += `   ↳ 🔢 Qtd: ${item.quantity} un.\n`;
      text += `   ↳ 💰 Subtotal: R$ ${(item.product.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
    });

    text += `\n━━━━━━━━━━━━━━\n`;
    text += `💵 *TOTAL DO PEDIDO: R$ ${total.toFixed(2).replace('.', ',')}*\n`;
    text += `━━━━━━━━━━━━━━\n\n`;
    text += `Olá! Gostaria de finalizar este pedido e saber as opções de pagamento e envio.`;

    const encoded = encodeURIComponent(text);
    return `https://wa.me/${settings.whatsapp}?text=${encoded}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-bg-light flex items-center justify-between bg-white safe-top">
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-text-secondary hover:text-text-primary hover:bg-bg-light rounded-xl transition-all duration-300">
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-base sm:text-lg font-bold text-text-primary">Seu Carrinho</h2>
              </div>
              {cart.length > 0 && (
                <button 
                  onClick={() => { if(window.confirm('Limpar todo o carrinho?')) clearCart(); }}
                  className="flex items-center gap-1.5 text-xs sm:text-sm text-text-secondary hover:text-red-500 font-medium transition-colors px-3 py-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Limpar
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-text-secondary">
                  <ShoppingBag className="w-14 h-14 sm:w-16 sm:h-16 mb-4 text-text-secondary/40" />
                  <p className="text-base sm:text-lg font-medium text-text-primary mb-2">Seu carrinho está vazio</p>
                  <p className="text-xs sm:text-sm text-text-secondary mb-6 sm:mb-8 text-center max-w-[250px] leading-relaxed">
                    Explore nosso catálogo e encontre as melhores meias para você.
                  </p>
                  <button 
                    onClick={onClose} 
                    className="px-6 sm:px-8 py-3 sm:py-3.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-all duration-300 shadow-md shadow-primary/20 active:scale-95"
                  >
                    Ver Catálogo
                  </button>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3 sm:gap-4 border-b border-bg-light pb-4 sm:pb-6 last:border-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-bg-light rounded-xl overflow-hidden border border-bg-medium shrink-0">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover mix-blend-multiply" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-text-primary text-xs sm:text-sm mb-0.5 sm:mb-1 line-clamp-2 leading-tight">{item.product.name}</h4>
                        <p className="text-[11px] sm:text-xs text-text-secondary mb-2 sm:mb-3">{item.size} • {item.color}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 sm:gap-2 bg-bg-light rounded-lg sm:rounded-xl p-0.5 sm:p-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-2 sm:p-2.5 hover:bg-bg-medium rounded-lg shadow-sm text-text-secondary transition-all duration-200 active:scale-90">
                              <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <span className="text-sm font-medium text-center text-text-primary min-w-[20px]">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-2 sm:p-2.5 hover:bg-bg-medium rounded-lg shadow-sm text-text-secondary transition-all duration-200 active:scale-90">
                              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="font-semibold text-text-primary text-xs sm:text-sm">
                              R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                            </span>
                            <button onClick={() => removeItem(item.id)} className="p-2 sm:p-2.5 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 active:scale-90">
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-bg-light p-4 sm:p-6 bg-bg-light space-y-3 sm:space-y-4 safe-bottom">
                <div className="space-y-2.5 sm:space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-text-primary mb-1 sm:mb-1.5">Nome Completo <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={customerName}
                      onBlur={() => markTouched('name')}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Seu nome completo"
                      className={`w-full px-3 sm:px-4 min-h-[44px] sm:min-h-[48px] rounded-xl border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-300 text-sm bg-white text-text-primary placeholder-text-secondary ${
                        touched.name && !nameValid ? 'border-red-400 ring-1 ring-red-400' : 'border-bg-medium'
                      }`}
                    />
                    {touched.name && !nameValid && (
                      <p className="text-[11px] text-red-500 mt-1">Preencha seu nome completo</p>
                    )}
                  </div>
                  <div className="flex gap-2.5 sm:gap-3">
                    <div className="flex-1">
                      <label className="block text-xs sm:text-sm font-medium text-text-primary mb-1 sm:mb-1.5">CPF <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={customerCPF}
                        onBlur={() => markTouched('cpf')}
                        onChange={(e) => setCustomerCPF(formatCPF(e.target.value))}
                        placeholder="000.000.000-00"
                        className={`w-full px-3 sm:px-4 min-h-[44px] sm:min-h-[48px] rounded-xl border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-300 text-sm bg-white text-text-primary placeholder-text-secondary ${
                          touched.cpf && !cpfValid ? 'border-red-400 ring-1 ring-red-400' : 'border-bg-medium'
                        }`}
                      />
                      {touched.cpf && !cpfValid && (
                        <p className="text-[11px] text-red-500 mt-1">Informe um CPF válido</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs sm:text-sm font-medium text-text-primary mb-1 sm:mb-1.5">CEP <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={customerCEP}
                        onBlur={() => markTouched('cep')}
                        onChange={(e) => setCustomerCEP(formatCEP(e.target.value))}
                        placeholder="00000-000"
                        className={`w-full px-3 sm:px-4 min-h-[44px] sm:min-h-[48px] rounded-xl border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-300 text-sm bg-white text-text-primary placeholder-text-secondary ${
                          touched.cep && !cepValid ? 'border-red-400 ring-1 ring-red-400' : 'border-bg-medium'
                        }`}
                      />
                      {touched.cep && !cepValid && (
                        <p className="text-[11px] text-red-500 mt-1">Informe um CEP válido</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-base sm:text-lg font-bold text-text-primary pt-2 sm:pt-3 border-t border-bg-medium">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
                <button
                  onClick={() => {
                    if (isFormValid) {
                      window.open(getWhatsAppLink(), '_blank');
                      clearCart();
                    }
                  }}
                  disabled={!isFormValid}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed text-white py-3.5 sm:py-4 px-4 rounded-xl font-medium transition-all duration-300 shadow-md shadow-primary/20 active:scale-[0.98] text-sm sm:text-base"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  Enviar Pedido via WhatsApp
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 sm:py-3.5 px-4 rounded-xl font-medium text-text-primary bg-white border border-bg-medium hover:bg-bg-light transition-all duration-300 shadow-sm text-sm sm:text-base active:scale-95"
                >
                  Continuar Comprando
                </button>
                <p className="text-[11px] sm:text-xs text-center text-text-secondary leading-relaxed">
                  Você será redirecionado para o WhatsApp com o resumo do seu pedido pronto para envio.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
