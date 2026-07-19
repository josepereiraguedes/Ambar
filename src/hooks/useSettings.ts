import { useState, useEffect } from 'react';
import { STORE_CONFIG } from '../config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'default');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() as StoreSettings }));
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      }
    };
    fetchSettings();
  }, []);

  const saveSettings = async (newSettings: StoreSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'default'), newSettings);
      setSettings(newSettings);
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  };

  return { settings, saveSettings };
}
