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
        footerInfo2: parsed.footerInfo2 ?? 'Atendimento de Seg a Sex.'
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
