import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { STORE_CONFIG } from '../config';

export interface StoreSettings {
  name: string;
  whatsapp: string;
  logo: string;
  showName?: boolean;
  footerDescription?: string;
  footerInfo1?: string;
  footerInfo2?: string;
  bannerActive?: boolean;
  bannerText?: string;
  bannerImageUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  categories: string[];
}

// ID fixo da única linha de configurações (singleton)
const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

export const DEFAULT_SETTINGS: StoreSettings = {
  name: STORE_CONFIG.STORE_NAME,
  whatsapp: STORE_CONFIG.WHATSAPP_NUMBER,
  logo: STORE_CONFIG.LOGO_URL || '',
  showName: true,
  footerDescription: 'Especialistas em meias. Qualidade e conforto direto da fábrica para você.',
  footerInfo1: 'Enviamos para todo o Brasil.',
  footerInfo2: 'Atendimento de Seg a Sex.',
  bannerActive: false,
  bannerText: 'Frete Grátis acima de R$100 para todo o Brasil!',
  bannerImageUrl: '',
  instagramUrl: '',
  facebookUrl: '',
  tiktokUrl: '',
  heroTitle: 'Catálogo Direto da Fábrica',
  heroSubtitle:
    'Qualidade premium, preço de atacado. Escolha seus modelos, monte seu carrinho e envie o pedido diretamente para o nosso WhatsApp.',
  categories: ['Cano Alto', 'Cano Curto', 'Invisível', 'Social', 'Térmica', 'Esportiva', 'Compressão', 'Atacado'],
};

const parsePgArray = (val: unknown): string[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    // Postgres array literal: {a,b,c} or {"a","b","c"}
    if (val.startsWith('{') && val.endsWith('}')) {
      const inner = val.slice(1, -1);
      if (!inner) return [];
      const items: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < inner.length; i++) {
        const ch = inner[i];
        if (inQuotes) {
          if (ch === '"') {
            if (inner[i + 1] === '"') { cur += '"'; i++; }
            else inQuotes = false;
          } else cur += ch;
        } else if (ch === '"') inQuotes = true;
        else if (ch === ',') { items.push(cur); cur = ''; }
        else cur += ch;
      }
      items.push(cur);
      return items.filter(Boolean);
    }
    // JSON array string: ["a","b","c"] (column might be text, not text[])
    if (val.startsWith('[') && val.endsWith(']')) {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch { /* ignore parse errors */ }
    }
    return [];
  }
  return [];
};

// Mapeia linha do banco (snake_case) para StoreSettings (camelCase)
const mapFromDB = (row: Record<string, unknown>): StoreSettings => ({
  name: (row.name as string) ?? DEFAULT_SETTINGS.name,
  whatsapp: (row.whatsapp as string) ?? DEFAULT_SETTINGS.whatsapp,
  logo: (row.logo as string) ?? '',
  showName: (row.show_name as boolean) ?? true,
  footerDescription: (row.footer_description as string) ?? DEFAULT_SETTINGS.footerDescription,
  footerInfo1: (row.footer_info1 as string) ?? DEFAULT_SETTINGS.footerInfo1,
  footerInfo2: (row.footer_info2 as string) ?? DEFAULT_SETTINGS.footerInfo2,
  bannerActive: (row.banner_active as boolean) ?? false,
  bannerText: (row.banner_text as string) ?? DEFAULT_SETTINGS.bannerText,
  bannerImageUrl: (row.banner_image_url as string) ?? '',
  instagramUrl: (row.instagram_url as string) ?? '',
  facebookUrl: (row.facebook_url as string) ?? '',
  tiktokUrl: (row.tiktok_url as string) ?? '',
  heroTitle: (row.hero_title as string) ?? DEFAULT_SETTINGS.heroTitle,
  heroSubtitle: (row.hero_subtitle as string) ?? DEFAULT_SETTINGS.heroSubtitle,
  categories: parsePgArray(row.categories),
});

// Mapeia StoreSettings (camelCase) para linha do banco (snake_case)
const mapToDB = (s: StoreSettings) => ({
  id: SETTINGS_ID,
  name: s.name,
  whatsapp: s.whatsapp,
  logo: s.logo,
  show_name: s.showName ?? true,
  footer_description: s.footerDescription ?? '',
  footer_info1: s.footerInfo1 ?? '',
  footer_info2: s.footerInfo2 ?? '',
  banner_active: s.bannerActive ?? false,
  banner_text: s.bannerText ?? '',
  banner_image_url: s.bannerImageUrl ?? '',
  instagram_url: s.instagramUrl ?? '',
  facebook_url: s.facebookUrl ?? '',
  tiktok_url: s.tiktokUrl ?? '',
  hero_title: s.heroTitle ?? '',
  hero_subtitle: s.heroSubtitle ?? '',
  categories: s.categories ?? [],
  updated_at: new Date().toISOString(),
});

export function useSettings() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', SETTINGS_ID)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar configurações:', error.message);
      setIsLoaded(true); // mesmo com erro, libera a renderização
      return;
    }

    if (!data) {
      // Linha não existe ainda: criar com valores padrão
      const { data: inserted, error: insertError } = await supabase
        .from('store_settings')
        .upsert(mapToDB(DEFAULT_SETTINGS))
        .select()
        .maybeSingle();

      if (!insertError && inserted) {
        setSettings(mapFromDB(inserted));
      }
    } else {
      setSettings(mapFromDB(data));
    }
    setIsLoaded(true);
  };

  const saveSettings = async (newSettings: StoreSettings) => {
    setSettings(newSettings);

    const { error } = await supabase
      .from('store_settings')
      .update(mapToDB(newSettings))
      .eq('id', SETTINGS_ID);

    if (error) {
      console.error('Erro ao salvar configurações:', error.message);
      throw error;
    }

    const { data, error: fetchError } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', SETTINGS_ID)
      .maybeSingle();

    if (!fetchError && data) {
      const parsed = mapFromDB(data);
      // Se o re-read não trouxe categorias, preserva as que enviamos
      if ((!parsed.categories || parsed.categories.length === 0) && newSettings.categories?.length) {
        parsed.categories = [...newSettings.categories];
      }
      setSettings(parsed);
    }
  };

  return { settings, isLoaded, saveSettings };
}
