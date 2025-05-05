import { NextResponse } from 'next/server';
import db from '@/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
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
    const { collectionId, artworkId } = await request.json();

    if (!collectionId || !artworkId) {
      return NextResponse.json(
        { error: 'Необходимо указать ID коллекции и ID работы' },
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

    // Если пользователь не владелец коллекции, запрещаем доступ
    if (collectionCheck.rows[0].user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    // Удаляем элемент из коллекции
    const result = await db.query(
      'DELETE FROM collection_items WHERE collection_id = $1 AND artwork_id = $2 RETURNING id',
      [collectionId, artworkId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Элемент не найден в коллекции' },
        { status: 404 }
      );
    }

    // Обновляем дату изменения коллекции
    await db.query(
      'UPDATE collections SET updated_at = NOW() WHERE id = $1',
      [collectionId]
    );

    return NextResponse.json({ success: true, message: 'Элемент успешно удален из коллекции' });
  } catch (error) {
    console.error('Ошибка при удалении элемента из коллекции:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}