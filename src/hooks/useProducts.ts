import { useState, useEffect } from 'react';
import { Product } from '../types';
import { products as initialProducts } from '../data';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('@ambar:products');
    if (saved) {
      setProducts(JSON.parse(saved));
    } else {
      setProducts(initialProducts);
      localStorage.setItem('@ambar:products', JSON.stringify(initialProducts));
    }
    setIsLoaded(true);
  }, []);

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('@ambar:products', JSON.stringify(newProducts));
  };

  const addProduct = (product: Product) => {
    saveProducts([...products, product]);
  };

  const updateProduct = (updated: Product) => {
    saveProducts(products.map(p => p.id === updated.id ? updated : p));
  };

  const removeProduct = (id: string) => {
    saveProducts(products.filter(p => p.id !== id));
  };

  return { products, isLoaded, addProduct, updateProduct, removeProduct };
}
