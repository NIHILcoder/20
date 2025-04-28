/**
 * API-маршрут для выхода пользователя из системы
 */

import { NextResponse } from 'next/server';

/**
 * Обработчик POST-запроса для выхода пользователя из системы
 */
export async function POST(request) {
  try {
    // Создаем ответ
    const response = NextResponse.json(
      { message: 'Выход выполнен успешно' },
      { status: 200 }
    );
    
    // Очищаем куки с токеном аутентификации
    response.cookies.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0 // Устанавливаем срок действия в 0 для немедленного удаления
    });
    
    return response;
  } catch (error) {
    console.error('Ошибка при выходе из системы:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при выходе из системы' },
      { status: 500 }
    );
  }
}