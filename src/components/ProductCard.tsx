import { useState } from 'react';
import { ImageIcon, Plus } from 'lucide-react';
import { Product, CartItem } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (item: CartItem) => void;
  onView?: () => void;
}

export function ProductCard({ product, onAddToCart, onView }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  const discount = product.oldPrice && product.oldPrice > product.price
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart({
      id: `${product.id}-${product.sizes[0]}-${product.colors[0]}`,
      product,
      quantity: 1,
      size: product.sizes[0],
      color: product.colors[0],
    });
  };

  return (
    <div
      onClick={onView}
      className="flex flex-col bg-white rounded-xl shadow-sm border border-bg-medium overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group cursor-pointer active:scale-[0.97]"
    >
      <div className="aspect-square overflow-hidden bg-bg-medium relative">
        {product.category && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/95 text-text-secondary text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-sm z-10 backdrop-blur-sm">
            {product.category}
          </span>
        )}
        {discount && (
          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-primary text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-md z-10">
            -{discount}%
          </span>
        )}
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center bg-bg-light">
            <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-bg-medium" />
          </div>
        ) : (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out" 
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 bg-primary text-white rounded-full shadow-md shadow-primary/30 flex items-center justify-center active:scale-90 hover:bg-primary-hover transition-all duration-200 z-10           max-sm:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          title="Adicionar ao carrinho"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>
      <div className="p-3 sm:p-5 flex flex-col flex-1 gap-0.5 sm:gap-1">
        <h3 className="font-semibold text-text-primary text-sm sm:text-lg leading-tight line-clamp-2">{product.name}</h3>
        <div className="flex items-baseline gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-[11px] sm:text-sm text-text-secondary line-through">
              R$ {product.oldPrice.toFixed(2).replace('.', ',')}
            </span>
          )}
          <span className="text-base sm:text-2xl font-bold text-text-primary">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>
    </div>
  );
}
