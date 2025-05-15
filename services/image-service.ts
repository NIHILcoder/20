// services/image-service.ts
import axios from 'axios';

interface SaveImageResponse {
  success: boolean;
  path?: string;
  error?: string;
}

interface GetImagesResponse {
  images: Array<{
    name: string;
    path: string;
    url: string;
    prompt?: string;
    created: string;
  }>;
  error?: string;
}

export class ImageService {
  async saveImage(imageData: string, prompt: string): Promise<SaveImageResponse> {
    try {
      // Генерируем уникальное имя файла с датой и частью промпта
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitizedPrompt = prompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `image_${timestamp}_${sanitizedPrompt}.png`;
      
      const response = await axios.post('/api/save-image', {
        imageData,
        filename,
        prompt
      });
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при сохранении изображения:', error);
      return { success: false, error: 'Не удалось сохранить изображение' };
    }
  }
  
  async getImages(): Promise<GetImagesResponse> {
    try {
      const response = await axios.get('/api/get-images');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении списка изображений:', error);
      return { images: [], error: 'Не удалось получить список изображений' };
    }
  }
}

export const imageService = new ImageService();