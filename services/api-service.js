/**
 * Сервис для взаимодействия с API
 */

/**
 * Получение работ сообщества с фильтрацией и сортировкой
 * @param {Object} params - Параметры запроса
 * @returns {Promise<Object>} - Результат запроса
 */
export async function getCommunityArtworks(params = {}) {
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
  queryParams.append('limit', limit);
  queryParams.append('offset', offset);
  
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
 * @param {Object} params - Параметры запроса
 * @returns {Promise<HistoryResponse>} - Результат запроса
 */
export async function getUserHistory(params = {}) {
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
  queryParams.append('userId', userId);
  queryParams.append('limit', limit);
  queryParams.append('offset', offset);
  queryParams.append('filter', filter);
  if (search) queryParams.append('search', search);

  const response = await fetch(`/api/history?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Ошибка при получении истории генераций');
  }
  
  return response.json();
}

/**
 * Получение статистики генераций пользователя
 * @param {number} userId - ID пользователя
 * @param {string} timeRange - Временной диапазон (day, week, month, year)
 * @returns {Promise<Object>} - Объект со статистикой генераций
 */
export async function getUserStatistics(userId, timeRange = 'week') {
  if (!userId) {
    throw new Error('Необходимо указать ID пользователя');
  }

  const queryParams = new URLSearchParams();
  queryParams.append('userId', userId);
  queryParams.append('timeRange', timeRange);

  const response = await fetch(`/api/statistics?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Ошибка при получении статистики генераций');
  }
  
  return response.json();
}

/**
 * Удаление работы из истории
 * @param {number} artworkId - ID работы
 * @param {number} userId - ID пользователя
 * @returns {Promise<Object>} - Результат запроса
 */
export async function deleteArtworkFromHistory(artworkId, userId) {
  if (!artworkId || !userId) {
    throw new Error('Необходимо указать ID работы и ID пользователя');
  }

  const queryParams = new URLSearchParams();
  queryParams.append('artworkId', artworkId);
  queryParams.append('userId', userId);

  const response = await fetch(`/api/history?${queryParams.toString()}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при удалении работы');
  }
  
  return response.json();
}

/**
 * Получение коллекций и избранных работ пользователя
 * @param {number} userId - ID пользователя
 * @returns {Promise<Object>} - Результат запроса
 */
export async function getUserFavorites(userId) {
  if (!userId) {
    throw new Error('Необходимо указать ID пользователя');
  }

  const queryParams = new URLSearchParams();
  queryParams.append('userId', userId);

  const response = await fetch(`/api/favorites?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Ошибка при получении избранного');
  }
  
  return response.json();
}

/**
 * Создание новой коллекции
 * @param {Object} collectionData - Данные коллекции
 * @returns {Promise<Object>} - Результат запроса
 */
export async function createCollection(collectionData) {
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
 * @param {number} collectionId - ID коллекции
 * @param {number} artworkId - ID работы
 * @returns {Promise<Object>} - Результат запроса
 */
export async function addArtworkToCollection(collectionId, artworkId) {
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
 * @param {number} collectionId - ID коллекции
 * @returns {Promise<Object>} - Результат запроса
 */
export async function deleteCollection(collectionId) {
  if (!collectionId) {
    throw new Error('Необходимо указать ID коллекции');
  }

  const queryParams = new URLSearchParams();
  queryParams.append('collectionId', collectionId);

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
 * @param {number} collectionId - ID коллекции
 * @param {number} artworkId - ID работы
 * @returns {Promise<Object>} - Результат запроса
 */
export async function removeArtworkFromCollection(collectionId, artworkId) {
  if (!collectionId || !artworkId) {
    throw new Error('Необходимо указать ID коллекции и ID работы');
  }

  const queryParams = new URLSearchParams();
  queryParams.append('collectionId', collectionId);
  queryParams.append('artworkId', artworkId);

  const response = await fetch(`/api/favorites?${queryParams.toString()}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при удалении работы из коллекции');
  }
  
  return response.json();
}

/**
 * Добавление лайка к работе
 * @param {number} userId - ID пользователя
 * @param {number} artworkId - ID работы
 * @returns {Promise<Object>} - Результат запроса
 */
export async function likeArtwork(userId, artworkId) {
  if (!userId || !artworkId) {
    throw new Error('Необходимо указать ID пользователя и ID работы');
  }

  const response = await fetch('/api/artworks/like', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, artworkId })
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при добавлении лайка');
  }
  
  return response.json();
}

/**
 * Удаление лайка с работы
 * @param {number} userId - ID пользователя
 * @param {number} artworkId - ID работы
 * @returns {Promise<Object>} - Результат запроса
 */
export async function unlikeArtwork(userId, artworkId) {
  if (!userId || !artworkId) {
    throw new Error('Необходимо указать ID пользователя и ID работы');
  }

  const response = await fetch('/api/artworks/like', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, artworkId })
  });
  
  if (!response.ok) {
    throw new Error('Ошибка при удалении лайка');
  }
  
  return response.json();
}