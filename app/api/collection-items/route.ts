import { NextResponse } from 'next/server';
import db from '@/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    // Получаем параметры запроса
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');

    // Проверяем авторизацию пользователя
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Необходимо указать ID коллекции' },
        { status: 400 }
      );
    }

    // Проверяем, принадлежит ли коллекция текущему пользователю
    const collectionCheck = await db.query(
      'SELECT user_id FROM collections WHERE id = $1',
      [collectionId]
    );

    if (collectionCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Коллекция не найдена' },
        { status: 404 }
      );
    }

    // Если пользователь не владелец коллекции и коллекция не публичная, запрещаем доступ
    if (collectionCheck.rows[0].user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    // Получаем элементы коллекции с информацией о произведениях искусства
    const result = await db.query(
      `SELECT ci.id, ci.collection_id, ci.artwork_id, ci.added_at,
        a.id as artwork_id, a.title, a.description, a.image_url, a.user_id,
        u.username, u.display_name, u.avatar_url
      FROM collection_items ci
      JOIN artworks a ON ci.artwork_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE ci.collection_id = $1
      ORDER BY ci.added_at DESC`,
      [collectionId]
    );

    // Форматируем данные для ответа
    const items = result.rows.map((item: any) => ({
      id: item.id,
      collection_id: item.collection_id,
      artwork_id: item.artwork_id,
      added_at: item.added_at,
      artwork: {
        id: item.artwork_id,
        title: item.title,
        description: item.description,
        image_url: item.image_url,
        user_id: item.user_id,
        username: item.username,
        display_name: item.display_name,
        avatar_url: item.avatar_url
      }
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error('Ошибка при получении элементов коллекции:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}