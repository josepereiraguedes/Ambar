import { Product, CartItem } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (item: CartItem) => void;
  onView?: () => void;
}

export function ProductCard({ product, onView }: ProductCardProps) {
  return (
    <div
      onClick={onView}
      className="flex flex-col bg-white rounded-xl shadow-sm border border-bg-medium overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group cursor-pointer"
    >
      <div className="aspect-square overflow-hidden bg-bg-light relative">
        {product.category && (
          <span className="absolute top-3 left-3 bg-white/95 text-text-secondary text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm z-10 backdrop-blur-sm">
            {product.category}
          </span>
        )}
        {product.oldPrice && product.oldPrice > product.price && (
          <span className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md z-10">
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
      <div className="p-5 flex flex-col flex-1 gap-1">
        <h3 className="font-semibold text-text-primary text-lg leading-tight">{product.name}</h3>
        <div className="flex items-baseline gap-2 mt-1">
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-sm text-text-secondary line-through">
              R$ {product.oldPrice.toFixed(2).replace('.', ',')}
            </span>
          )}
          <span className="text-2xl font-bold text-text-primary">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>
    </div>
  );
}
