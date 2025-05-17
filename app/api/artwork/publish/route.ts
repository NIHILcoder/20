import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию пользователя
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    // Получаем данные из тела запроса
    const { userId, imageUrl, prompt, title, description, model, parameters } = await request.json();

    // Проверяем, что ID пользователя в запросе соответствует ID авторизованного пользователя
    if (session.user.id !== userId.toString()) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
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
      const result = await db.query(
        'UPDATE artworks SET is_public = true, updated_at = NOW() WHERE id = $1 RETURNING id',
        [existingArtwork.rows[0].id]
      );
      artworkId = result.rows[0].id;
    } else {
      // Создаем новую запись о работе с флагом is_public = true
      const result = await db.query(
        'INSERT INTO artworks (user_id, title, description, image_url, prompt, model, parameters, is_public) VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING id',
        [userId, title, description, imageUrl, prompt, model, JSON.stringify(parameters)]
      );
      artworkId = result.rows[0].id;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Работа успешно опубликована', 
      artworkId 
    });
  } catch (error) {
    console.error('Ошибка при публикации работы:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}