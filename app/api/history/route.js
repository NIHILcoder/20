/**
 * API-эндпоинт для страницы истории генераций
 */

const { NextResponse } = require('next/server');
const db = require('../../../db');

/**
 * Получение истории генераций пользователя
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const filter = searchParams.get('filter') || 'all'; // all, saved, shared
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Необходимо указать ID пользователя' },
        { status: 400 }
      );
    }
    
    // Базовый запрос
    let query = `
      SELECT a.*, 
        (SELECT COUNT(*) FROM likes WHERE artwork_id = a.id) as likes_count,
        EXISTS(SELECT 1 FROM likes WHERE artwork_id = a.id AND user_id = $1) as is_liked,
        EXISTS(SELECT 1 FROM collection_items ci 
               JOIN collections c ON ci.collection_id = c.id 
               WHERE ci.artwork_id = a.id AND c.user_id = $1) as is_saved
      FROM artworks a
      WHERE a.user_id = $1
    `;
    
    const queryParams = [userId];
    
    // Применение фильтров
    if (filter === 'saved') {
      query += `
        AND EXISTS(SELECT 1 FROM collection_items ci 
                  JOIN collections c ON ci.collection_id = c.id 
                  WHERE ci.artwork_id = a.id AND c.user_id = $1)
      `;
    } else if (filter === 'shared') {
      query += ` AND a.is_public = true`;
    }
    
    // Поиск по промпту или названию
    if (search) {
      queryParams.push(`%${search}%`);
      query += ` AND (a.title ILIKE $${queryParams.length} OR a.prompt ILIKE $${queryParams.length})`;
    }
    
    // Сортировка и пагинация
    query += ` ORDER BY a.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    // Выполнение запроса
    const result = await db.query(query, queryParams);
    const artworks = result.rows;
    
    // Получение общего количества для пагинации
    const countQuery = `SELECT COUNT(*) FROM (${query.split('LIMIT')[0]}) AS count_query`;
    const countResult = await db.query(countQuery, queryParams.slice(0, -2));
    const totalCount = parseInt(countResult.rows[0].count);
    
    // Группировка по дате для отображения в интерфейсе
    const groupedArtworks = {};
    
    artworks.forEach(artwork => {
      const date = new Date(artwork.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateKey;
      
      if (date.toDateString() === today.toDateString()) {
        dateKey = 'today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = 'yesterday';
      } else {
        dateKey = date.toISOString().split('T')[0];
      }
      
      if (!groupedArtworks[dateKey]) {
        groupedArtworks[dateKey] = [];
      }
      
      groupedArtworks[dateKey].push(artwork);
    });
    
    return NextResponse.json({
      artworks,
      groupedArtworks,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });
    
  } catch (error) {
    console.error('Ошибка при получении истории генераций:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при получении истории генераций' },
      { status: 500 }
    );
  }
}

/**
 * Удаление работы из истории
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const artworkId = searchParams.get('artworkId');
    const userId = searchParams.get('userId');
    
    if (!artworkId || !userId) {
      return NextResponse.json(
        { error: 'Необходимо указать ID работы и ID пользователя' },
        { status: 400 }
      );
    }
    
    // Проверка, принадлежит ли работа пользователю
    const checkQuery = 'SELECT 1 FROM artworks WHERE id = $1 AND user_id = $2';
    const checkResult = await db.query(checkQuery, [artworkId, userId]);
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'У вас нет прав на удаление этой работы' },
        { status: 403 }
      );
    }
    
    // Удаление работы
    const deleteQuery = 'DELETE FROM artworks WHERE id = $1 AND user_id = $2';
    const result = await db.query(deleteQuery, [artworkId, userId]);
    
    return NextResponse.json({ success: result.rowCount > 0 });
    
  } catch (error) {
    console.error('Ошибка при удалении работы:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при удалении работы' },
      { status: 500 }
    );
  }
}