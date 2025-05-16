// src/services/api.ts
import axios from 'axios';
import { Platform } from 'react-native';

// --- Endereço Base da API ---
// Lembre-se: 10.0.2.2 para emulador Android, localhost para iOS, IP real para dispositivo físico
const ANDROID_EMULATOR_URL = 'http://10.0.2.2:4000/api'; // Adiciona /api ao final
const IOS_SIMULATOR_URL = 'http://localhost:4000/api';
// const DEVICE_URL = 'http://SEU_IP_LOCAL:3000/api';

const baseURL = Platform.OS === 'android' ? ANDROID_EMULATOR_URL : IOS_SIMULATOR_URL;
// const baseURL = DEVICE_URL; // Descomente e ajuste IP se usar dispositivo físico

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000, // Timeout de 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interceptadores (Adicionaremos o de Token depois) ---
// api.interceptors.request.use(async (config) => {
//   // Lógica para buscar token do keychain e adicionar ao header Authorization
//   return config;
// });

export default api;