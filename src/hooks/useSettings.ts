import { useState, useEffect } from 'react';
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
}

export function useSettings() {
  const [settings, setSettings] = useState<StoreSettings>({
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
  });

  useEffect(() => {
    const saved = localStorage.getItem('@ambar:settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings({ 
        ...parsed, 
        showName: parsed.showName ?? true,
        footerDescription: parsed.footerDescription ?? 'Especialistas em meias. Qualidade e conforto direto da fábrica para você.',
        footerInfo1: parsed.footerInfo1 ?? 'Enviamos para todo o Brasil.',
        footerInfo2: parsed.footerInfo2 ?? 'Atendimento de Seg a Sex.',
        bannerActive: parsed.bannerActive ?? false,
        bannerText: parsed.bannerText ?? 'Frete Grátis acima de R$100 para todo o Brasil!',
        bannerImageUrl: parsed.bannerImageUrl ?? '',
        instagramUrl: parsed.instagramUrl ?? '',
        facebookUrl: parsed.facebookUrl ?? '',
        tiktokUrl: parsed.tiktokUrl ?? '',
      });
    } else {
      localStorage.setItem('@ambar:settings', JSON.stringify(settings));
    }
  }, []);

  const saveSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    localStorage.setItem('@ambar:settings', JSON.stringify(newSettings));
  };

  return { settings, saveSettings };
}
