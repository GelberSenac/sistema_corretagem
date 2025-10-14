import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const apiBaseUrl = {
    webDev: 'http://localhost:3001/api/v1',
    // Para desenvolvimento nativo em dispositivo físico, defina seu IP na LAN
    // Você pode sobrescrever via env: NATIVE_DEV_API_BASE_URL
    nativeDev: process.env.NATIVE_DEV_API_BASE_URL || 'http://192.168.x.y:3001/api/v1',
    staging: 'https://api.staging.corretorfacil.com/api/v1',
    prod: 'https://api.corretorfacil.com/api/v1',
  };

  return {
    ...config,
    name: config.name || 'sistema_corretagem_app',
    slug: config.slug || 'sistema_corretagem-app',
    extra: {
      apiBaseUrl,
    },
  };
};