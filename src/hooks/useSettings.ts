import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type BannerItem = {
  imageUrl: string;
};

export type BannerInfoItem = {
  text: string;
  icon?: string;
  imageUrl?: string;
  price?: number;
  oldPrice?: number;
  title?: string;
};

export interface StoreSettings {
  name: string;
  whatsapp: string;
  logo: string;
  showName?: boolean;
  footerDescription?: string;
  footerInfo1?: string;
  footerInfo2?: string;
  footerInfo3?: string;
  bannerActive?: boolean;
  bannerText?: string;
  bannerImageUrl?: string;
  banners: BannerItem[];
  bannerInfoItems: BannerInfoItem[];
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  categories: string[];
  bannerInfo1?: string;
  bannerInfo2?: string;
  bannerInfo3?: string;
  bannerInfoIcon1?: string;
  bannerInfoIcon2?: string;
  bannerInfoIcon3?: string;
}

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

const EMPTY_SETTINGS: StoreSettings = {
  name: '',
  whatsapp: '',
  logo: '',
  showName: true,
  footerDescription: '',
  footerInfo1: '',
  footerInfo2: '',
  footerInfo3: '',
  bannerActive: false,
  bannerText: '',
  bannerImageUrl: '',
  banners: [],
  bannerInfoItems: [],
  instagramUrl: '',
  facebookUrl: '',
  tiktokUrl: '',
  heroTitle: '',
  heroSubtitle: '',
  categories: [],
  bannerInfo1: '',
  bannerInfo2: '',
  bannerInfo3: '',
  bannerInfoIcon1: 'Truck',
  bannerInfoIcon2: 'Clock',
  bannerInfoIcon3: 'Shield',
};

const parsePgArray = (val: unknown): string[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
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
    if (val.startsWith('[') && val.endsWith(']')) {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch { /* ignora */ }
    }
    // String separada por vírgula (ex: "Cano Alto,Cano Curto,Invisível")
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

const parseJsonArray = <T>(val: unknown): T[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val as T[];
  if (typeof val === 'string') {
    try { const p = JSON.parse(val); if (Array.isArray(p)) return p as T[]; } catch { /* ignore */ }
  }
  return [];
};

const mapFromDB = (row: Record<string, unknown>): StoreSettings => {
  const banners = parseJsonArray<BannerItem>(row.banners);
  if (banners.length === 0 && (row.banner_image_url as string)) {
    banners.push({ imageUrl: row.banner_image_url as string });
  }
  let bannerInfoItems = parseJsonArray<BannerInfoItem>(row.banner_info_items);
  if (bannerInfoItems.length === 0 && (row.banner_info1 as string)) {
    if (row.banner_info1 as string) bannerInfoItems.push({ text: row.banner_info1 as string, icon: (row.banner_info_icon1 as string) || 'Truck' });
    if (row.banner_info2 as string) bannerInfoItems.push({ text: row.banner_info2 as string, icon: (row.banner_info_icon2 as string) || 'Clock' });
    if (row.banner_info3 as string) bannerInfoItems.push({ text: row.banner_info3 as string, icon: (row.banner_info_icon3 as string) || 'Shield' });
  }
  return {
    name: (row.name as string) ?? '',
    whatsapp: (row.whatsapp as string) ?? '',
    logo: (row.logo as string) ?? '',
    showName: (row.show_name as boolean) ?? true,
    footerDescription: (row.footer_description as string) ?? '',
    footerInfo1: (row.footer_info1 as string) ?? '',
    footerInfo2: (row.footer_info2 as string) ?? '',
    footerInfo3: (row.footer_info3 as string) ?? '',
    bannerActive: (row.banner_active as boolean) ?? false,
    bannerText: (row.banner_text as string) ?? '',
    bannerImageUrl: (row.banner_image_url as string) ?? '',
    banners,
    bannerInfoItems,
    instagramUrl: (row.instagram_url as string) ?? '',
    facebookUrl: (row.facebook_url as string) ?? '',
    tiktokUrl: (row.tiktok_url as string) ?? '',
    heroTitle: (row.hero_title as string) ?? '',
    heroSubtitle: (row.hero_subtitle as string) ?? '',
    categories: parsePgArray(row.categories),
    bannerInfo1: (row.banner_info1 as string) ?? '',
    bannerInfo2: (row.banner_info2 as string) ?? '',
    bannerInfo3: (row.banner_info3 as string) ?? '',
    bannerInfoIcon1: (row.banner_info_icon1 as string) ?? 'Truck',
    bannerInfoIcon2: (row.banner_info_icon2 as string) ?? 'Clock',
    bannerInfoIcon3: (row.banner_info_icon3 as string) ?? 'Shield',
  };
};

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
  footer_info3: s.footerInfo3 ?? '',
  banner_active: s.bannerActive ?? false,
  banner_text: s.bannerText ?? '',
  banner_image_url: s.bannerImageUrl ?? '',
  banners: s.banners ?? [],
  instagram_url: s.instagramUrl ?? '',
  facebook_url: s.facebookUrl ?? '',
  tiktok_url: s.tiktokUrl ?? '',
  hero_title: s.heroTitle ?? '',
  hero_subtitle: s.heroSubtitle ?? '',
  categories: s.categories ?? [],
  banner_info1: s.bannerInfo1 ?? '',
  banner_info2: s.bannerInfo2 ?? '',
  banner_info3: s.bannerInfo3 ?? '',
  banner_info_icon1: s.bannerInfoIcon1 ?? 'Truck',
  banner_info_icon2: s.bannerInfoIcon2 ?? 'Clock',
  banner_info_icon3: s.bannerInfoIcon3 ?? 'Shield',
  updated_at: new Date().toISOString(),
});

export function useSettings() {
  const [settings, setSettings] = useState<StoreSettings>(EMPTY_SETTINGS);
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
      setIsLoaded(true);
      return;
    }

    if (!data) {
      const { data: inserted, error: insertError } = await supabase
        .from('store_settings')
        .upsert(mapToDB(EMPTY_SETTINGS))
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

    // Tenta salvar banner_info_items separadamente (coluna pode não existir ainda)
    const { error: bannerErr } = await supabase
      .from('store_settings')
      .update({ banner_info_items: newSettings.bannerInfoItems ?? [] })
      .eq('id', SETTINGS_ID);

    if (bannerErr) {
      console.warn('banner_info_items ainda não disponível no banco:', bannerErr.message);
    }

    const { data, error: fetchError } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', SETTINGS_ID)
      .maybeSingle();

    if (!fetchError && data) {
      const parsed = mapFromDB(data);
      if ((!parsed.categories || parsed.categories.length === 0) && newSettings.categories?.length) {
        parsed.categories = [...newSettings.categories];
      }
      setSettings(parsed);
    }
  };

  return { settings, isLoaded, saveSettings };
}
