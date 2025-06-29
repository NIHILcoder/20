/**
 * Сервис для взаимодействия с API
 */

/**
 * Интерфейсы для типизации данных
 */
export interface Artwork {
  parameters: {};
  id: number;
  title: string;
  prompt: string;
  image_url: string;
  created_at: string;
  is_public: boolean;
  is_liked: boolean;
  is_saved: boolean;
  likes_count: number;
  model: string;
  user_id?: number;
  username?: string;
  display_name?: string;
  avatar_url?: string;
}

export interface Collection {
  id: number;
  name: string;
  description: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
  item_count: number;
  cover_image: string | null;
}

export interface CollectionItem {
  id: number;
  artwork_id: number;
  collection_id: number;
  added_at: string;
  artwork: {
    id: number;
    title: string;
    description: string;
    image_url: string;
    user_id: number;
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export interface Favorite {
  id: number;
  title: string;
  image_url: string;
  user_id: number;
  username: string;
  display_name: string;
  avatar_url: string;
  favorited_at: string;
}

export interface GroupedArtworks {
  [key: string]: Artwork[];
}

export interface PaginationData {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface HistoryResponse {
  artworks: Artwork[];
  groupedArtworks: GroupedArtworks;
  pagination: PaginationData;
}

export interface FavoritesResponse {
  collections: Collection[];
  favorites: Favorite[];
}

/**
 * Получение работ сообщества с фильтрацией и сортировкой
 * @param params - Параметры запроса
 * @returns - Результат запроса
 */
export async function getCommunityArtworks(params: {
  limit?: number;
  offset?: number;
  category?: string;
  sortBy?: string;
  search?: string;
  modelType?: string;
  timeRange?: string;
} = {}) {
  const {
    limit = 10,
    offset = 0,
    category = 'all',
    sortBy = 'newest',
    search = '',
    modelType = '',
    timeRange = ''
  } = params;

  const queryParams = new URLSearchParams();
  queryParams.append('limit', limit.toString());
  queryParams.append('offset', offset.toString());
  
  if (category !== 'all') queryParams.append('category', category);
  if (sortBy) queryParams.append('sortBy', sortBy);
  if (search) queryParams.append('search', search);
  if (modelType && modelType !== 'all') queryParams.append('modelType', modelType);
  if (timeRange && timeRange !== 'all') queryParams.append('timeRange', timeRange);

  const response = await fetch(`/api/community?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Ошибка при получении работ сообщества');
  }
  
  return response.json();
}

/**
 * Получение истории генераций пользователя
 * @param params - Параметры запроса
 * @returns - Результат запроса
 */
export async function getUserHistory(params: {
  userId: number;
  limit?: number;
  offset?: number;
  filter?: string;
  search?: string;
}): Promise<HistoryResponse> {
  const {
    userId,
    limit = 20,
    offset = 0,
    filter = 'all',
    search = ''
  } = params;

  if (!userId) {
    throw new Error('Необходимо указать ID пользователя');
  }

  const queryParams = new URLSearchParams();
  queryParams.append('userId', userId.toString());
  queryParams.append('limit', limit.toString());
  queryParams.append('offset', offset.toString());
  queryParams.append('filter', filter);
  if (search) queryParams.append('search', search);

  const response = await fetch(`/api/history?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Ошибка при получении истории генераций');
  }
  
  return response.json();
}

/**
 * Удаление работы из истории
 * @param artworkId - ID работы
 * @param userId - ID пользователя
 * @returns - Результат запроса
 */
export async function deleteArtworkFromHistory(artworkId: number, userId: number): Promise<void> {
  if (!artworkId || !userId) {
    throw new Error('Необходимо указать ID работы и ID пользователя');
  }

  const queryParams = new URLSearchParams();
  queryParams.append('artworkId', artworkId.toString());
  queryParams.append('userId', userId.toString());

  const response = await fetch(`/api/history?${queryParams.toString()}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при удалении работы');
  }
}

/**
 * Получение коллекций и избранных работ пользователя
 * @param userId - ID пользователя
 * @returns - Результат запроса
 */
export async function getUserFavorites(userId: number): Promise<FavoritesResponse> {
  if (!userId) {
    throw new Error('Необходимо указать ID пользователя');
  }

  const queryParams = new URLSearchParams();
  queryParams.append('userId', userId.toString());

  const response = await fetch(`/api/favorites?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Ошибка при получении избранного');
  }
  
  return response.json();
}

/**
 * Создание новой коллекции
 * @param collectionData - Данные коллекции
 * @returns - Результат запроса
 */
export async function createCollection(collectionData: {
  userId: number;
  name: string;
  description?: string;
}): Promise<Collection> {
  const { userId, name, description } = collectionData;
  
  if (!userId || !name) {
    throw new Error('Необходимо указать ID пользователя и название коллекции');
  }

  const response = await fetch('/api/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, name, description })
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при создании коллекции');
  }
  
  return response.json();
}

/**
 * Добавление работы в коллекцию
 * @param collectionId - ID коллекции
 * @param artworkId - ID работы
 * @returns - Результат запроса
 */
export async function addArtworkToCollection(collectionId: number, artworkId: number): Promise<any> {
  if (!collectionId || !artworkId) {
    throw new Error('Необходимо указать ID коллекции и ID работы');
  }

  const response = await fetch('/api/favorites', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ collectionId, artworkId })
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при добавлении работы в коллекцию');
  }
  
  return response.json();
}

/**
 * Удаление коллекции
 * @param collectionId - ID коллекции
 * @returns - Результат запроса
 */
export async function deleteCollection(collectionId: number): Promise<any> {
  if (!collectionId) {
    throw new Error('Необходимо указать ID коллекции');
  }

  const queryParams = new URLSearchParams();
  queryParams.append('collectionId', collectionId.toString());

  const response = await fetch(`/api/favorites?${queryParams.toString()}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при удалении коллекции');
  }
  
  return response.json();
}

/**
 * Удаление работы из коллекции
 * @param collectionId - ID коллекции
 * @param artworkId - ID работы
 * @returns - Результат запроса
 */
export async function removeArtworkFromCollection(collectionId: number, artworkId: number): Promise<any> {
  if (!collectionId || !artworkId) {
    throw new Error('Необходимо указать ID коллекции и ID работы');
  }

  const queryParams = new URLSearchParams();
  queryParams.append('collectionId', collectionId.toString());
  queryParams.append('artworkId', artworkId.toString());

  const response = await fetch(`/api/favorites?${queryParams.toString()}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при удалении работы из коллекции');
  }
  
  return response.json();
}

/**
 * Получение элементов коллекции
 * @param collectionId - ID коллекции
 * @returns - Результат запроса
 */
export async function getCollectionItems(collectionId: number): Promise<CollectionItem[]> {
  if (!collectionId) {
    throw new Error('Необходимо указать ID коллекции');
  }

  const queryParams = new URLSearchParams();
  queryParams.append('collectionId', collectionId.toString());

  const response = await fetch(`/api/collection-items?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Ошибка при получении элементов коллекции');
  }
  
  return response.json();
}