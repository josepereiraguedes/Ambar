import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { X, Plus, Edit2, Trash2, Image as ImageIcon, Upload } from 'lucide-react';
import { Product } from '../types';

import { StoreSettings } from '../hooks/useSettings';

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

  // Sync settings prop changes to settingsFormData state
  useEffect(() => {
    setSettingsFormData({
      ...settings,
      categories: Array.isArray(settings.categories) ? settings.categories : [],
    });
  }, [settings]);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

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

  const handleBannerUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1600; // Wider for banners
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setSettingsFormData(prev => ({ ...prev, bannerImageUrl: dataUrl }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400; // Smaller size for logo
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/png'); // Using PNG for logos with transparency
        setSettingsFormData(prev => ({ ...prev, logo: dataUrl }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setSettingsError(null);
    setIsSavingSettings(true);
    try {
      await onUpdateSettings(settingsFormData);
      setSettingsError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setSettingsError(msg);
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

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setFormData(prev => ({ ...prev, image: dataUrl }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const parsedOldPrice = parseFloat(formData.oldPrice.replace(',', '.'));
    
    const newProduct: Product = {
      id: editingId || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price.replace(',', '.')) || 0,
      oldPrice: isNaN(parsedOldPrice) || parsedOldPrice <= 0 ? undefined : parsedOldPrice,
      image: formData.image || 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=800&q=80', // Fallback
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
      colors: formData.colors.split(',').map(c => c.trim()).filter(Boolean),
      category: formData.category
    };

    if (newProduct.sizes.length === 0) newProduct.sizes = ['Único'];
    if (newProduct.colors.length === 0) newProduct.colors = ['Padrão'];

    if (editingId) {
      onUpdate(newProduct);
    } else {
      onAdd(newProduct);
    }
    setIsFormOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white py-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => { setActiveTab('products'); setIsFormOpen(false); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'products' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Catálogo de Produtos
          </button>
          <button 
            onClick={() => { setActiveTab('settings'); setSettingsFormData({ ...settings, categories: Array.isArray(settings.categories) ? settings.categories : [] }); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'settings' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Configurações da Loja
          </button>
        </div>

        {activeTab === 'settings' ? (
          <form onSubmit={handleSaveSettings} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Configurações da Loja</h3>
            
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome da Loja/Fábrica</label>
                <input required type="text" value={settingsFormData.name} onChange={e => setSettingsFormData({...settingsFormData, name: e.target.value})} className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ex: Ambar" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Número do WhatsApp</label>
                <input required type="text" value={settingsFormData.whatsapp} onChange={e => setSettingsFormData({...settingsFormData, whatsapp: e.target.value})} className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="5511999999999" />
                <p className="text-xs text-gray-500 mt-1">Coloque o Código do País (55) + DDD + Número. Apenas números.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Logo da Loja</label>
                <div className="flex items-center gap-4">
                  {settingsFormData.logo ? (
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-white relative group flex items-center justify-center p-2">
                      <img src={settingsFormData.logo} className="w-full h-full object-contain" alt="Logo Preview" />
                      <button 
                        type="button"
                        onClick={() => setSettingsFormData({...settingsFormData, logo: ''})}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 shrink-0 bg-gray-50 p-2">
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
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-2"
                    >
                      <Upload className="w-4 h-4" />
                      Fazer Upload da Logo
                    </button>
                    <p className="text-xs text-gray-500">Ou cole a URL da logo abaixo:</p>
                    <input type="url" value={settingsFormData.logo} onChange={e => setSettingsFormData({...settingsFormData, logo: e.target.value})} className="w-full mt-1 p-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm" placeholder="https://..." />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="showName" 
                  checked={settingsFormData.showName !== false} 
                  onChange={e => setSettingsFormData({...settingsFormData, showName: e.target.checked})}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="showName" className="text-sm font-medium text-gray-700">
                  Mostrar nome da loja ao lado da logo no cabeçalho
                </label>
              </div>

              <div className="pt-4 border-t border-gray-200 mt-2">
                <h4 className="text-sm font-bold text-gray-900 mb-4">Textos Iniciais</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Título Principal</label>
                    <input type="text" value={settingsFormData.heroTitle || ''} onChange={e => setSettingsFormData({...settingsFormData, heroTitle: e.target.value})} className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Catálogo Direto da Fábrica" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Subtítulo (Texto de apresentação)</label>
                    <textarea value={settingsFormData.heroSubtitle || ''} onChange={e => setSettingsFormData({...settingsFormData, heroSubtitle: e.target.value})} className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none min-h-[80px]" placeholder="Qualidade premium..." />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 mt-2">
                <h4 className="text-sm font-bold text-gray-900 mb-4">Configurações do Rodapé</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição do Rodapé</label>
                    <input type="text" value={settingsFormData.footerDescription || ''} onChange={e => setSettingsFormData({...settingsFormData, footerDescription: e.target.value})} className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Especialistas em meias..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Informação 1</label>
                    <input type="text" value={settingsFormData.footerInfo1 || ''} onChange={e => setSettingsFormData({...settingsFormData, footerInfo1: e.target.value})} className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Enviamos para todo o Brasil." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Informação 2</label>
                    <input type="text" value={settingsFormData.footerInfo2 || ''} onChange={e => setSettingsFormData({...settingsFormData, footerInfo2: e.target.value})} className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Atendimento de Seg a Sex." />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 mt-2">
                <h4 className="text-sm font-bold text-gray-900 mb-4">Redes Sociais (Opcional)</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Instagram (URL)</label>
                    <input type="url" value={settingsFormData.instagramUrl || ''} onChange={e => setSettingsFormData({...settingsFormData, instagramUrl: e.target.value})} className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm" placeholder="https://instagram.com/..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Facebook (URL)</label>
                    <input type="url" value={settingsFormData.facebookUrl || ''} onChange={e => setSettingsFormData({...settingsFormData, facebookUrl: e.target.value})} className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm" placeholder="https://facebook.com/..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">TikTok (URL)</label>
                    <input type="url" value={settingsFormData.tiktokUrl || ''} onChange={e => setSettingsFormData({...settingsFormData, tiktokUrl: e.target.value})} className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm" placeholder="https://tiktok.com/..." />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 mt-2">
                <h4 className="text-sm font-bold text-gray-900 mb-4">Categorias de Produtos</h4>
                <p className="text-xs text-gray-500 mb-3">Gerencie as categorias disponíveis para classificar os produtos do catálogo.</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(Array.isArray(settingsFormData.categories) ? settingsFormData.categories : []).map(cat => (
                    <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700">
                      {cat}
                      <button
                        type="button"
                        onClick={() => removeCategory(cat)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
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
                    className="flex-1 p-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={addCategory}
                    className="flex items-center gap-1 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 mt-2">
                <h4 className="text-sm font-bold text-gray-900 mb-4">Banner Promocional</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="bannerActive" 
                      checked={settingsFormData.bannerActive || false} 
                      onChange={e => setSettingsFormData({...settingsFormData, bannerActive: e.target.checked})}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="bannerActive" className="text-sm font-medium text-gray-700">
                      Exibir banner promocional no topo
                    </label>
                  </div>
                  {settingsFormData.bannerActive && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Texto do Banner (Opcional se usar imagem)</label>
                        <input type="text" value={settingsFormData.bannerText || ''} onChange={e => setSettingsFormData({...settingsFormData, bannerText: e.target.value})} className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Frete Grátis acima de R$100" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Imagem do Banner (Opcional)</label>
                        <div className="flex flex-col gap-3">
                          {settingsFormData.bannerImageUrl && (
                            <div className="w-full h-32 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-white relative group flex items-center justify-center p-2">
                              <img src={settingsFormData.bannerImageUrl} className="w-full h-full object-cover" alt="Banner Preview" />
                              <button 
                                type="button"
                                onClick={() => setSettingsFormData({...settingsFormData, bannerImageUrl: ''})}
                                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-6 h-6" />
                              </button>
                            </div>
                          )}
                          <div className="flex flex-col gap-2">
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
                              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
                            >
                              <Upload className="w-4 h-4" />
                              Fazer Upload da Imagem do Banner
                            </button>
                            <p className="text-xs text-gray-500">Tamanho ideal: 1200x400 pixels para visualização perfeita no catálogo. Ou cole a URL abaixo:</p>
                            <input type="url" value={settingsFormData.bannerImageUrl || ''} onChange={e => setSettingsFormData({...settingsFormData, bannerImageUrl: e.target.value})} className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ex: https://..." />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
              <button type="submit" disabled={isSavingSettings} className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm">
                {isSavingSettings ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
            {settingsError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">{settingsError}</div>
            )}
          </form>
        ) : isFormOpen ? (
          <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do Produto *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ex: Kit 10 Pares Meia Esportiva" />
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Detalhes do produto..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Preço (R$) *</label>
                <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="99.90" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Preço Antigo (R$) (De / Por)</label>
                <input type="number" step="0.01" min="0" value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: e.target.value})} className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="129.90 (Opcional)" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Categoria (Opcional)</label>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})} 
                  className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="">Selecione uma categoria...</option>
                  {(settings.categories || []).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Imagem do Produto</label>
                <div className="flex items-center gap-4">
                  {formData.image ? (
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-white relative group">
                      <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, image: ''})}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 shrink-0 bg-gray-50">
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
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-2"
                    >
                      <Upload className="w-4 h-4" />
                      Fazer Upload de Foto
                    </button>
                    <p className="text-xs text-gray-500">Ou cole a URL da imagem abaixo:</p>
                    <input type="url" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full mt-1 p-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm" placeholder="https://..." />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tamanhos (Separados por vírgula) *</label>
                <input required type="text" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="34-38, 39-43" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cores (Separadas por vírgula) *</label>
                <input required type="text" value={formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})} className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Branco, Preto, Cinza" />
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">
                Cancelar
              </button>
              <button type="submit" className="px-6 py-2.5 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors shadow-sm">
                Salvar Produto
              </button>
            </div>
          </form>
        ) : (
          <>
            <button onClick={() => handleOpenForm()} className="mb-8 w-full sm:w-auto flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-700 transition-colors shadow-sm">
              <Plus className="w-5 h-5" /> Adicionar Novo Produto
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p.id} className="flex gap-4 p-4 border border-gray-200 rounded-2xl bg-white shadow-sm items-center hover:border-orange-200 transition-colors">
                   <div className="w-20 h-20 shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                     {p.image ? (
                       <img src={p.image} className="w-full h-full object-cover mix-blend-multiply" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon /></div>
                     )}
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="font-bold text-gray-900 text-sm truncate mb-1">{p.name}</h4>
                     <p className="text-orange-600 font-semibold text-sm">R$ {p.price.toFixed(2).replace('.', ',')}</p>
                   </div>
                   <div className="flex flex-col gap-2 shrink-0">
                     <button onClick={() => handleOpenForm(p)} className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                       <Edit2 className="w-4 h-4" />
                     </button>
                     <button onClick={() => { if(window.confirm('Excluir este produto?')) onRemove(p.id); }} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                </div>
              ))}
              
              {products.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  Nenhum produto cadastrado.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
