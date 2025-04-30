/**
 * API-маршрут для регистрации пользователей
 */

import { NextResponse } from 'next/server';
import * as userModel from '../../../../models/user';

/**
 * Обработчик POST-запроса для регистрации пользователя
 */
export async function POST(request) {
  try {
    // Получение данных из запроса
    const { username, email, password, displayName } = await request.json();
    
    // Проверка обязательных полей
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Необходимо указать имя пользователя, email и пароль' },
        { status: 400 }
      );
    }
    
    // Проверка, существует ли пользователь с таким именем или email
    const existingUser = await userModel.findUserByUsernameOrEmail(username) || 
                         await userModel.findUserByUsernameOrEmail(email);
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким именем или email уже существует' },
        { status: 409 }
      );
    }
    
    // Создание нового пользователя
    const newUser = await userModel.createUser({
      username,
      email,
      password,
      displayName
    });
    
    // Удаление пароля из ответа
    delete newUser.password_hash;
    
    return NextResponse.json(
      { message: 'Пользователь успешно зарегистрирован', user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Ошибка при регистрации пользователя:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при регистрации пользователя' },
      { status: 500 }
    );
  }
}