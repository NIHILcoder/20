/**
 * Middleware для проверки аутентификации пользователей
 */

const jwt = require('jsonwebtoken');
const { NextResponse } = require('next/server');
const userModel = require('../../models/user');

/**
 * Проверяет токен аутентификации и добавляет информацию о пользователе в запрос
 * @param {Request} request - Объект запроса
 * @returns {Promise<Object>} - Объект с информацией о пользователе или ошибкой
 */
async function authenticateUser(request) {
  try {
    // Получение токена из cookie
    const authToken = request.cookies.get('auth_token')?.value;
    
    if (!authToken) {
      return { error: 'Требуется аутентификация', status: 401 };
    }
    
    // Верификация токена
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET || 'default_secret_key');
    
    if (!decoded || !decoded.userId) {
      return { error: 'Недействительный токен аутентификации', status: 401 };
    }
    
    try {
      // Получение информации о пользователе
      const user = await userModel.findUserById(decoded.userId);
      
      if (!user) {
        return { error: 'Пользователь не найден', status: 401 };
      }
      
      // Проверка наличия необходимых полей пользователя
      if (!user.id || !user.username) {
        console.error('Ошибка: неполные данные пользователя', user);
        return { error: 'Ошибка получения данных пользователя', status: 500 };
      }
      
      // Возвращение информации о пользователе
      return { user };
    } catch (dbError) {
      // Отдельная обработка ошибок базы данных
      console.error('Ошибка базы данных при получении пользователя:', dbError);
      console.error('Детали ошибки:', dbError.message);
      console.error('Стек вызовов:', dbError.stack);
      return { error: 'Ошибка базы данных при получении данных пользователя', status: 500 };
    }
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return { error: 'Недействительный или истекший токен', status: 401 };
    }
    
    console.error('Ошибка аутентификации:', error);
    console.error('Детали ошибки:', error.message);
    console.error('Стек вызовов:', error.stack);
    return { error: 'Ошибка сервера при аутентификации', status: 500 };
  }
}

/**
 * Middleware для защиты API-маршрутов
 * @param {Function} handler - Обработчик запроса
 * @returns {Function} - Обертка для обработчика запроса
 */
function withAuth(handler) {
  return async (request, ...args) => {
    const authResult = await authenticateUser(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    
    // Добавление информации о пользователе в запрос
    request.user = authResult.user;
    
    // Вызов обработчика запроса
    return handler(request, ...args);
  };
}

module.exports = {
  authenticateUser,
  withAuth
};