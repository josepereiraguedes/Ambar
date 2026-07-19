import { useState, useEffect } from 'react';
import { Product } from '../types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setIsLoaded(true);
      })
      .catch(err => {
        console.error('Failed to fetch products', err);
        setIsLoaded(true);
      });
  }, []);

  const getAuthToken = () => {
    // We would get this from Firebase auth context
    return localStorage.getItem('auth_token') || '';
  };

  const addProduct = async (product: Product) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
      body: JSON.stringify(product)
    });
    if (res.ok) {
      setProducts([...products, product]);
    }
  };

  const updateProduct = async (updated: Product) => {
    const res = await fetch(`/api/products/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
      body: JSON.stringify(updated)
    });
    if (res.ok) {
      setProducts(products.map(p => p.id === updated.id ? updated : p));
    }
  };

  const removeProduct = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (res.ok) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return { products, isLoaded, addProduct, updateProduct, removeProduct };
}
