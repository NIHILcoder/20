/**
 * Файл с локализованными сообщениями для API-эндпоинтов
 */

export const apiTranslations = {
  en: {
    // Общие сообщения
    'api.error.general': 'An error occurred while processing your request',
    'api.error.not_found': 'Resource not found',
    'api.error.invalid_request': 'Invalid request',
    'api.error.unauthorized': 'Unauthorized access',
    
    // Сообщения для коллекций
    'api.collection.error.id_required': 'Collection ID is required',
    'api.collection.error.not_found': 'Collection not found',
    'api.collection.error.update_failed': 'Failed to update collection',
    'api.collection.error.name_required': 'Collection name is required',
    'api.collection.error.user_id_required': 'User ID is required',
    'api.collection.error.create_failed': 'Failed to create collection',
    'api.collection.error.delete_failed': 'Failed to delete collection',
    
    // Сообщения для элементов коллекции
    'api.collection_items.error.collection_id_required': 'Collection ID is required',
    'api.collection_items.error.artwork_id_required': 'Artwork ID is required',
    'api.collection_items.error.add_failed': 'Failed to add artwork to collection',
    'api.collection_items.error.remove_failed': 'Failed to remove artwork from collection',
    'api.collection_items.error.get_failed': 'Failed to get collection items',
    
    // Сообщения для избранного
    'api.favorites.error.user_id_required': 'User ID is required',
    'api.favorites.error.get_failed': 'Failed to get favorites data'
  },
  ru: {
    // Общие сообщения
    'api.error.general': 'Произошла ошибка при обработке вашего запроса',
    'api.error.not_found': 'Ресурс не найден',
    'api.error.invalid_request': 'Некорректный запрос',
    'api.error.unauthorized': 'Неавторизованный доступ',
    
    // Сообщения для коллекций
    'api.collection.error.id_required': 'Необходимо указать ID коллекции',
    'api.collection.error.not_found': 'Коллекция не найдена',
    'api.collection.error.update_failed': 'Произошла ошибка при обновлении коллекции',
    'api.collection.error.name_required': 'Необходимо указать название коллекции',
    'api.collection.error.user_id_required': 'Необходимо указать ID пользователя',
    'api.collection.error.create_failed': 'Произошла ошибка при создании коллекции',
    'api.collection.error.delete_failed': 'Произошла ошибка при удалении коллекции',
    
    // Сообщения для элементов коллекции
    'api.collection_items.error.collection_id_required': 'Необходимо указать ID коллекции',
    'api.collection_items.error.artwork_id_required': 'Необходимо указать ID работы',
    'api.collection_items.error.add_failed': 'Произошла ошибка при добавлении работы в коллекцию',
    'api.collection_items.error.remove_failed': 'Произошла ошибка при удалении работы из коллекции',
    'api.collection_items.error.get_failed': 'Произошла ошибка при получении элементов коллекции',
    
    // Сообщения для избранного
    'api.favorites.error.user_id_required': 'Необходимо указать ID пользователя',
    'api.favorites.error.get_failed': 'Произошла ошибка при получении данных избранного'
  }
};

/**
 * Функция для получения локализованного сообщения
 * @param {string} key - Ключ сообщения
 * @param {string} language - Язык (en или ru)
 * @returns {string} - Локализованное сообщение
 */
export function getApiMessage(key, language = 'ru') {
  // Проверяем, существует ли ключ для указанного языка
  if (apiTranslations[language] && apiTranslations[language][key]) {
    return apiTranslations[language][key];
  }
  
  // Если ключ не найден для указанного языка, пробуем найти его в английском языке
  if (apiTranslations.en && apiTranslations.en[key]) {
    return apiTranslations.en[key];
  }
  
  // Если ключ не найден вообще, возвращаем сам ключ
  return key;
}

/**
 * Функция для определения языка из заголовков запроса
 * @param {Request} request - Объект запроса
 * @returns {string} - Код языка (en или ru)
 */
export function getLanguageFromRequest(request) {
  try {
    // Пытаемся получить язык из заголовка Accept-Language
    const acceptLanguage = request.headers.get('Accept-Language') || '';
    
    // Если заголовок содержит ru, возвращаем ru, иначе en
    if (acceptLanguage.includes('ru')) {
      return 'ru';
    }
    
    return 'en';
  } catch (error) {
    // В случае ошибки возвращаем русский язык по умолчанию
    return 'ru';
  }
}

// Экспорт уже выполнен через export const/function