/**
 * Сервис для работы с API промптов
 */

import { fetchWithErrorHandling } from './api-helpers';

export interface Prompt {
  id: string;
  title: string;
  text: string;
  category: string;
  tags: string[];
  favorite: boolean;
  rating: number;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  negative?: string;
  parameters?: {
    [key: string]: any;
  };
  notes?: string;
  isPublic: boolean;
  author?: string;
}

export interface PaginationData {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface PromptsResponse {
  prompts: Prompt[];
  pagination: PaginationData;
}

export interface PromptFilters {
  userId: number;
  category?: string;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  favorites?: boolean;
  tab?: 'my-prompts' | 'community';
}

/**
 * Получение списка промптов с фильтрацией и пагинацией
 */
export async function getPrompts(filters: PromptFilters): Promise<PromptsResponse> {
  const params = new URLSearchParams();
  
  // Добавляем все параметры фильтрации в URL
  params.append('userId', filters.userId.toString());
  
  if (filters.category && filters.category !== 'all') {
    params.append('category', filters.category);
  }
  
  if (filters.search) {
    params.append('search', filters.search);
  }
  
  if (filters.sortBy) {
    params.append('sortBy', filters.sortBy);
  }
  
  if (filters.sortDirection) {
    params.append('sortDirection', filters.sortDirection);
  }
  
  if (filters.limit) {
    params.append('limit', filters.limit.toString());
  }
  
  if (filters.offset) {
    params.append('offset', filters.offset.toString());
  }
  
  if (filters.favorites) {
    params.append('favorites', 'true');
  }
  
  if (filters.tab) {
    params.append('tab', filters.tab);
  }
  
  return fetchWithErrorHandling(`/api/prompts?${params.toString()}`);
}

/**
 * Создание нового промпта
 */
export async function createPrompt(promptData: {
  userId: number;
  title: string;
  text: string;
  category?: string;
  tags?: string[];
  negative?: string;
  notes?: string;
  isPublic?: boolean;
  parameters?: any;
}): Promise<Prompt> {
  return fetchWithErrorHandling('/api/prompts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(promptData),
  });
}

/**
 * Обновление существующего промпта
 */
export async function updatePrompt(promptData: {
  promptId: string;
  userId: number;
  title: string;
  text: string;
  category?: string;
  tags?: string[];
  negative?: string;
  notes?: string;
  isPublic?: boolean;
  parameters?: any;
}): Promise<Prompt> {
  return fetchWithErrorHandling('/api/prompts', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(promptData),
  });
}

/**
 * Удаление промпта
 */
export async function deletePrompt(promptId: string, userId: number): Promise<{ success: boolean }> {
  return fetchWithErrorHandling(`/api/prompts?promptId=${promptId}&userId=${userId}`, {
    method: 'DELETE',
  });
}

/**
 * Переключение статуса избранного для промпта
 */
export async function toggleFavoritePrompt(promptId: string, userId: number): Promise<{ id: string; favorite: boolean }> {
  return fetchWithErrorHandling(`/api/prompts?promptId=${promptId}&userId=${userId}&action=toggle-favorite`, {
    method: 'DELETE',
  });
}

/**
 * Получение категорий промптов
 */
export async function getPromptCategories(): Promise<{ id: string; name: string; count: number; color?: string }[]> {
  const response = await fetchWithErrorHandling('/api/prompts/categories');
  // Добавляем категорию "Все промпты" в начало списка
  const totalCount = response.reduce((sum: number, cat: any) => sum + cat.count, 0);
  return [{ id: "all", name: "Все промпты", count: totalCount }, ...response];
}

/**
 * Получение популярных тегов
 */
export async function getPopularTags(): Promise<{ id: string; name: string; count: number }[]> {
  return fetchWithErrorHandling('/api/prompts/tags');
}