// src/utils/fetchAPI.js
import API_CONFIG from '../config/api';

export const apiClient = {
  async request(url, options = {}) {
    const fullURL = `${API_CONFIG.baseURL}${url}`;
    
    const config = {
      ...API_CONFIG.fetchConfig,
      ...options,
      headers: {
        ...API_CONFIG.fetchConfig.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(fullURL, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  },

  // Các method tiện ích
  post(url, data) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  get(url) {
    return this.request(url, {
      method: 'GET',
    });
  },

  put(url, data) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(url) {
    return this.request(url, {
      method: 'DELETE',
    });
  }
};