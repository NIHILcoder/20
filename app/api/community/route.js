/**
 * API-эндпоинт для страницы сообщества
 */

import { NextResponse } from 'next/server';
import artworkModel from '@/models/artwork';
import db from '@/db';

/**
 * Получение работ сообщества с фильтрацией и сортировкой
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Параметры запроса
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'newest'; // newest, trending, popular
    const search = searchParams.get('search') || '';
    const modelType = searchParams.get('modelType');
    const timeRange = searchParams.get('timeRange');
    
    // Базовый запрос
    let query = `
      SELECT a.*, u.username, u.display_name, u.avatar_url, 
      (SELECT COUNT(*) FROM likes WHERE artwork_id = a.id) as likes_count,
      (SELECT COUNT(*) FROM comments WHERE artwork_id = a.id) as comments_count
      FROM artworks a 
      JOIN users u ON a.user_id = u.id
      WHERE a.is_public = true
    `;
    
    const queryParams = [];
    
    // Добавление условий поиска
    if (search) {
      queryParams.push(`%${search}%`);
      query += ` AND (a.title ILIKE $${queryParams.length} OR a.description ILIKE $${queryParams.length})`;
    }
    
    // Фильтрация по категории (тегам)
    if (category && category !== 'all') {
      queryParams.push(category);
      query += `
        AND EXISTS (
          SELECT 1 FROM artwork_tags at 
          JOIN tags t ON at.tag_id = t.id 
          WHERE at.artwork_id = a.id AND t.name = $${queryParams.length}
        )
      `;
    }
    
    // Фильтрация по модели
    if (modelType && modelType !== 'all') {
      queryParams.push(modelType);
      query += ` AND a.model = $${queryParams.length}`;
    }
    
    // Фильтрация по времени
    if (timeRange) {
      let timeCondition;
      const now = new Date();
      
      switch(timeRange) {
        case 'today':
          timeCondition = `DATE(a.created_at) = CURRENT_DATE`;
          break;
        case 'week':
          timeCondition = `a.created_at >= CURRENT_DATE - INTERVAL '7 days'`;
          break;
        case 'month':
          timeCondition = `a.created_at >= CURRENT_DATE - INTERVAL '30 days'`;
          break;
        default:
          timeCondition = null;
      }
      
      if (timeCondition) {
        query += ` AND ${timeCondition}`;
      }
    }
    
    // Сортировка
    switch(sortBy) {
      case 'newest':
        query += ` ORDER BY a.created_at DESC`;
        break;
      case 'trending':
        query += ` ORDER BY (SELECT COUNT(*) FROM likes WHERE artwork_id = a.id AND created_at >= CURRENT_DATE - INTERVAL '7 days') DESC, a.created_at DESC`;
        break;
      case 'popular':
        query += ` ORDER BY (SELECT COUNT(*) FROM likes WHERE artwork_id = a.id) DESC, a.views DESC, a.created_at DESC`;
        break;
      default:
        query += ` ORDER BY a.created_at DESC`;
    }
    
    // Пагинация
    query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    // Выполнение запроса
    const result = await db.query(query, queryParams);
    
    // Получение тегов для каждой работы
    const artworks = result.rows;
    
    // Если есть работы, получаем их теги
    if (artworks.length > 0) {
      const artworkIds = artworks.map(artwork => artwork.id);
      
      const tagsQuery = `
        SELECT at.artwork_id, t.name 
        FROM artwork_tags at 
        JOIN tags t ON at.tag_id = t.id 
        WHERE at.artwork_id = ANY($1)
      `;
      
      const tagsResult = await db.query(tagsQuery, [artworkIds]);
      
      // Добавляем теги к соответствующим работам
      const tagsByArtworkId = {};
      tagsResult.rows.forEach(row => {
        if (!tagsByArtworkId[row.artwork_id]) {
          tagsByArtworkId[row.artwork_id] = [];
        }
        tagsByArtworkId[row.artwork_id].push(row.name);
      });
      
      artworks.forEach(artwork => {
        artwork.tags = tagsByArtworkId[artwork.id] || [];
      });
    }
    
    // Получение общего количества работ для пагинации
    const countQuery = `SELECT COUNT(*) FROM (${query.split('LIMIT')[0]}) AS count_query`;
    const countResult = await db.query(countQuery, queryParams.slice(0, -2));
    const totalCount = parseInt(countResult.rows[0].count);
    
    return NextResponse.json({
      artworks,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });
    
  } catch (error) {
    console.error('Ошибка при получении работ сообщества:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при получении работ сообщества' },
      { status: 500 }
    );
  }
}