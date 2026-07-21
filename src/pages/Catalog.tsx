import { useState, useEffect } from 'react';
import { ShoppingBag, Search, MessageCircle, ArrowUp, CheckCircle2, Instagram, Facebook, Music2, Truck, Clock, Shield, Package, CreditCard, Heart, Star, ThumbsUp, Sparkles, Lock, Store, Phone, MapPin, Headphones, BadgeCheck, ChevronLeft, ChevronRight, Home, LayoutGrid } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { CartDrawer } from '../components/CartDrawer';
import { ProductModal } from '../components/ProductModal';
import { CartItem, Product } from '../types';
import { useProducts } from '../hooks/useProducts';
import { useSettings } from '../hooks/useSettings';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = { Truck, Clock, Shield, Package, CreditCard, Heart, Star, ThumbsUp, Sparkles, Lock, Store, Phone, MapPin, Headphones, BadgeCheck };

const ICON_TITLES: Record<string, string> = {
  Truck: 'Frete Grátis',
  Clock: 'Atendimento',
  Shield: 'Segurança',
  Package: 'Embalagem',
  CreditCard: 'Pagamento',
  Heart: 'Qualidade',
  Star: 'Destaque',
  ThumbsUp: 'Aprovado',
  Sparkles: 'Ofertas',
  Lock: 'Seguro',
  Store: 'Nossa Loja',
  Phone: 'Suporte',
  MapPin: 'Localização',
  Headphones: 'Suporte',
  BadgeCheck: 'Verificado',
};

const CART_STORAGE_KEY = 'catalogoambar-cart';

export default function App() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [isScrolled, setIsScrolled] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const navigate = useNavigate();

  const { products, isLoaded: productsLoaded, addProduct, updateProduct, removeProduct } = useProducts();
  const { settings, isLoaded: settingsLoaded, saveSettings } = useSettings();

  const allLoaded = productsLoaded && settingsLoaded;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = (newItem: CartItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === newItem.id);
      if (existing) {
        return prev.map(item => 
          item.id === newItem.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, newItem];
    });
    setToastMessage(`Adicionado: ${newItem.product.name}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const categories = Array.isArray(settings.categories) ? settings.categories : [];
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    if (!allLoaded || !settings.bannerActive || settings.banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % settings.banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [allLoaded, settings.bannerActive, settings.banners.length]);

  const goToBanner = (index: number) => setCurrentBanner(index);
  const prevBanner = () => setCurrentBanner(prev => (prev - 1 + settings.banners.length) % settings.banners.length);
  const nextBanner = () => setCurrentBanner(prev => (prev + 1) % settings.banners.length);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'a-z') return a.name.localeCompare(b.name);
    return b.id.localeCompare(a.id);
  });

  const scrollToCatalog = () => {
    document.getElementById('catalogo-produtos')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white font-sans pb-32 sm:pb-0">
      {/* Header */}
      <header className="bg-dark border-b border-dark-light sticky top-0 z-30 safe-top">
        <div className={`max-w-7xl mx-auto px-3 sm:px-8 lg:px-12 transition-all duration-300 ${isScrolled ? 'py-1.5' : 'py-2 sm:py-0 sm:h-24'} flex flex-col sm:flex-row items-center gap-2 sm:gap-4 relative overflow-visible`}>
          
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              {!allLoaded ? (
                <div className="w-28 h-7 sm:w-32 sm:h-8 bg-dark-lighter rounded-lg animate-pulse" />
              ) : (
                <>
                  {settings.logo && (
                    <img src={settings.logo} alt="Logo" className={`w-auto object-contain transition-all duration-300 ${isScrolled ? 'h-7' : 'h-8 sm:h-16'}`} />
                  )}
                  {settings.showName !== false && (
                    <h1 className={`font-extrabold text-primary tracking-tight whitespace-nowrap truncate max-w-[40vw] sm:max-w-none transition-all duration-300 ${isScrolled ? 'text-sm' : 'text-base sm:text-2xl'}`}>{settings.name}</h1>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-1 sm:hidden">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 text-gray-300 hover:text-white rounded-xl transition-all duration-300 active:scale-95"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-dark">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search - colapsa no scroll em mobile */}
          <div className={`w-full sm:flex-1 sm:max-w-md overflow-hidden transition-all duration-300 ${
            isScrolled 
              ? 'max-h-0 opacity-0 pb-0 sm:max-h-12 sm:opacity-100 sm:pb-0' 
              : 'max-h-12 opacity-100'
          }`}>
            {!allLoaded ? (
              <div className="h-9 sm:h-10 bg-dark-lighter rounded-xl animate-pulse" />
            ) : (
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
                <input 
                  type="text" 
                  placeholder="Buscar produtos..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 bg-dark-lighter border border-dark-light text-white rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-300 placeholder-gray-500 text-[16px] sm:text-sm"
                />
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {allLoaded && (settings.heroTitle || settings.heroSubtitle) && (
              <div className="max-w-[240px]">
                {settings.heroTitle && (
                  <p className="text-white text-sm font-bold leading-tight truncate">{settings.heroTitle}</p>
                )}
                {settings.heroSubtitle && (
                  <p className="text-gray-400 text-xs leading-tight truncate mt-0.5">{settings.heroSubtitle}</p>
                )}
              </div>
            )}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 text-gray-300 hover:text-white hover:bg-dark-lighter rounded-xl transition-all duration-300"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-dark">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Banner - Carrossel */}
      {allLoaded && settings.bannerActive && settings.banners.length > 0 && (
        <section className="relative w-full h-[180px] sm:h-[480px] lg:h-[560px] overflow-hidden bg-dark group">
          <div className="absolute inset-0">
            <div
              className="flex h-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentBanner * 100}%)` }}
            >
              {settings.banners.map((banner, i) => (
                <div key={i} className="min-w-full h-full relative flex-shrink-0">
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${banner.imageUrl})` }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(90deg, rgba(0,0,0,.15), rgba(0,0,0,.05), rgba(0,0,0,.15))' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {settings.banners.length > 1 && (
            <>
              <button onClick={prevBanner} className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextBanner} className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-2.5 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2.5">
                {settings.banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToBanner(i)}
                    className={`h-1.5 sm:h-3 rounded-full transition-all duration-300 ${i === currentBanner ? 'bg-primary w-4 sm:w-8' : 'bg-white/40 hover:bg-white/70 w-1.5 sm:w-3'}`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-32 bg-gradient-to-b from-transparent to-white pointer-events-none z-20" />
        </section>
      )}

      {/* Info Cards */}
      {allLoaded && settings.bannerInfoItems && settings.bannerInfoItems.length > 0 && (
        <section className="relative z-30 -mt-[24px] sm:-mt-[100px] lg:-mt-[120px] pb-5 sm:pb-10 pointer-events-none">
          <div className="max-w-[1400px] mx-auto px-3 sm:px-8 lg:px-12 pointer-events-auto">
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 snap-x snap-mandatory scrollbar-none [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden justify-start lg:justify-center">
              {settings.bannerInfoItems.slice(0, 6).concat(
                settings.bannerInfoItems.length > 6
                  ? [{ text: `+${settings.bannerInfoItems.length - 6} mais`, icon: 'Sparkles' }]
                  : []
              ).map((item, i) => {
                const hasImage = !!item.imageUrl;
                const iconName = item.icon || 'Truck';
                const IconComponent = ICON_MAP[iconName];
                const title = item.title || (ICON_TITLES[iconName] || 'Diferencial');
                const promoId = `promo-${i}`;
                const handleAddPromo = () => {
                  if (!item.price) return;
                  const promoProduct: Product = {
                    id: promoId,
                    name: title,
                    description: item.text || '',
                    price: item.price,
                    oldPrice: item.oldPrice,
                    image: item.imageUrl || '',
                    sizes: ['Único'],
                    colors: ['Padrão'],
                  };
                  handleAddToCart({
                    id: `${promoId}-Único-Padrão`,
                    product: promoProduct,
                    quantity: 1,
                    size: 'Único',
                    color: 'Padrão',
                  });
                };
                return (
                  <div
                    key={i}
                    className={`snap-start shrink-0 bg-white rounded-xl sm:rounded-2xl border border-[rgba(0,0,0,0.05)] flex flex-col shadow-[0_10px_25px_rgba(0,0,0,0.08)] sm:hover:-translate-y-2 sm:hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-300 pointer-events-auto active:scale-[0.98] ${hasImage ? 'w-[85vw] sm:w-[260px] h-auto' : 'w-[42vw] sm:w-[200px] min-h-[200px] sm:min-h-[260px]'}`}
                  >
                    {hasImage ? (
                      <>
                        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-xl sm:rounded-t-2xl bg-bg-light">
                          <img src={item.imageUrl} className="w-full h-full object-cover" alt="" loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          {item.oldPrice && item.price && (
                            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md">
                              -{Math.round((1 - item.price / item.oldPrice) * 100)}%
                            </div>
                          )}
                        </div>
                        <div className="p-3 sm:p-4 flex flex-col items-center text-center flex-1">
                          <h3 className="text-sm sm:text-base font-bold text-text-primary mb-1 leading-tight">{title}</h3>
                          {item.text && <p className="text-[11px] sm:text-xs text-text-secondary leading-relaxed mb-2 sm:mb-3 line-clamp-2">{item.text}</p>}
                          {item.price && (
                            <div className="mb-2 sm:mb-3">
                              <p className="text-lg sm:text-xl font-bold text-primary">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                              {item.oldPrice && (
                                <p className="text-[11px] sm:text-xs text-text-secondary line-through">R$ {item.oldPrice.toFixed(2).replace('.', ',')}</p>
                              )}
                            </div>
                          )}
                          <button
                            onClick={handleAddPromo}
                            className="mt-auto w-full py-2 sm:py-2.5 bg-primary text-white text-[11px] sm:text-xs font-medium rounded-lg sm:rounded-xl hover:bg-primary-hover transition-all duration-300 active:scale-95"
                          >
                            Adicionar ao Carrinho
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 sm:p-5 flex flex-col items-center text-center flex-1 h-full">
                        <h3 className="text-lg sm:text-[22px] font-semibold text-text-primary mb-2 sm:mb-3 leading-tight">{title}</h3>
                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center mb-2 sm:mb-3">
                          {IconComponent ? <IconComponent className="w-5 h-5 sm:w-7 sm:h-7 text-primary" /> : <Truck className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />}
                        </div>
                        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed flex-1">{item.text}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Produtos */}
      <main id="catalogo-produtos" className="max-w-7xl mx-auto px-3 sm:px-8 lg:px-12 py-6 sm:py-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-10">
          <h2 className="text-xl sm:text-3xl font-bold text-text-primary tracking-tight">Catálogo de Meias</h2>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 bg-bg-light border border-bg-medium rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-text-primary font-medium transition-all duration-300 text-sm"
          >
            <option value="newest">Lançamentos</option>
            <option value="price-asc">Menor Preço</option>
            <option value="price-desc">Maior Preço</option>
            <option value="a-z">A - Z</option>
          </select>
        </div>

        {allLoaded && categories.length > 0 && (
          <div className="flex overflow-x-auto gap-2 sm:gap-3 pb-3 mb-5 sm:mb-8 -mx-3 px-3 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`whitespace-nowrap px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 border ${selectedCategory === null ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-white text-text-secondary border-bg-medium hover:border-primary hover:text-primary'}`}
            >
              Todos
            </button>
            {categories.map(category => (
              <button 
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 border ${selectedCategory === category ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-white text-text-secondary border-bg-medium hover:border-primary hover:text-primary'}`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
        
        {!allLoaded ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="flex flex-col bg-white rounded-xl shadow-sm border border-bg-medium overflow-hidden animate-pulse">
                <div className="aspect-square bg-bg-medium" />
                <div className="p-3 sm:p-5">
                  <div className="h-4 sm:h-5 bg-bg-medium rounded w-3/4 mb-2 sm:mb-3" />
                  <div className="h-3 sm:h-4 bg-bg-medium rounded w-full mb-1 sm:mb-2" />
                  <div className="h-3 sm:h-4 bg-bg-medium rounded w-2/3 mb-3 sm:mb-4" />
                  <div className="h-9 sm:h-11 bg-bg-medium rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 sm:py-24 bg-bg-light rounded-2xl border border-bg-medium flex flex-col items-center justify-center px-6">
            <Search className="w-12 h-12 sm:w-16 sm:h-16 text-text-secondary/30 mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
              {searchQuery ? 'Nenhum resultado para sua busca' : 'Nenhum produto nesta categoria'}
            </h3>
            <p className="text-text-secondary text-sm sm:text-base mb-6 sm:mb-8 text-center max-w-sm">
              {searchQuery 
                ? `Nenhum produto encontrado para "${searchQuery}". Tente outro termo.`
                : 'Não há produtos disponíveis nesta categoria no momento.'}
            </p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory(null); }} 
              className="bg-primary hover:bg-primary-hover text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-medium transition-all duration-300 shadow-md shadow-primary/20 active:scale-95"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart} 
                onView={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Rodapé */}
      <footer className="bg-dark text-gray-400 py-8 sm:py-14 mt-8 sm:mt-20 border-t border-dark-light">
        <div className="max-w-7xl mx-auto px-3 sm:px-8 lg:px-12 flex flex-col md:flex-row justify-between items-center md:items-start gap-8 sm:gap-10 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start md:max-w-sm">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              {!allLoaded ? (
                <div className="w-28 h-5 sm:w-32 sm:h-6 bg-dark-lighter rounded-lg animate-pulse" />
              ) : (
                <>
                  {settings.logo && (
                    <img src={settings.logo} alt="Logo" className="h-10 sm:h-20 w-auto object-contain" />
                  )}
                  {settings.showName !== false && (
                    <h4 className="text-lg sm:text-3xl font-extrabold text-primary tracking-tight z-10">{settings.name}</h4>
                  )}
                </>
              )}
            </div>
            {!allLoaded ? (
              <div className="h-3 sm:h-4 w-40 sm:w-48 bg-dark-lighter rounded animate-pulse" />
            ) : (
              <p className="text-xs sm:text-sm leading-relaxed">{settings.footerDescription}</p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 md:mt-4">
            <div>
              <h4 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">Contato</h4>
              {!allLoaded ? (
                <>
                  <div className="h-3 sm:h-4 w-32 sm:w-36 bg-dark-lighter rounded animate-pulse mb-3" />
                  <div className="flex gap-3 sm:gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="w-4 h-4 sm:w-5 sm:h-5 bg-dark-lighter rounded animate-pulse" />)}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">WhatsApp: {settings.whatsapp.replace(/(\d{2})(\d{2})(\d{4,5})(\d{4})/, '+$1 ($2) $3-$4')}</p>
                  {(settings.instagramUrl || settings.facebookUrl || settings.tiktokUrl) && (
                    <div className="flex gap-3 sm:gap-4 items-center justify-center sm:justify-start">
                      {settings.instagramUrl && (
                        <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors duration-300" title="Instagram">
                          <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                        </a>
                      )}
                      {settings.facebookUrl && (
                        <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors duration-300" title="Facebook">
                          <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                        </a>
                      )}
                      {settings.tiktokUrl && (
                        <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors duration-300" title="TikTok">
                          <Music2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </a>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            <div>
              <h4 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">Informações</h4>
              {!allLoaded ? (
                <>
                  <div className="h-3 sm:h-4 w-32 sm:w-40 bg-dark-lighter rounded animate-pulse mb-1" />
                  <div className="h-3 sm:h-4 w-28 sm:w-32 bg-dark-lighter rounded animate-pulse" />
                </>
              ) : (
                <>
                  {settings.footerInfo1 && <p className="text-xs sm:text-sm mb-1 sm:mb-2 leading-relaxed">{settings.footerInfo1}</p>}
                  {settings.footerInfo2 && <p className="text-xs sm:text-sm mb-1 sm:mb-2 leading-relaxed">{settings.footerInfo2}</p>}
                  {settings.footerInfo3 && <p className="text-xs sm:text-sm leading-relaxed">{settings.footerInfo3}</p>}
                </>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Tab Bar - Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden safe-bottom">
        {/* Cart Summary Strip */}
        <AnimatePresence>
          {cartItemsCount > 0 && (
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-primary px-4 py-2 flex items-center justify-between"
            >
              <p className="text-white text-xs font-medium">
                <span className="font-bold">{cartItemsCount}</span> {cartItemsCount === 1 ? 'item' : 'itens'} · <span className="font-bold">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
              </p>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg active:scale-95 transition-transform"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Ver Carrinho
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Bar */}
        <div className="bg-white border-t border-bg-medium shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-stretch">
          <button
            onClick={scrollToTop}
            className="flex-1 flex flex-col items-center justify-center py-1.5 gap-0 text-[10px] text-text-secondary hover:text-primary transition-colors active:bg-bg-light"
          >
            <Home className="w-5 h-5" />
            <span>Início</span>
          </button>
          <button
            onClick={scrollToCatalog}
            className="flex-1 flex flex-col items-center justify-center py-1.5 gap-0 text-[10px] text-text-secondary hover:text-primary transition-colors active:bg-bg-light"
          >
            <LayoutGrid className="w-5 h-5" />
            <span>Catálogo</span>
          </button>
          {allLoaded && settings.whatsapp && (
            <a
              href={`https://wa.me/${settings.whatsapp}?text=Olá! Estava navegando no catálogo e gostaria de tirar uma dúvida.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex flex-col items-center justify-center py-1.5 gap-0 text-[10px] text-text-secondary hover:text-primary transition-colors active:bg-bg-light"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp</span>
            </a>
          )}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex-1 flex flex-col items-center justify-center py-1.5 gap-0 text-[10px] text-text-secondary hover:text-primary transition-colors active:bg-bg-light relative"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Carrinho</span>
            {cartItemsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                {cartItemsCount > 99 ? '99+' : cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* WhatsApp FAB - Desktop only */}
      {allLoaded && settings.whatsapp && (
        <a 
          href={`https://wa.me/${settings.whatsapp}?text=Olá! Estava navegando no catálogo e gostaria de tirar uma dúvida.`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex fixed bottom-6 right-6 z-40 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-hover hover:scale-110 hover:shadow-xl transition-all duration-300 items-center justify-center group"
          title="Fale Conosco no WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out pl-0 group-hover:pl-2 font-medium text-sm">
            Tirar dúvidas
          </span>
        </a>
      )}

      {/* Voltar ao Topo - Desktop */}
      <AnimatePresence>
        {isScrolled && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="hidden sm:flex fixed bottom-24 right-6 z-40 bg-dark text-white p-3.5 rounded-full shadow-lg hover:bg-dark-lighter transition-all duration-300"
            title="Voltar ao topo"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Toast - topo no mobile, bottom no desktop */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-4 left-1/2 z-50 sm:bottom-6 sm:top-auto bg-dark text-white px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl shadow-2xl flex items-center gap-2 sm:gap-3 border border-dark-light max-w-[calc(100vw-2rem)] break-words"
          >
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
            <span className="font-medium text-sm sm:text-base">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
        clearCart={clearCart}
        settings={settings}
      />
    </div>
  );
}
