import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Обработчик POST-запроса для публикации изображения в сообщество
 * @param {NextRequest} request - Объект запроса Next.js
 */
export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию пользователя
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
    
    if (!session?.user) {
      console.log('Ошибка авторизации: сессия отсутствует');
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
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
      sessionUserId: session.user.id, 
      requestUserId: userId,
      imageUrl: imageUrl.substring(0, 50) + '...' // Логируем только часть URL для краткости
    });

    // Проверяем, что ID пользователя в запросе соответствует ID авторизованного пользователя
    // Приводим оба значения к строке для корректного сравнения
    if (session.user.id?.toString() !== userId?.toString()) {
      console.log('Ошибка доступа: несоответствие ID пользователя', {
        sessionUserId: session.user.id,
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
  } catch (error) {
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