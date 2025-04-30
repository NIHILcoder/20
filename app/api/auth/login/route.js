/**
 * API-маршрут для входа пользователей
 */

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import * as userModel from '../../../../models/user';

/**
 * Обработчик POST-запроса для входа пользователя
 */
export async function POST(request) {
  try {
    // Получение данных из запроса
    const { usernameOrEmail, password } = await request.json();
    
    // Проверка обязательных полей
    if (!usernameOrEmail || !password) {
      return NextResponse.json(
        { error: 'Необходимо указать имя пользователя/email и пароль' },
        { status: 400 }
      );
    }
    
    // Поиск пользователя
    const user = await userModel.findUserByUsernameOrEmail(usernameOrEmail);
    
    // Если пользователь не найден
    if (!user) {
      return NextResponse.json(
        { error: 'Неверное имя пользователя/email или пароль' },
        { status: 401 }
      );
    }
    
    // Проверка пароля
    const isPasswordValid = await userModel.verifyPassword(password, user.password_hash);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Неверное имя пользователя/email или пароль' },
        { status: 401 }
      );
    }
    
    // Создание JWT токена
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'default_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    // Подготовка данных пользователя для ответа
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url
    };
    
    // Установка cookie с токеном
    const response = NextResponse.json(
      { message: 'Вход выполнен успешно', user: userData },
      { status: 200 }
    );
    
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 дней
    });
    
    return response;
  } catch (error) {
    console.error('Ошибка при входе пользователя:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при входе в систему' },
      { status: 500 }
    );
  }
}