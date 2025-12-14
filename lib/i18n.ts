import * as Localization from 'expo-localization'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      welcome: 'Welcome',
      greeting: 'Hello, {{name}}!',
      imageDemo: 'Image Demo',
      pickImage: 'Pick Image',
      locale: 'Locale',
      language: 'Language',
    },
  },
  ja: {
    translation: {
      welcome: 'ようこそ',
      greeting: 'こんにちは、{{name}}さん！',
      imageDemo: '画像デモ',
      pickImage: '画像を選択',
      locale: 'ロケール',
      language: '言語',
    },
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.getLocales()[0]?.languageCode ?? 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n

