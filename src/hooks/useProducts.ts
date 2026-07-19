import { useState, useEffect } from 'react';
import { Product } from '../types';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productsData);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchProducts();
  }, []);

  const addProduct = async (product: Product) => {
    try {
      await setDoc(doc(db, 'products', product.id), product);
      setProducts(prev => [...prev, product]);
    } catch (e) {
      console.error('Error adding product', e);
    }
  };

  const updateProduct = async (updated: Product) => {
    try {
      await setDoc(doc(db, 'products', updated.id), updated);
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    } catch (e) {
      console.error('Error updating product', e);
    }
  };

  const removeProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error('Error removing product', e);
    }
  };

  return { products, isLoaded, addProduct, updateProduct, removeProduct };
}
