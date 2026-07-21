import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
      <div className="text-center max-w-md">
        <h1 className="text-6xl sm:text-8xl font-extrabold text-bg-medium mb-3 sm:mb-4">404</h1>
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">Página não encontrada</h2>
        <p className="text-sm sm:text-base text-text-secondary mb-6 sm:mb-8 leading-relaxed">
          A página que você procura não existe ou foi removida.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-medium transition-all duration-300 shadow-md shadow-primary/20 active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Voltar ao Catálogo
        </button>
      </div>
    </div>
  );
}
