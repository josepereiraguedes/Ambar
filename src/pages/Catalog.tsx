import { useState, useEffect } from 'react';
import { ShoppingBag, Search, MessageCircle, ArrowUp, CheckCircle2, Instagram, Facebook, Music2 } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { CartDrawer } from '../components/CartDrawer';
import { ProductModal } from '../components/ProductModal';
import { CartItem, Product } from '../types';
import { useProducts } from '../hooks/useProducts';
import { useSettings } from '../hooks/useSettings';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

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

  // Só renderiza o conteúdo quando AMBOS (produtos e configurações) estiverem prontos
  const allLoaded = productsLoaded && settingsLoaded;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 300);
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
    setSelectedProduct(null); // fecha o modal se estiver aberto
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

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const categories = Array.isArray(settings.categories) ? settings.categories : [];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'a-z') return a.name.localeCompare(b.name);
    // lançamentos (padrão)
    return b.id.localeCompare(a.id);
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans">
      {/* Cabeçalho */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-0 sm:h-24 flex flex-col sm:flex-row items-center justify-between relative overflow-visible">
          
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start z-20">
            <div className="flex items-center gap-2">
              {!allLoaded ? (
                <div className="w-32 h-8 bg-gray-700 rounded-lg animate-pulse" />
              ) : (
                <>
                  {settings.logo && (
                    <img src={settings.logo} alt="Logo" className="h-16 sm:h-20 w-auto object-contain" />
                  )}
                  {settings.showName !== false && (
                    <h1 className="text-xl sm:text-3xl font-extrabold text-orange-500 tracking-tight z-10">{settings.name}</h1>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-2 sm:hidden">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
              >
                <ShoppingBag className="w-6 h-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center translate-x-0 -translate-y-0 shadow-sm border-2 border-gray-900">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 text-center sm:absolute sm:left-1/2 sm:-translate-x-1/2 z-10 w-full sm:w-auto px-2 pointer-events-none">
            {!allLoaded ? (
              <>
                <div className="h-7 w-64 bg-gray-700 rounded-lg animate-pulse mx-auto mb-2" />
                <div className="h-4 w-80 bg-gray-800 rounded-lg animate-pulse mx-auto" />
              </>
            ) : (
              <>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-white tracking-tight mb-1">
                  {settings.heroTitle || 'Catálogo Direto da Fábrica'}
                </h2>
                <p className="text-gray-400 text-sm sm:text-sm lg:text-base max-w-md mx-auto">
                  {settings.heroSubtitle || 'Qualidade premium, preço de atacado. Escolha seus modelos, monte seu carrinho e envie o pedido diretamente para o nosso WhatsApp.'}
                </p>
              </>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 z-20">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center translate-x-0 -translate-y-0 shadow-sm border-2 border-gray-900">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Banner Promocional */}
      {allLoaded && settings.bannerActive && (
        <div className="bg-[#F8F9FA]">
          {settings.bannerImageUrl ? (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <img 
                src={settings.bannerImageUrl} 
                alt={settings.bannerText || "Banner Promocional"} 
                className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-cover rounded-2xl shadow-sm"
              />
            </div>
          ) : settings.bannerText ? (
            <div className="bg-orange-600 text-white px-4 py-2 text-center text-sm font-medium shadow-sm">
              {settings.bannerText}
            </div>
          ) : null}
        </div>
      )}

      {/* Grade de Produtos */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <h3 className="text-2xl font-bold text-gray-900">Catálogo de Meias</h3>
          
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Buscar produtos..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-gray-700 font-medium"
            >
              <option value="newest">Lançamentos</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
              <option value="a-z">A - Z</option>
            </select>
          </div>
        </div>

        {allLoaded && categories.length > 0 && (
          <div className="flex overflow-x-auto gap-2 pb-4 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border ${selectedCategory === null ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
            >
              Todos
            </button>
            {categories.map(category => (
              <button 
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border ${selectedCategory === category ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
        
        {!allLoaded ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-5">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
                  <div className="h-10 bg-gray-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center">
            <Search className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-500 mb-6">Não encontramos produtos correspondentes aos filtros selecionados.</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory(null); }} 
              className="bg-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-700 transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
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
      <footer className="bg-gray-900 text-gray-400 py-6 mt-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center md:items-start gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start md:max-w-sm">
            <div className="flex items-center gap-2 mb-2">
              {!allLoaded ? (
                <div className="w-32 h-6 bg-gray-800 rounded-lg animate-pulse" />
              ) : (
                <>
                  {settings.logo && (
                    <img src={settings.logo} alt="Logo" className="h-16 sm:h-20 w-auto object-contain" />
                  )}
                  {settings.showName !== false && (
                    <h4 className="text-xl sm:text-3xl font-extrabold text-orange-500 tracking-tight z-10">{settings.name}</h4>
                  )}
                </>
              )}
            </div>
            {!allLoaded ? (
              <div className="h-4 w-48 bg-gray-800 rounded animate-pulse" />
            ) : (
              <p className="text-sm">{settings.footerDescription}</p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 md:mt-4">
            <div>
              <h4 className="text-white font-bold text-lg mb-2">Contato</h4>
              {!allLoaded ? (
                <>
                  <div className="h-4 w-36 bg-gray-800 rounded animate-pulse mb-3" />
                  <div className="flex gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="w-5 h-5 bg-gray-800 rounded animate-pulse" />)}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm mb-3">WhatsApp: {settings.whatsapp.replace(/(\d{2})(\d{2})(\d{4,5})(\d{4})/, '+$1 ($2) $3-$4')}</p>
                  {(settings.instagramUrl || settings.facebookUrl || settings.tiktokUrl) && (
                    <div className="flex gap-4 items-center justify-center sm:justify-start">
                      {settings.instagramUrl && (
                        <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Instagram">
                          <Instagram className="w-5 h-5" />
                        </a>
                      )}
                      {settings.facebookUrl && (
                        <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="Facebook">
                          <Facebook className="w-5 h-5" />
                        </a>
                      )}
                      {settings.tiktokUrl && (
                        <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="TikTok">
                          <Music2 className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            <div>
              <h4 className="text-white font-bold text-lg mb-2">Informações</h4>
              {!allLoaded ? (
                <>
                  <div className="h-4 w-40 bg-gray-800 rounded animate-pulse mb-1" />
                  <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
                </>
              ) : (
                <>
                  {settings.footerInfo1 && <p className="text-sm mb-1">{settings.footerInfo1}</p>}
                  {settings.footerInfo2 && <p className="text-sm">{settings.footerInfo2}</p>}
                </>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Botão Flutuante do WhatsApp */}
      {allLoaded && settings.whatsapp && (
        <a 
          href={`https://wa.me/${settings.whatsapp}?text=Olá! Estava navegando no catálogo e gostaria de tirar uma dúvida.`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          title="Fale Conosco no WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out pl-0 group-hover:pl-2 font-medium">
            Tirar dúvidas
          </span>
        </a>
      )}

      {/* Voltar ao Topo */}
      <AnimatePresence>
        {isScrolled && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-6 z-40 bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
            title="Voltar ao topo"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Notificação Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-800 max-w-[calc(100vw-2rem)] break-words"
          >
            <CheckCircle2 className="w-5 h-5 text-[#25D366]" />
            <span className="font-medium">{toastMessage}</span>
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
        settings={settings}
      />
    </div>
  );
}
