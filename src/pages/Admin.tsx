import { useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { AdminPanel } from '../components/AdminPanel';
import { useProducts } from '../hooks/useProducts';
import { useSettings } from '../hooks/useSettings';
import { useNavigate } from 'react-router-dom';

export function Admin() {
  const { user, loading, signIn } = useAuth();
  const { products, addProduct, updateProduct, removeProduct } = useProducts();
  const { settings, saveSettings } = useSettings();
  const navigate = useNavigate();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Carregando...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Acesso Restrito</h2>
          <p className="text-gray-600 mb-8">Faça login para acessar o painel de administração.</p>
          <button 
            onClick={signIn}
            className="w-full bg-black text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AdminPanel 
        isOpen={true} 
        onClose={() => navigate('/')} 
        products={products}
        onAdd={addProduct}
        onUpdate={updateProduct}
        onRemove={removeProduct}
        settings={settings}
        onUpdateSettings={saveSettings}
      />
    </div>
  );
}
