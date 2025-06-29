import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import jwt from 'jsonwebtoken';
import * as userModel from '@/models/user';

// Определение типа для пользователя из модели
interface User {
  id: number | string;
  display_name?: string;
  username?: string;
  email?: string;
  [key: string]: any;
}

// Определение интерфейса для JWT payload
interface JWTPayload extends jwt.JwtPayload {
  userId: string | number;
  // Добавьте другие поля, которые содержит ваш токен
}

// Определение типов для результата аутентификации
type AuthError = {
  error: string;
  status: number;
  user?: undefined;
};

type AuthSuccess = {
  user: {
    id: number | string;
    display_name?: string;
    username?: string;
    email?: string;
    [key: string]: any;
  };
  error?: undefined;
  status?: undefined;
};

type AuthResult = AuthError | AuthSuccess;

// Функция для проверки JWT-токена
async function checkAuthToken(request: NextRequest): Promise<AuthResult> {
  try {
    // Получение токена из cookie
    const authToken = request.cookies.get('auth_token')?.value;
    
    if (!authToken) {
      return { error: 'Требуется аутентификация', status: 401 };
    }
    
    // Верификация токена с явным указанием типа
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET || 'default_secret_key') as JWTPayload;
    
    if (!decoded || !decoded.userId) {
      return { error: 'Недействительный токен аутентификации', status: 401 };
    }
    
    try {
      // Получение информации о пользователе
      // Преобразуем userId в число, если findUserById ожидает number
      const numericUserId = typeof decoded.userId === 'string' ? parseInt(decoded.userId, 10) : decoded.userId;
      
      const user = await userModel.findUserById(numericUserId) as User;
      
      if (!user) {
        return { error: 'Пользователь не найден', status: 401 };
      }
      
      // Возвращение информации о пользователе в структуре, соответствующей AuthSuccess
      return { 
        user: {
          id: user.id,
          display_name: user.display_name,
          username: user.username,
          email: user.email,
          // Другие необходимые поля можно добавить здесь
        } 
      };
    } catch (dbError) {
      console.error('Ошибка базы данных при получении пользователя:', dbError);
      return { error: 'Ошибка базы данных при получении данных пользователя', status: 500 };
    }
  } catch (error: unknown) {
    if (error instanceof Error && (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')) {
      return { error: 'Недействительный или истекший токен', status: 401 };
    }
    
    console.error('Ошибка аутентификации JWT:', error);
    return { error: 'Ошибка сервера при аутентификации', status: 500 };
  }
}

/**
 * Обработчик POST-запроса для публикации изображения в сообщество
 * @param {NextRequest} request - Объект запроса Next.js
 */
export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию пользователя через NextAuth
    const session = await getServerSession(authOptions);
    
    // Подробное логирование для отладки
    console.log('Данные сессии:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id || 'отсутствует',
      headers: {
        cookie: request.headers.get('cookie') || 'отсутствует',
        csrf: request.headers.get('x-csrf-token') || 'отсутствует'
      }
    });
    
    // Если нет сессии NextAuth, проверяем JWT-токен
    let user = session?.user;
    
    if (!user) {
      console.log('Сессия NextAuth отсутствует, проверяем JWT-токен...');
      const authResult = await checkAuthToken(request);
      
      if (authResult.error) {
        console.log('Ошибка авторизации JWT:', authResult.error);
        return NextResponse.json(
          { error: 'Необходима авторизация' },
          { status: authResult.status }
        );
      }
      
      // Проверяем наличие user в authResult
      if (!authResult.user) {
        console.log('Ошибка: authResult.user отсутствует');
        return NextResponse.json(
          { error: 'Ошибка авторизации' },
          { status: 500 }
        );
      }
      
      user = {
        id: authResult.user.id.toString(),
        name: authResult.user.display_name || authResult.user.username,
        email: authResult.user.email
      };
      
      console.log('Пользователь авторизован через JWT:', user.id);
    }

    // Получаем данные из тела запроса
    const { userId, imageUrl, prompt, title, description, model, parameters } = await request.json();
    
    if (!userId || !imageUrl) {
      return NextResponse.json(
        { error: 'Отсутствуют обязательные параметры' },
        { status: 400 }
      );
    }

    console.log('Запрос на публикацию работы:', { 
      sessionUserId: user.id, 
      requestUserId: userId,
      imageUrl: imageUrl.substring(0, 50) + '...' // Логируем только часть URL для краткости
    });

    // Проверяем, что ID пользователя в запросе соответствует ID авторизованного пользователя
    // Приводим оба значения к строке для корректного сравнения
    if (user.id?.toString() !== userId?.toString()) {
      console.log('Ошибка доступа: несоответствие ID пользователя', {
        sessionUserId: user.id,
        requestUserId: userId
      });
      
      return NextResponse.json(
        { error: 'Доступ запрещен: несоответствие ID пользователя' },
        { status: 403 }
      );
    }

    // Проверяем, существует ли уже эта работа
    const existingArtwork = await db.query(
      'SELECT id FROM artworks WHERE user_id = $1 AND image_url = $2',
      [userId, imageUrl]
    );

    let artworkId;

    if (existingArtwork.rows.length > 0) {
      // Если работа существует, обновляем её статус на публичный
      console.log('Обновление существующей работы:', existingArtwork.rows[0].id);
      
      const result = await db.query(
        'UPDATE artworks SET is_public = true, updated_at = NOW() WHERE id = $1 RETURNING id',
        [existingArtwork.rows[0].id]
      );
      artworkId = result.rows[0].id;
    } else {
      // Создаем новую запись о работе с флагом is_public = true
      console.log('Создание новой публичной работы');
      
      // Подготовка параметров - обеспечиваем, что параметры будут в формате JSON
      const parametersJson = typeof parameters === 'string' 
        ? parameters 
        : JSON.stringify(parameters || {});
      
      const result = await db.query(
        'INSERT INTO artworks (user_id, title, description, image_url, prompt, model, parameters, is_public) VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING id',
        [
          userId, 
          title || prompt?.substring(0, 100) || 'Без названия', 
          description || prompt || 'Без описания', 
          imageUrl, 
          prompt || '', 
          model || 'default', 
          parametersJson
        ]
      );
      
      artworkId = result.rows[0].id;
    }

    console.log('Работа успешно опубликована:', artworkId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Работа успешно опубликована', 
      artworkId 
    });
  } catch (error: unknown) {
    // Подробное логирование ошибки
    console.error('Ошибка при публикации работы:', error);
    
    if (error instanceof Error) {
      console.error('Детали ошибки:', error.message);
      console.error('Стек вызовов:', error.stack);
    }
    
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера при публикации работы', details: error instanceof Error ? error.message : 'Неизвестная ошибка' },
      { status: 500 }
    );
  }
}