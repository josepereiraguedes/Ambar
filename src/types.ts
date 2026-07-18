export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  sizes: string[];
  colors: string[];
  category?: string;
};

export type CartItem = {
  id: string; // Unique combination of product, size, and color
  product: Product;
  quantity: number;
  size: string;
  color: string;
};
