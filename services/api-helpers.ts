/**
 * Вспомогательные функции для работы с API
 */

/**
 * Обертка для fetch с обработкой ошибок
 * @param url URL для запроса
 * @param options Опции запроса
 * @returns Результат запроса в формате JSON
 */
export async function fetchWithErrorHandling(url: string, options?: RequestInit) {
  try {
    // Добавляем credentials: 'include' для передачи куки с сессией
    const fetchOptions: RequestInit = {
      ...options,
      credentials: 'include', // Важно для передачи куки аутентификации
      headers: {
        ...options?.headers,
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Отключаем кеширование для запросов аутентификации
    };
    
    const response = await fetch(url, fetchOptions);
    
    // Проверяем статус ответа перед попыткой получить JSON
    if (!response.ok) {
      // Специальная обработка для 401 Unauthorized
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      
      // Для других ошибок пытаемся получить детали из тела ответа
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `Ошибка ${response.status}: ${response.statusText}`);
      } catch (parseError) {
        // Если не удалось распарсить JSON, используем статус код
        throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
      }
    }
    
    // Получаем данные ответа только для успешных запросов
    const data = await response.json();
    return data;
  } catch (error: any) {
    // Логируем ошибку
    console.error(`Ошибка при запросе ${url}:`, error);
    
    // Перебрасываем ошибку дальше
    throw error;
  }
}

/**
 * Форматирование даты для отображения
 * @param dateString Строка с датой
 * @param locale Локаль для форматирования
 * @returns Отформатированная строка даты
 */
export function formatDate(dateString: string, locale: string = 'ru-RU') {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}