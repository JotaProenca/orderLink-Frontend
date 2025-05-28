export const DEBUG_MODE = true; // Flag para ativar/desativar o modo debug

export const API_CONFIG = {
  baseURL: DEBUG_MODE ? '/mock-api' : 'http://localhost:4000/api',
  timeout: 10000,
};