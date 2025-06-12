// services/bfl-api.ts
import axios from 'axios';


export class BflApiService {
  [x: string]: any;
  async generateWithFluxPro11(params: any) {
    try {
      const response = await axios.post('/api/bfl-proxy', {
        endpoint: '/v1/flux-pro-1.1',
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error generating image with FLUX Pro 1.1:', error);
      throw error;
    }
  }

  async generateWithFluxUltra(params: any) {
    try {
      const response = await axios.post('/api/bfl-proxy', {
        endpoint: '/v1/flux-pro-1.1-ultra',
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error generating image with FLUX Ultra:', error);
      throw error;
    }
  }

  async fillWithFluxPro(params: any) {
    try {
      const response = await axios.post('/api/bfl-proxy', {
        endpoint: '/v1/flux-pro-1.0-fill',
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error filling image with FLUX Pro:', error);
      throw error;
    }
  }

  async expandWithFluxPro(params: any) {
    try {
      const response = await axios.post('/api/bfl-proxy', {
        endpoint: '/v1/flux-pro-1.0-expand',
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error expanding image with FLUX Pro:', error);
      throw error;
    }
  }

  async getResult(id: string) {
    try {
      const response = await axios.get(`/api/bfl-result?id=${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching result:', error);
      throw error;
    }
  }
}


export const bflApiService = new BflApiService();