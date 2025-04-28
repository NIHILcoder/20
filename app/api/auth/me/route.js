/**
 * API-маршрут для получения информации о текущем пользователе
 */

import { NextResponse } from 'next/server';
const { withAuth } = require('../../../../middleware/auth');

/**
 * Обработчик GET-запроса для получения информации о текущем пользователе
 */
async function getHandler(request) {
  try {
    // Информация о пользователе добавляется в запрос middleware аутентификации
    const user = request.user;
    
    // Проверка наличия данных пользователя
    if (!user) {
      console.error('Ошибка: данные пользователя отсутствуют в запросе');
      return NextResponse.json(
        { error: 'Данные пользователя не найдены' },
        { status: 500 }
      );
    }
    
    // Подготовка данных пользователя для ответа
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
      bio: user.bio,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
      isVerified: user.is_verified,
      credits: user.credits || 1000 // Добавляем кредиты из базы данных
    };
    
    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    // Подробное логирование ошибки для отладки
    console.error('Ошибка при получении информации о пользователе:', error);
    console.error('Детали ошибки:', error.message);
    console.error('Стек вызовов:', error.stack);
    
    return NextResponse.json(
      { error: 'Произошла ошибка при получении информации о пользователе' },
      { status: 500 }
    );
  }
}

// Оборачиваем обработчик в middleware аутентификации
export const GET = withAuth(getHandler);