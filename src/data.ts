import { Product } from './types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Kit 10 Pares - Meia Esportiva Cano Alto',
    description: 'Meias esportivas reforçadas, ideais para academia e dia a dia. Algodão premium com alta absorção de suor.',
    price: 79.90,
    image: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&q=80&w=800',
    sizes: ['34-38', '39-43'],
    colors: ['Branco', 'Preto', 'Misto'],
    category: 'Cano Alto'
  },
  {
    id: '2',
    name: 'Kit 12 Pares - Meia Invisível Silicone',
    description: 'Meia sapatilha invisível com aplique de silicone no calcanhar. Não escorrega do pé e é super confortável.',
    price: 89.90,
    image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&q=80&w=800',
    sizes: ['34-38', '39-43'],
    colors: ['Nude', 'Preto', 'Branco'],
    category: 'Invisível'
  },
  {
    id: '3',
    name: 'Meia Térmica de Frio Intenso (Par)',
    description: 'Meia grossa forrada, desenvolvida para baixas temperaturas. Conforto térmico absoluto.',
    price: 24.90,
    image: 'https://images.unsplash.com/photo-1516762391038-f1c5c4772153?auto=format&fit=crop&q=80&w=800',
    sizes: ['Único (36-43)'],
    colors: ['Cinza Mescla', 'Preto'],
    category: 'Térmica'
  },
  {
    id: '4',
    name: 'Kit 5 Pares - Meia Social Premium',
    description: 'Meia social cano longo em fio de escócia. Elegância e durabilidade para uso com sapatos.',
    price: 59.90,
    image: 'https://images.unsplash.com/photo-1608222351212-18fe0ec7b13b?auto=format&fit=crop&q=80&w=800',
    sizes: ['39-43'],
    colors: ['Preto', 'Azul Marinho', 'Marrom'],
    category: 'Social'
  },
  {
    id: '5',
    name: 'Meia de Compressão Leve (Par)',
    description: 'Auxilia na circulação durante viagens ou longos períodos em pé. Confortável e anatômica.',
    price: 34.90,
    image: 'https://images.unsplash.com/photo-1498842777161-0428d0be4537?auto=format&fit=crop&q=80&w=800',
    sizes: ['M (35-38)', 'G (39-42)', 'GG (43-45)'],
    colors: ['Preto', 'Bege'],
    category: 'Compressão'
  },
  {
    id: '6',
    name: 'Fardo Atacado - 50 Pares Básica',
    description: 'Fardo fechado para lojistas ou famílias grandes. Meia cano médio algodão/poliamida de excelente custo-benefício.',
    price: 250.00,
    image: 'https://images.unsplash.com/photo-1629851610214-411bd1845199?auto=format&fit=crop&q=80&w=800',
    sizes: ['Sortido (34 a 43)'],
    colors: ['Pacote Misto'],
    category: 'Atacado'
  }
];
