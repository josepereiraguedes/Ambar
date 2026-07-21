import { useState, type FormEvent } from 'react';
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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSigningIn(true);
    
    const success = await signIn(email.trim(), password);
    if (!success) {
      setError('E-mail ou senha incorretos.');
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-dark text-white font-sans">Carregando...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark p-4 font-sans">
        <div className="bg-dark-light border border-dark-lighter p-8 sm:p-10 rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-primary to-transparent blur-md"></div>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Acesso Restrito</h2>
            <p className="text-gray-400 text-sm">Insira suas credenciais para gerenciar o catálogo</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3.5 bg-red-950/50 border border-red-800/80 rounded-xl text-red-200 text-xs font-semibold text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">E-mail / Usuário</label>
              <input
                required
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Ex: ambaradmin.com"
                className="w-full px-4 py-3 bg-dark-lighter/50 border border-dark-lighter/80 text-white rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Senha</label>
              <input
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full px-4 py-3 bg-dark-lighter/50 border border-dark-lighter/80 text-white rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all duration-300 text-sm"
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                disabled={isSigningIn}
                className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-primary/20 active:scale-[0.98]"
              >
                {isSigningIn ? 'Entrando...' : 'Entrar no Painel'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => navigate('/')} 
              className="text-gray-500 hover:text-gray-300 text-xs font-semibold transition-colors"
            >
              Voltar ao Catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white">
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
