import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getDevHost(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    return hostUri.split(':')[0];
  }
  return 'localhost';
}

export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  const port = process.env.EXPO_PUBLIC_API_PORT ?? '3000';

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${port}`;
  }

  if (Platform.OS === 'web') {
    return `http://localhost:${port}`;
  }

  return `http://${getDevHost()}:${port}`;
}
