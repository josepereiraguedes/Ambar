import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { X, Plus, Edit2, Trash2, Image as ImageIcon, Upload, CheckCircle2, AlertCircle, Loader2, Truck, Clock, Shield, Package, CreditCard, Heart, Star, ThumbsUp, Sparkles, Lock, Store, Phone, MapPin, Headphones, BadgeCheck } from 'lucide-react';
import { Product } from '../types';
import { uploadImage } from '../lib/storage';
import { BannerInfoItem, StoreSettings } from '../hooks/useSettings';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAdd: (p: Product) => void;
  onUpdate: (p: Product) => void;
  onRemove: (id: string) => void;
  settings: StoreSettings;
  onUpdateSettings: (s: StoreSettings) => Promise<void>;
}

export function AdminPanel({ isOpen, onClose, products, onAdd, onUpdate, onRemove, settings, onUpdateSettings }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'settings'>('products');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    oldPrice: '',
    image: '',
    sizes: '',
    colors: '',
    category: ''
  });

  const [settingsFormData, setSettingsFormData] = useState(() => ({
    ...settings,
    categories: Array.isArray(settings.categories) ? settings.categories : [],
  }));
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newBannerInfoText, setNewBannerInfoText] = useState('');
  const [newBannerInfoIcon, setNewBannerInfoIcon] = useState('Truck');
  const [newBannerInfoImage, setNewBannerInfoImage] = useState('');
  const [newBannerInfoPrice, setNewBannerInfoPrice] = useState('');
  const [newBannerInfoOldPrice, setNewBannerInfoOldPrice] = useState('');
  const [newBannerInfoTitle, setNewBannerInfoTitle] = useState('');
  const [isPromoCard, setIsPromoCard] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  useEffect(() => {
    setSettingsFormData({
      ...settings,
      categories: Array.isArray(settings.categories) ? settings.categories : [],
    });
  }, [settings]);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const bannerInfoImageInputRef = useRef<HTMLInputElement>(null);

  const cats = (): string[] => Array.isArray(settingsFormData.categories) ? settingsFormData.categories : [];

  const addCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (cats().includes(trimmed)) return;
    setSettingsFormData(prev => ({
      ...prev,
      categories: [...(Array.isArray(prev.categories) ? prev.categories : []), trimmed],
    }));
    setNewCategory('');
  };

  const removeCategory = (cat: string) => {
    setSettingsFormData(prev => ({
      ...prev,
      categories: (Array.isArray(prev.categories) ? prev.categories : []).filter(c => c !== cat),
    }));
  };

  const processImage = (file: File, maxWidth: number, maxHeight: number, format: string, quality: number): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas);
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleBannerUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const canvas = await processImage(file, 1600, 800, 'jpeg', 0.8);
      const url = await uploadImage(canvas, 'banners', 0.8);
      const imageUrl = url || canvas.toDataURL('image/jpeg', 0.8);
      setSettingsFormData(prev => ({
        ...prev,
        banners: [...(prev.banners || []), { imageUrl }],
      }));
      if (e.target) e.target.value = '';
    } catch (err) {
      console.error('Erro ao processar banner:', err);
    }
  };

  const handleBannerInfoImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const canvas = await processImage(file, 600, 600, 'jpeg', 0.7);
      const url = await uploadImage(canvas, 'banners', 0.7);
      setNewBannerInfoImage(url || canvas.toDataURL('image/jpeg', 0.7));
      if (e.target) e.target.value = '';
    } catch (err) {
      console.error('Erro ao processar imagem do card:', err);
    }
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const canvas = await processImage(file, 400, 400, 'png', 0.9);
      const url = await uploadImage(canvas, 'logos', 0.9);
      if (url) {
        setSettingsFormData(prev => ({ ...prev, logo: url }));
      } else {
        const dataUrl = canvas.toDataURL('image/png');
        setSettingsFormData(prev => ({ ...prev, logo: dataUrl }));
      }
    } catch (err) {
      console.error('Erro ao processar logo:', err);
    }
  };

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setSettingsError(null);
    setIsSavingSettings(true);
    try {
      await onUpdateSettings(settingsFormData);
      setSettingsError(null);
      setToast({ message: 'Configurações salvas com sucesso!', type: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setSettingsError(msg);
      setToast({ message: 'Erro ao salvar configurações', type: 'error' });
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (!isOpen) return null;

  const handleOpenForm = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        oldPrice: product.oldPrice?.toString() || '',
        image: product.image,
        sizes: product.sizes.join(', '),
        colors: product.colors.join(', '),
        category: product.category || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', description: '', price: '', oldPrice: '', image: '', sizes: '', colors: '', category: ''
      });
    }
    setIsFormOpen(true);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const canvas = await processImage(file, 800, 800, 'jpeg', 0.7);
      const url = await uploadImage(canvas, 'products', 0.7);
      if (url) {
        setFormData(prev => ({ ...prev, image: url }));
      } else {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setFormData(prev => ({ ...prev, image: dataUrl }));
      }
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmittingProduct(true);

    const parsedOldPrice = parseFloat(formData.oldPrice.replace(',', '.'));
    const imageUrl = formData.image || 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=800&q=80';

    const newProduct: Product = {
      id: editingId || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price.replace(',', '.')) || 0,
      oldPrice: isNaN(parsedOldPrice) || parsedOldPrice <= 0 ? undefined : parsedOldPrice,
      image: imageUrl,
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
      colors: formData.colors.split(',').map(c => c.trim()).filter(Boolean),
      category: formData.category,
    };

    if (newProduct.sizes.length === 0) newProduct.sizes = ['Único'];
    if (newProduct.colors.length === 0) newProduct.colors = ['Padrão'];

    try {
      if (editingId) {
        await onUpdate(newProduct);
      } else {
        await onAdd(newProduct);
      }
      setToast({ message: editingId ? 'Produto atualizado com sucesso!' : 'Produto adicionado com sucesso!', type: 'success' });
      setIsFormOpen(false);
    } catch {
      setToast({ message: 'Erro ao salvar produto', type: 'error' });
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const ICON_OPTIONS = ['Truck', 'Clock', 'Shield', 'Package', 'CreditCard', 'Heart', 'Star', 'ThumbsUp', 'Sparkles', 'Lock', 'Store', 'Phone', 'MapPin', 'Headphones', 'BadgeCheck'];

  const renderIconPreview = (iconName: string | undefined) => {
    const icons: Record<string, React.FC<{ className?: string }>> = { Truck, Clock, Shield, Package, CreditCard, Heart, Star, ThumbsUp, Sparkles, Lock, Store, Phone, MapPin, Headphones, BadgeCheck };
    const Icon = icons[iconName || 'Truck'];
    return Icon ? <Icon className="w-5 h-5" /> : <Truck className="w-5 h-5" />;
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white py-4 border-b border-bg-light z-10">
          <h2 className="text-2xl font-bold text-text-primary">Gerenciar</h2>
          <button onClick={onClose} className="p-2.5 bg-bg-light hover:bg-bg-medium rounded-xl transition-all duration-300">
            <X className="w-6 h-6 text-text-primary" />
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => { setActiveTab('products'); setIsFormOpen(false); }}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${activeTab === 'products' ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'bg-bg-light text-text-secondary hover:bg-bg-medium'}`}
          >
            Catálogo de Produtos
          </button>
          <button 
            onClick={() => { setActiveTab('settings'); setSettingsFormData({ ...settings, categories: Array.isArray(settings.categories) ? settings.categories : [] }); }}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${activeTab === 'settings' ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'bg-bg-light text-text-secondary hover:bg-bg-medium'}`}
          >
            Configurações da Loja
          </button>
        </div>

        {activeTab === 'settings' ? (
          <form onSubmit={handleSaveSettings} className="bg-bg-light p-6 sm:p-8 rounded-2xl border border-bg-medium shadow-sm">
            <h3 className="text-xl font-bold text-text-primary mb-6">Configurações da Loja</h3>
            
            {settingsError && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <p className="font-semibold mb-1">Erro ao salvar:</p>
                <p>{settingsError}</p>
                <p className="mt-2 text-xs text-red-500">
                  ⚠ Pode ser necessário criar a coluna <code className="bg-red-100 px-1 rounded">categories</code> na tabela <code className="bg-red-100 px-1 rounded">store_settings</code> do Supabase.
                  Abra o SQL Editor do Supabase e execute o arquivo <strong>supabase-migration.sql</strong>.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">Nome da Loja/Fábrica</label>
                <input required type="text" value={settingsFormData.name} onChange={e => setSettingsFormData({...settingsFormData, name: e.target.value})} className="w-full p-2.5 bg-white text-text-primary border border-bg-medium rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all duration-300" placeholder="Ex: Ambar" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">Número do WhatsApp</label>
                <input required type="text" value={settingsFormData.whatsapp} onChange={e => setSettingsFormData({...settingsFormData, whatsapp: e.target.value})} className="w-full p-2.5 bg-white text-text-primary border border-bg-medium rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all duration-300" placeholder="5511999999999" />
                <p className="text-xs text-text-secondary mt-1">Coloque o Código do País (55) + DDD + Número. Apenas números.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">Logo da Loja</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {settingsFormData.logo ? (
                    <div className="w-24 h-24 rounded-xl overflow-hidden border border-bg-medium shrink-0 bg-white relative group flex items-center justify-center p-2">
                      <img src={settingsFormData.logo} className="w-full h-full object-contain" alt="Pré-visualização da Logo" />
                      <button 
                        type="button"
                        onClick={() => setSettingsFormData({...settingsFormData, logo: ''})}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-xl border-2 border-dashed border-bg-medium flex items-center justify-center text-text-secondary shrink-0 bg-white p-2">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*"
                      ref={logoInputRef}
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button 
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white border border-bg-medium rounded-xl text-sm font-medium text-text-primary hover:bg-bg-light transition-all duration-300 mb-2"
                    >
                      <Upload className="w-4 h-4" />
                      Fazer Upload da Logo
                    </button>
                    <p className="text-xs text-text-secondary">Ou cole a URL da logo abaixo:</p>
                    <input type="url" value={settingsFormData.logo} onChange={e => setSettingsFormData({...settingsFormData, logo: e.target.value})} className="w-full mt-1 p-2 bg-white text-text-primary border border-bg-medium rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all duration-300 text-sm" placeholder="https://..." />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="showName" 
                  checked={settingsFormData.showName !== false} 
                  onChange={e => setSettingsFormData({...settingsFormData, showName: e.target.checked})}
                  className="w-4 h-4 text-primary focus:ring-primary border-bg-medium rounded"
                />
                <label htmlFor="showName" className="text-sm font-medium text-text-primary">
                  Mostrar nome da loja ao lado da logo no cabeçalho
                </label>
              </div>

              <div className="pt-4 border-t border-bg-medium mt-2">
                <h4 className="text-sm font-bold text-text-primary mb-4">Textos Iniciais</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1">Título Principal</label>
                    <input type="text" value={settingsFormData.heroTitle || ''} onChange={e => setSettingsFormData({...settingsFormData, heroTitle: e.target.value})} className="w-full p-2.5 bg-white text-text-primary border border-bg-medium rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all duration-300" placeholder="Catálogo Direto da Fábrica" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1">Subtítulo (Texto de apresentação)</label>
                    <textarea value={settingsFormData.heroSubtitle || ''} onChange={e => setSettingsFormData({...settingsFormData, heroSubtitle: e.target.value})} className="w-full p-2.5 bg-white text-text-primary border border-bg-medium rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all duration-300 min-h-[80px]" placeholder="Qualidade premium..." />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-bg-medium mt-2">
                <h4 className="text-sm font-bold text-text-primary mb-4">Configurações do Rodapé</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1">Descrição do Rodapé</label>
                    <input type="text" value={settingsFormData.footerDescription || ''} onChange={e => setSettingsFormData({...settingsFormData, footerDescription: e.target.value})} className="w-full p-2.5 bg-white text-text-primary border border-bg-medium rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all duration-300" placeholder="Especialistas em meias..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1">Informação 1</label>
                    <input type="text" value={settingsFormData.footerInfo1 || ''} onChange={e => setSettingsFormData({...settingsFormData, footerInfo1: e.target.value})} className="w-full p-2.5 bg-white text-text-primary border border-bg-medium rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all duration-300" placeholder="Enviamos para todo o Brasil." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1">Informação 2</label>
                    <input type="text" value={settingsFormData.footerInfo2 || ''} onChange={e => setSettingsFormData({...settingsFormData, footerInfo2: e.target.value})} className="w-full p-2.5 bg-white text-text-primary border border-bg-medium rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all duration-300" placeholder="Atendimento de Seg a Sex." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1">Informação 3</label>
                    <input type="text" value={settingsFormData.footerInfo3 || ''} onChange={e => setSettingsFormData({...settingsFormData, footerInfo3: e.target.value})} className="w-full p-2.5 bg-white text-text-primary border border-bg-medium rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all duration-300" placeholder="Pagamento via PIX, cartão e boleto." />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-bg-medium mt-2">
                <h4 className="text-sm font-bold text-text-primary mb-4">Redes Sociais (Opcional)</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1">Instagram (URL)</label>
                    <input type="url" value={settingsFormData.instagramUrl || ''} onChange={e => setSettingsFormData({...settingsFormData, instagramUrl: e.target.value})} className="w-full p-2 bg-white text-text-primary border border-bg-medium rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all duration-300 text-sm" placeholder="https://instagram.com/..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1">Facebook (URL)</label>
                    <input type="url" value={settingsFormData.facebookUrl || ''} onChange={e => setSettingsFormData({...settingsFormData, facebookUrl: e.target.value})} className="w-full p-2 bg-white text-text-primary border border-bg-medium rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all duration-300 text-sm" placeholder="https://facebook.com/..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1">TikTok (URL)</label>
                    <input type="url" value={settingsFormData.tiktokUrl || ''} onChange={e => setSettingsFormData({...settingsFormData, tiktokUrl: e.target.value})} className="w-full p-2 bg-white text-text-primary border border-bg-medium rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all duration-300 text-sm" placeholder="https://tiktok.com/..." />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-bg-medium mt-2">
                <h4 className="text-sm font-bold text-text-primary mb-4">Categorias de Produtos</h4>
                <p className="text-xs text-text-secondary mb-3">Gerencie as categorias disponíveis para classificar os produtos do catálogo.</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(Array.isArray(settingsFormData.categories) ? settingsFormData.categories : []).map(cat => (
                    <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-bg-medium rounded-xl text-sm font-medium text-text-primary">
                      {cat}
                      <button
                        type="button"
                        onClick={() => removeCategory(cat)}
                        className="text-text-secondary hover:text-red-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }}
                    placeholder="Nova categoria..."
                    className="flex-1 p-2 bg-white text-text-primary border border-bg-medium rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all duration-300 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addCategory}
                    className="flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-bg-medium mt-2">
                <h4 className="text-sm font-bold text-text-primary mb-4">Carrossel de Banners</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="bannerActive" 
                      checked={settingsFormData.bannerActive || false} 
                      onChange={e => setSettingsFormData({...settingsFormData, bannerActive: e.target.checked})}
                      className="w-4 h-4 text-primary focus:ring-primary border-bg-medium rounded"
                    />
                    <label htmlFor="bannerActive" className="text-sm font-medium text-text-primary">
                      Exibir carrossel de banners no topo
                    </label>
                  </div>
                  {settingsFormData.bannerActive && (
                    <div className="space-y-4">
                      {settingsFormData.banners && settingsFormData.banners.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {settingsFormData.banners.map((banner, i) => (
                            <div key={i} className="relative bg-white rounded-xl border border-bg-medium overflow-hidden group">
                              <div className="aspect-video bg-bg-light">
                                <img src={banner.imageUrl} className="w-full h-full object-cover" alt="" />
                              </div>
                              <div className="p-3 flex items-center justify-end">
                                <button
                                  type="button"
                                  onClick={() => setSettingsFormData(prev => ({
                                    ...prev,
                                    banners: (prev.banners || []).filter((_, j) => j !== i),
                                  }))}
                                  className="p-1.5 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="bg-white rounded-xl border border-dashed border-bg-medium p-4">
                        <p className="text-sm font-semibold text-text-primary mb-3">Adicionar Novo Banner</p>
                        <div className="flex gap-2">
                          <input 
                            type="file" 
                            accept="image/*"
                            ref={bannerInputRef}
                            onChange={handleBannerUpload}
                            className="hidden"
                          />
                          <button 
                            type="button"
                            onClick={() => bannerInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-bg-medium rounded-xl text-sm font-medium text-text-primary hover:bg-bg-light transition-all duration-300"
                          >
                            <Upload className="w-4 h-4" />
                            Adicionar Imagem
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-bg-medium mt-2">
                <h4 className="text-sm font-bold text-text-primary mb-4">Cards Abaixo do Banner</h4>
                <p className="text-xs text-text-secondary mb-4">Até exibir 6 cards na página, com carrossel horizontal se houver mais.</p>
                {settingsFormData.bannerInfoItems && settingsFormData.bannerInfoItems.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {settingsFormData.bannerInfoItems.map((item, i) => (
                      <div key={i} className="relative bg-white rounded-xl border border-bg-medium overflow-hidden group">
                        {item.imageUrl ? (
                          <div className="aspect-[2/1] bg-bg-light overflow-hidden">
                            <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                          </div>
                        ) : (
                          <div className="p-4 pb-0">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              {renderIconPreview(item.icon)}
                            </div>
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-text-primary truncate">{item.title || item.text}</p>
                              {item.imageUrl ? (
                                <>
                                  {item.title && <p className="text-xs text-text-secondary truncate">{item.text}</p>}
                                  {item.price && (
                                    <p className="text-xs font-bold text-primary mt-1">
                                      {item.oldPrice && <span className="line-through text-text-secondary mr-1">R$ {item.oldPrice.toFixed(2).replace('.', ',')}</span>}
                                      R$ {item.price.toFixed(2).replace('.', ',')}
                                    </p>
                                  )}
                                </>
                              ) : (
                                <p className="text-xs text-text-secondary">Ícone: {item.icon}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => setSettingsFormData(prev => ({
                                ...prev,
                                bannerInfoItems: (prev.bannerInfoItems || []).filter((_, j) => j !== i),
                              }))}
                              className="p-1.5 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="bg-white rounded-xl border border-dashed border-bg-medium p-4">
                  {!isPromoCard && (
                    <div className="mb-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPromoCard(true)}
                        className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-hover transition-all duration-200"
                      >
                        Criar Card Promocional
                      </button>
                      <span className="text-xs text-text-secondary">(com imagem e preço)</span>
                    </div>
                  )}
                  {isPromoCard && (
                    <div className="mb-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPromoCard(false)}
                        className="px-3 py-1.5 bg-bg-medium text-text-primary rounded-lg text-xs font-medium hover:bg-bg-medium transition-all duration-200"
                      >
                        Criar Card Informativo
                      </button>
                      <span className="text-xs text-text-secondary">(com ícone)</span>
                    </div>
                  )}
                  <p className="text-sm font-semibold text-text-primary mb-3">
                    {isPromoCard ? 'Novo Card Promocional' : 'Novo Card Informativo'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    {isPromoCard ? (
                      <>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-text-secondary mb-1">Imagem *</label>
                          <div className="flex items-center gap-3">
                            {newBannerInfoImage ? (
                              <div className="w-20 h-14 rounded-lg overflow-hidden border border-bg-medium shrink-0 relative group">
                                <img src={newBannerInfoImage} className="w-full h-full object-cover" alt="" />
                                <button
                                  type="button"
                                  onClick={() => setNewBannerInfoImage('')}
                                  className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="w-20 h-14 rounded-lg border-2 border-dashed border-bg-medium flex items-center justify-center text-text-secondary shrink-0">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              ref={bannerInfoImageInputRef}
                              onChange={handleBannerInfoImageUpload}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => bannerInfoImageInputRef.current?.click()}
                              className="px-3 py-2 bg-white border border-bg-medium rounded-lg text-xs font-medium text-text-primary hover:bg-bg-light transition-all duration-300"
                            >
                              <Upload className="w-3.5 h-3.5 inline-block mr-1" />
                              Upload
                            </button>
                            <input
                              type="url"
                              value={newBannerInfoImage}
                              onChange={e => setNewBannerInfoImage(e.target.value)}
                              placeholder="Ou URL da imagem..."
                              className="flex-1 p-2 bg-white text-text-primary border border-bg-medium rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all duration-300 text-sm"
                            />
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-text-secondary mb-1">Título do Card *</label>
                          <input
                            type="text"
                            value={newBannerInfoTitle}
                            onChange={e => setNewBannerInfoTitle(e.target.value)}
                            className="w-full p-2 bg-white text-text-primary border border-bg-medium rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all duration-300 text-sm"
                            placeholder="Ex: Promoção Relâmpago"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-text-secondary mb-1">Descrição</label>
                          <input
                            type="text"
                            value={newBannerInfoText}
                            onChange={e => setNewBannerInfoText(e.target.value)}
                            className="w-full p-2 bg-white text-text-primary border border-bg-medium rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all duration-300 text-sm"
                            placeholder="Ex: Aproveite 20% off em todos os modelos"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-text-secondary mb-1">Preço promocional (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={newBannerInfoPrice}
                            onChange={e => setNewBannerInfoPrice(e.target.value)}
                            className="w-full p-2 bg-white text-text-primary border border-bg-medium rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all duration-300 text-sm"
                            placeholder="79.90"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-text-secondary mb-1">Preço antigo (R$) (opcional)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={newBannerInfoOldPrice}
                            onChange={e => setNewBannerInfoOldPrice(e.target.value)}
                            className="w-full p-2 bg-white text-text-primary border border-bg-medium rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all duration-300 text-sm"
                            placeholder="99.90"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-text-secondary mb-1">Descrição *</label>
                          <input
                            type="text"
                            value={newBannerInfoText}
                            onChange={e => setNewBannerInfoText(e.target.value)}
                            className="w-full p-2 bg-white text-text-primary border border-bg-medium rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all duration-300 text-sm"
                            placeholder="Ex: Frete Grátis acima de R$200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-text-secondary mb-1">Ícone</label>
                          <div className="flex flex-wrap gap-1.5">
                            {ICON_OPTIONS.map(icon => (
                              <button
                                key={icon}
                                type="button"
                                onClick={() => setNewBannerInfoIcon(icon)}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-200 ${
                                  newBannerInfoIcon === icon
                                    ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20'
                                    : 'bg-white text-text-secondary border-bg-medium hover:border-primary hover:text-primary'
                                }`}
                                title={icon}
                              >
                                {renderIconPreview(icon)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const hasValid = isPromoCard
                        ? newBannerInfoImage && newBannerInfoTitle.trim()
                        : newBannerInfoText.trim();
                      if (!hasValid) return;
                      const price = parseFloat(newBannerInfoPrice.replace(',', '.'));
                      const oldPrice = parseFloat(newBannerInfoOldPrice.replace(',', '.'));
                      const item: BannerInfoItem = isPromoCard
                        ? {
                            imageUrl: newBannerInfoImage,
                            title: newBannerInfoTitle.trim(),
                            text: newBannerInfoText.trim(),
                            price: isNaN(price) || price <= 0 ? undefined : price,
                            oldPrice: isNaN(oldPrice) || oldPrice <= 0 ? undefined : oldPrice,
                          }
                        : {
                            text: newBannerInfoText.trim(),
                            icon: newBannerInfoIcon,
                          };
                      setSettingsFormData(prev => ({
                        ...prev,
                        bannerInfoItems: [...(prev.bannerInfoItems || []), item],
                      }));
                      setNewBannerInfoText('');
                      setNewBannerInfoIcon('Truck');
                      setNewBannerInfoImage('');
                      setNewBannerInfoPrice('');
                      setNewBannerInfoOldPrice('');
                      setNewBannerInfoTitle('');
                    }}
                    disabled={isPromoCard ? !(newBannerInfoImage && newBannerInfoTitle.trim()) : !newBannerInfoText.trim()}
                    className="w-full px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <Plus className="w-4 h-4 inline-block mr-1" />
                    {isPromoCard ? 'Adicionar Card Promocional' : 'Adicionar Card'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-bg-medium">
              <button type="submit" disabled={isSavingSettings} className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm shadow-primary/20">
                {isSavingSettings ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
            {settingsError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-xl text-red-700 text-sm">{settingsError}</div>
            )}
          </form>
        ) : isFormOpen ? (
          <form onSubmit={handleSubmit} className="bg-bg-light p-6 sm:p-8 rounded-2xl border border-bg-medium shadow-sm">
            <h3 className="text-xl font-bold text-text-primary mb-6">{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-text-primary mb-1">Nome do Produto *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 bg-white text-text-primary border border-bg-medium rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all duration-300" placeholder="Ex: Kit 10 Pares Meia Esportiva" />
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-text-primary mb-1">Descrição</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 bg-white text-text-primary border border-bg-medium rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all duration-300" placeholder="Detalhes do produto..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">Preço (R$) *</label>
                <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-2.5 bg-white text-text-primary border border-bg-medium rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all duration-300" placeholder="99.90" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">Preço Antigo (R$) (De / Por)</label>
                <input type="number" step="0.01" min="0" value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: e.target.value})} className="w-full p-2.5 bg-white text-text-primary border border-bg-medium rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all duration-300" placeholder="129.90 (Opcional)" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">Categoria (Opcional)</label>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})} 
                  className="w-full p-2.5 bg-white text-text-primary border border-bg-medium rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all duration-300"
                >
                  <option value="">Selecione uma categoria...</option>
                  {(settings.categories || []).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-text-primary mb-1">Imagem do Produto</label>
                <div className="flex items-center gap-4">
                  {formData.image ? (
                    <div className="w-24 h-24 rounded-xl overflow-hidden border border-bg-medium shrink-0 bg-white relative group">
                      <img src={formData.image} className="w-full h-full object-cover" alt="Pré-visualização" />
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, image: ''})}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-xl border-2 border-dashed border-bg-medium flex items-center justify-center text-text-secondary shrink-0 bg-white">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-bg-medium rounded-xl text-sm font-medium text-text-primary hover:bg-bg-light transition-all duration-300 mb-2"
                    >
                      <Upload className="w-4 h-4" />
                      Fazer Upload de Foto
                    </button>
                    <p className="text-xs text-text-secondary">Ou cole a URL da imagem abaixo:</p>
                    <input type="url" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full mt-1 p-2 bg-white text-text-primary border border-bg-medium rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all duration-300 text-sm" placeholder="https://..." />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">Tamanhos (Separados por vírgula) *</label>
                <input required type="text" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} className="w-full p-2.5 bg-white text-text-primary border border-bg-medium rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all duration-300" placeholder="34-38, 39-43" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">Cores (Separadas por vírgula) *</label>
                <input required type="text" value={formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})} className="w-full p-2.5 bg-white text-text-primary border border-bg-medium rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all duration-300" placeholder="Branco, Preto, Cinza" />
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-bg-medium">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 text-text-primary font-medium hover:bg-bg-medium rounded-xl transition-all duration-300">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmittingProduct} className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm shadow-primary/20 flex items-center gap-2">
                {isSubmittingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isSubmittingProduct ? 'Salvando...' : 'Salvar Produto'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <button onClick={() => handleOpenForm()} className="mb-8 w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-hover transition-all duration-300 shadow-sm shadow-primary/20">
              <Plus className="w-5 h-5" /> Adicionar Novo Produto
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p.id} className="flex gap-4 p-4 border border-bg-medium rounded-xl bg-white shadow-sm items-center hover:border-primary/30 transition-all duration-300">
                   <div className="w-20 h-20 shrink-0 bg-bg-light rounded-xl overflow-hidden border border-bg-medium">
                     {p.image ? (
                       <img src={p.image} className="w-full h-full object-cover mix-blend-multiply" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-text-secondary"><ImageIcon /></div>
                     )}
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="font-bold text-text-primary text-sm truncate mb-1">{p.name}</h4>
                     <p className="text-primary font-semibold text-sm">R$ {p.price.toFixed(2).replace('.', ',')}</p>
                   </div>
                   <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={() => handleOpenForm(p)} className="p-2.5 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-300">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if(window.confirm('Excluir este produto?')) onRemove(p.id); }} className="p-2.5 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                </div>
              ))}
              
              {products.length === 0 && (
                <div className="col-span-full py-12 text-center text-text-secondary bg-bg-light rounded-2xl border-2 border-dashed border-bg-medium">
                  Nenhum produto cadastrado.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all duration-300 ${
          toast.type === 'success'
            ? 'bg-primary text-white border-primary/20'
            : 'bg-red-900 text-red-100 border-red-700'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
