export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  sizes: string[];
  colors: string[];
  category?: string;
};

export type CartItem = {
  id: string; // Combinação única de produto, tamanho e cor
  product: Product;
  quantity: number;
  size: string;
  color: string;
};
