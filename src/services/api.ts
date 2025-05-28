import axios from 'axios';
import { Platform } from 'react-native';
import { DEBUG_MODE, API_CONFIG } from '../config';

// Mock data imports
import categoriesData from './mockData/categories.json';
import itemsData from './mockData/items.json';
import ordersData from './mockData/orders.json';

const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (DEBUG_MODE) {
  api.interceptors.request.use(async (config) => {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    const url = config.url?.toLowerCase();
    
    // Mock responses based on endpoint
    if (url?.includes('/categories')) {
      return Promise.resolve({
        data: categoriesData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    }
    
    if (url?.includes('/items')) {
      return Promise.resolve({
        data: itemsData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    }
    
    if (url?.includes('/orders')) {
      return Promise.resolve({
        data: ordersData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    }

    return config;
  });
}

export default api;