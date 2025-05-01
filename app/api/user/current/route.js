import { NextResponse } from 'next/server';
import { withAuth } from '../../../../middleware/auth';

/**
 * Обработчик GET-запроса для получения информации о текущем пользователе
 */
async function getHandler(request) {
  try {
    // Информация о пользователе добавляется в запрос middleware аутентификации
    const user = request.user;
    
    // Возвращаем информацию о пользователе
    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      bio: user.bio,
      credits: user.credits,
      created_at: user.created_at,
      updated_at: user.updated_at,
      is_verified: user.is_verified
    });
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при получении данных пользователя' },
      { status: 500 }
    );
  }
}

// Экспортируем обработчик GET-запроса с middleware аутентификации
export const GET = withAuth(getHandler);