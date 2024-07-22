import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from './languages_en.json';
import vn from './languages_vi.json';

// Define the structure of your translations
interface Translation {
  [key: string]: string;
}

interface TranslationResources {
  [language: string]: {
    translation: Translation;
  };
}

// Define the type for the resources
const resources: TranslationResources = {
  en: {translation: en},
  vn: {translation: vn},
};

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'vn',
  fallbackLng: 'vn',
  resources,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
