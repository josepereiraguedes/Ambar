import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-extrabold text-bg-medium mb-4">404</h1>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Página não encontrada</h2>
        <p className="text-text-secondary mb-8 leading-relaxed">
          A página que você procura não existe ou foi removida.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-xl font-medium transition-all duration-300 shadow-md shadow-primary/20"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar ao Catálogo
        </button>
      </div>
    </div>
  );
}
