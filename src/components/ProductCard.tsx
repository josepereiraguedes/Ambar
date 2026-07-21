import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product, CartItem } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (item: CartItem) => void;
  onView?: () => void;
}

export function ProductCard({ product, onAddToCart, onView }: ProductCardProps) {
  const [size, setSize] = useState(product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]);

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
    <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="aspect-square overflow-hidden bg-gray-50 relative cursor-pointer" onClick={onView}>
        {product.category && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm z-10">
            {product.category}
          </span>
        )}
        {product.oldPrice && product.oldPrice > product.price && (
          <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm z-10">
            Oferta
          </span>
        )}
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out" 
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-lg mb-1">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
        
        <div className="mb-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-2 block">Tamanho</label>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(s => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-4 py-2.5 text-sm rounded-md border transition-colors ${size === s ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-2 block">Cor</label>
            <div className="flex flex-wrap gap-2">
              {product.colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`px-4 py-2.5 text-sm rounded-md border transition-colors ${color === c ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
          <div className="flex flex-col">
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                R$ {product.oldPrice.toFixed(2).replace('.', ',')}
              </span>
            )}
            <span className="text-xl font-bold text-gray-900">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
