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
      }
    };
    
    const response = await fetch(url, fetchOptions);
    
    // Получаем данные ответа
    const data = await response.json();
    
    // Проверяем статус ответа
    if (!response.ok) {
      // Если сервер вернул ошибку, выбрасываем исключение с сообщением
      throw new Error(data.error || `Ошибка ${response.status}: ${response.statusText}`);
    }
    
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