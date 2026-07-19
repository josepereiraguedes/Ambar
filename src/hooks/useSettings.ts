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
  heroTitle?: string;
  heroSubtitle?: string;
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
    heroTitle: 'Catálogo Direto da Fábrica',
    heroSubtitle: 'Qualidade premium, preço de atacado. Escolha seus modelos, monte seu carrinho e envie o pedido diretamente para o nosso WhatsApp.',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (Object.keys(data).length > 0) {
          setSettings({
            ...settings,
            ...data
          });
        }
      })
      .catch(err => console.error('Failed to fetch settings', err));
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem('auth_token') || '';
  };

  const saveSettings = async (newSettings: StoreSettings) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
      body: JSON.stringify(newSettings)
    });
    if (res.ok) {
      setSettings(newSettings);
    }
  };

  return { settings, saveSettings };
}
