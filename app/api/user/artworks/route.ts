import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию пользователя
    const session = await getServerSession(authOptions);
    
    console.log('Сессия при запросе артов:', session ? 'Есть' : 'Отсутствует', 
                session?.user ? `User ID: ${session.user.id}` : 'Нет данных пользователя');
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Необходима авторизация', sessionStatus: 'missing' },
        { status: 401 }
      );
    }
    
    // Получаем ID пользователя из query-параметров
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log('Запрос артов для пользователя:', userId);
    console.log('Текущий авторизованный пользователь:', session.user.id);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Необходимо указать ID пользователя' },
        { status: 400 }
      );
    }
    
    // Проверяем, что текущий пользователь запрашивает свои работы
    // Преобразуем оба ID к строкам для сравнения
    const sessionUserId = String(session.user.id);
    const requestUserId = String(userId);
    
    console.log('Сравнение ID:', {
      sessionUserId,
      requestUserId,
      equal: sessionUserId === requestUserId
    });
    
    if (sessionUserId !== requestUserId) {
      return NextResponse.json(
        { 
          error: 'Доступ запрещен: вы можете получить только свои работы',
          sessionUserId,
          requestUserId
        },
        { status: 403 }
      );
    }
    
    // Получаем работы пользователя из базы данных
    const result = await db.query(
      'SELECT * FROM artworks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    console.log(`Найдено ${result.rows.length} работ пользователя`);
    
    return NextResponse.json({
      success: true,
      artworks: result.rows
    });
  } catch (error) {
    console.error('Ошибка при получении работ пользователя:', error);
    
    return NextResponse.json(
      { 
        error: 'Внутренняя ошибка сервера', 
        details: error instanceof Error ? error.message : 'Неизвестная ошибка' 
      },
      { status: 500 }
    );
  }
}