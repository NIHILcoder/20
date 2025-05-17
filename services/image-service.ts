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

interface PublishResponse {
  success: boolean;
  artworkId?: number;
  error?: string;
}

export class ImageService {
  async saveImage(imageData: string, prompt: string, userId?: number): Promise<SaveImageResponse> {
    try {
      // Генерируем уникальное имя файла с датой и частью промпта
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitizedPrompt = prompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `image_${timestamp}_${sanitizedPrompt}.png`;
      
      const response = await axios.post('/api/save-image', {
        imageData,
        filename,
        prompt,
        userId // Добавляем userId в запрос
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

  // Новая функция для публикации изображения в сообщество
  async publishToCommunity(data: {
    userId: number;
    imageUrl: string;
    prompt: string;
    title?: string;
    description?: string;
    model?: string;
    parameters?: any;
  }): Promise<PublishResponse> {
    try {
      const response = await axios.post('@/api/artwork/publish', {
        userId: data.userId,
        imageUrl: data.imageUrl,
        prompt: data.prompt,
        title: data.title || data.prompt.substring(0, 100),
        description: data.description || data.prompt,
        model: data.model || 'flux_realistic',
        parameters: data.parameters || {}
      });
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при публикации изображения в сообщество:', error);
      return { success: false, error: 'Не удалось опубликовать изображение в сообщество' };
    }
  }
}

export const imageService = new ImageService();