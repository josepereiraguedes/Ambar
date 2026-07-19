import { X, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Product, CartItem } from '../types';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const [size, setSize] = useState(product?.sizes[0] || '');
  const [color, setColor] = useState(product?.colors[0] || '');

  // Reset selections when product changes
  useEffect(() => {
    if (product) {
      setSize(product.sizes[0] || '');
      setColor(product.colors[0] || '');
    }
  }, [product]);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart({
      id: `${product.id}-${size}-${color}`,
      product,
      quantity: 1,
      size,
      color
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-3 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full text-gray-500 hover:text-gray-900 transition-colors shadow-sm border border-gray-100"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-full md:w-1/2 bg-gray-50 flex-shrink-0">
            <div className="aspect-square md:aspect-auto md:h-full relative overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover mix-blend-multiply" 
              />
              {product.category && (
                <span className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm text-gray-800 text-sm font-bold px-4 py-1.5 rounded-full shadow-sm z-10">
                  {product.category}
                </span>
              )}
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="absolute top-6 right-6 bg-red-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-sm z-10">
                  Oferta
                </span>
              )}
            </div>
          </div>

          <div className="w-full md:w-1/2 p-5 sm:p-8 md:p-10 flex flex-col overflow-y-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{product.name}</h2>
            <div className="flex flex-col mb-6">
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-lg text-gray-400 line-through">
                  R$ {product.oldPrice.toFixed(2).replace('.', ',')}
                </span>
              )}
              <div className="text-3xl font-bold text-orange-600">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </div>
            </div>
            
            <p className="text-gray-600 leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="space-y-6 flex-1">
              <div>
                <label className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 block">Selecione o Tamanho</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                        size === s 
                          ? 'border-gray-900 bg-gray-900 text-white shadow-md' 
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 block">Selecione a Cor</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                        color === c 
                          ? 'border-gray-900 bg-gray-900 text-white shadow-md' 
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-gray-100">
              <button 
                onClick={handleAdd}
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-colors shadow-lg shadow-orange-600/20"
              >
                <ShoppingCart className="w-6 h-6" />
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
