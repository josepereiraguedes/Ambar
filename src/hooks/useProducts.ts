import { useState, useEffect } from 'react';
import { Product } from '../types';
import { supabase } from '../lib/supabase';

// Mapeia linha do banco (snake_case) para tipo Product (camelCase)
const mapFromDB = (row: Record<string, unknown>): Product => ({
  id: row.id as string,
  name: row.name as string,
  description: row.description as string,
  price: Number(row.price),
  oldPrice: row.old_price != null ? Number(row.old_price) : undefined,
  image: row.image as string,
  sizes: (row.sizes as string[]) || [],
  colors: (row.colors as string[]) || [],
  category: row.category as string | undefined,
});

// Mapeia tipo Product (camelCase) para linha do banco (snake_case)
const mapToDB = (product: Product) => ({
  name: product.name,
  description: product.description,
  price: product.price,
  old_price: product.oldPrice ?? null,
  image: product.image,
  sizes: product.sizes,
  colors: product.colors,
  category: product.category ?? null,
});

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar produtos:', error.message);
      setIsLoaded(true);
      return;
    }

    if (data) {
      setProducts(data.map(mapFromDB));
    }
    setIsLoaded(true);
  };

  const addProduct = async (product: Product) => {
    const { data, error } = await supabase
      .from('products')
      .insert(mapToDB(product))
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar produto:', error.message);
    } else if (data) {
      setProducts(prev => [...prev, mapFromDB(data)]);
    }
  };

  const updateProduct = async (updated: Product) => {
    const { data, error } = await supabase
      .from('products')
      .update(mapToDB(updated))
      .eq('id', updated.id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar produto:', error.message);
    } else if (data) {
      setProducts(prev => prev.map(p => p.id === updated.id ? mapFromDB(data) : p));
    }
  };

  const removeProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao remover produto:', error.message);
    } else {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  return { products, isLoaded, addProduct, updateProduct, removeProduct };
}
