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

  const isFormValid = customerName.trim().length > 0
    && customerCPF.replace(/\D/g, '').length >= 11
    && customerCEP.replace(/\D/g, '').length >= 8;

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
          {/* Fundo Escuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />
          
          {/* Gaveta */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            <div className="px-6 py-4 border-b border-bg-light flex items-center justify-between bg-white">
              <h2 className="text-lg font-bold text-text-primary">Seu Carrinho</h2>
              <button onClick={onClose} className="p-2.5 text-text-secondary hover:text-text-primary hover:bg-bg-light rounded-xl transition-all duration-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-text-secondary">
                  <ShoppingBag className="w-16 h-16 mb-4 text-bg-medium" />
                  <p className="text-lg font-medium text-text-primary mb-2">Seu carrinho está vazio</p>
                  <p className="text-sm text-text-secondary mb-8 text-center max-w-[250px] leading-relaxed">
                    Explore nosso catálogo e encontre as melhores meias para você.
                  </p>
                  <button 
                    onClick={onClose} 
                    className="px-8 py-3.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-all duration-300 shadow-md shadow-primary/20"
                  >
                    Ver Catálogo
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 border-b border-bg-light pb-6 last:border-0">
                      <div className="w-20 h-20 bg-bg-light rounded-xl overflow-hidden border border-bg-medium shrink-0">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover mix-blend-multiply" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-text-primary text-sm mb-1 line-clamp-2 leading-tight">{item.product.name}</h4>
                        <p className="text-xs text-text-secondary mb-3">{item.size} • {item.color}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-bg-light rounded-xl p-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-2.5 hover:bg-white rounded-lg shadow-sm text-text-secondary transition-all duration-200">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium w-4 text-center text-text-primary">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-2.5 hover:bg-white rounded-lg shadow-sm text-text-secondary transition-all duration-200">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-text-primary text-sm">
                              R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                            </span>
                            <button onClick={() => removeItem(item.id)} className="p-2.5 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200">
                              <Trash2 className="w-4 h-4" />
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
              <div className="border-t border-bg-light p-6 bg-bg-light space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Nome Completo <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full px-4 min-h-[48px] rounded-xl border border-bg-medium focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-300 text-sm bg-white text-text-primary placeholder-text-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">CPF <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={customerCPF}
                      onChange={(e) => setCustomerCPF(formatCPF(e.target.value))}
                      placeholder="000.000.000-00"
                      className="w-full px-4 min-h-[48px] rounded-xl border border-bg-medium focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-300 text-sm bg-white text-text-primary placeholder-text-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">CEP de Entrega <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={customerCEP}
                      onChange={(e) => setCustomerCEP(formatCEP(e.target.value))}
                      placeholder="00000-000"
                      className="w-full px-4 min-h-[48px] rounded-xl border border-bg-medium focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-300 text-sm bg-white text-text-primary placeholder-text-secondary"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-lg font-bold text-text-primary pt-3 border-t border-bg-medium">
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
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed text-white py-4 px-4 rounded-xl font-medium transition-all duration-300 shadow-md shadow-primary/20"
                >
                  <MessageCircle className="w-5 h-5" />
                  Enviar Pedido via WhatsApp
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3.5 px-4 rounded-xl font-medium text-text-primary bg-white border border-bg-medium hover:bg-bg-light transition-all duration-300 shadow-sm"
                >
                  Continuar Comprando
                </button>
                <p className="text-xs text-center text-text-secondary leading-relaxed">
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
