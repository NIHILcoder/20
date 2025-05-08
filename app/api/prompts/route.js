/**
 * API-эндпоинт для работы с промптами
 */

import { NextResponse } from 'next/server';
import db from '../../../db';
import { getApiMessage, getLanguageFromRequest } from '../translations';

/**
 * Получение списка промптов
 */
export async function GET(request) {
  try {
    const language = getLanguageFromRequest(request);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'updated_at';
    const sortDirection = searchParams.get('sortDirection') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const showOnlyFavorites = searchParams.get('favorites') === 'true';
    const tab = searchParams.get('tab') || 'my-prompts';
    
    if (!userId) {
      return NextResponse.json(
        { error: getApiMessage('api.prompts.error.user_id_required', language) },
        { status: 400 }
      );
    }
    
    let query, countQuery, queryParams;
    
    if (tab === 'my-prompts') {
      // Базовый запрос для получения промптов пользователя
      query = `
        SELECT p.*, 
          COALESCE(array_agg(DISTINCT pt.tag_name) FILTER (WHERE pt.tag_name IS NOT NULL), '{}') as tags
        FROM prompts p
        LEFT JOIN prompt_tags pt ON p.id = pt.prompt_id
        WHERE p.user_id = $1
      `;
      
      countQuery = `
        SELECT COUNT(*) FROM prompts p WHERE p.user_id = $1
      `;
      
      queryParams = [userId];
      
      // Добавляем фильтры
      if (category && category !== 'all') {
        query += ` AND p.category = $${queryParams.length + 1}`;
        countQuery += ` AND p.category = $${queryParams.length + 1}`;
        queryParams.push(category);
      }
      
      if (showOnlyFavorites) {
        query += ` AND p.favorite = true`;
        countQuery += ` AND p.favorite = true`;
      }
      
      if (search) {
        query += ` AND (p.title ILIKE $${queryParams.length + 1} OR p.text ILIKE $${queryParams.length + 1})`;
        countQuery += ` AND (p.title ILIKE $${queryParams.length + 1} OR p.text ILIKE $${queryParams.length + 1})`;
        queryParams.push(`%${search}%`);
      }
      
      // Группировка для тегов
      query += ` GROUP BY p.id`;
      
      // Сортировка
      const sortColumn = getSortColumn(sortBy);
      query += ` ORDER BY ${sortColumn} ${sortDirection === 'asc' ? 'ASC' : 'DESC'}`;
      
      // Пагинация
      query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(limit, offset);
    } else {
      // Запрос для получения публичных промптов сообщества
      query = `
        SELECT p.*, u.username, u.display_name, u.avatar_url,
          COALESCE(array_agg(DISTINCT pt.tag_name) FILTER (WHERE pt.tag_name IS NOT NULL), '{}') as tags
        FROM prompts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN prompt_tags pt ON p.id = pt.prompt_id
        WHERE p.is_public = true
      `;
      
      countQuery = `
        SELECT COUNT(*) FROM prompts p WHERE p.is_public = true
      `;
      
      queryParams = [];
      
      // Добавляем фильтры
      if (category && category !== 'all') {
        query += ` AND p.category = $${queryParams.length + 1}`;
        countQuery += ` AND p.category = $${queryParams.length + 1}`;
        queryParams.push(category);
      }
      
      if (search) {
        query += ` AND (p.title ILIKE $${queryParams.length + 1} OR p.text ILIKE $${queryParams.length + 1})`;
        countQuery += ` AND (p.title ILIKE $${queryParams.length + 1} OR p.text ILIKE $${queryParams.length + 1})`;
        queryParams.push(`%${search}%`);
      }
      
      // Группировка для тегов
      query += ` GROUP BY p.id, u.username, u.display_name, u.avatar_url`;
      
      // Сортировка
      const sortColumn = getSortColumn(sortBy);
      query += ` ORDER BY ${sortColumn} ${sortDirection === 'asc' ? 'ASC' : 'DESC'}`;
      
      // Пагинация
      query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(limit, offset);
    }
    
    // Выполняем запросы
    const promptsResult = await db.query(query, queryParams);
    const countResult = await db.query(countQuery, queryParams.slice(0, queryParams.length - 2));
    
    const prompts = promptsResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      text: row.text,
      category: row.category,
      tags: row.tags,
      favorite: row.favorite,
      rating: row.rating || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      usageCount: row.usage_count || 0,
      negative: row.negative,
      parameters: row.parameters,
      notes: row.notes,
      isPublic: row.is_public,
      author: row.username || row.display_name
    }));
    
    const total = parseInt(countResult.rows[0].count);
    
    return NextResponse.json({
      prompts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
    
  } catch (error) {
    console.error('Ошибка при получении промптов:', error);
    const language = getLanguageFromRequest(request);
    return NextResponse.json(
      { error: getApiMessage('api.prompts.error.get_failed', language) },
      { status: 500 }
    );
  }
}

/**
 * Создание нового промпта
 */
export async function POST(request) {
  try {
    const language = getLanguageFromRequest(request);
    const body = await request.json();
    const { userId, title, text, category, tags, negative, notes, isPublic, parameters } = body;
    
    if (!userId || !title || !text) {
      return NextResponse.json(
        { error: getApiMessage('api.prompts.error.required_fields', language) },
        { status: 400 }
      );
    }
    
    // Начинаем транзакцию
    await db.query('BEGIN');
    
    // Вставляем промпт
    const promptQuery = `
      INSERT INTO prompts (user_id, title, text, category, negative, notes, is_public, parameters)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, user_id, title, text, category, negative, notes, is_public, parameters, created_at, updated_at
    `;
    
    const promptResult = await db.query(promptQuery, [
      userId, 
      title, 
      text, 
      category || null, 
      negative || null, 
      notes || null, 
      isPublic || false,
      parameters ? JSON.stringify(parameters) : null
    ]);
    
    const promptId = promptResult.rows[0].id;
    
    // Добавляем теги, если они есть
    if (tags && tags.length > 0) {
      const tagValues = tags.map((tag, index) => 
        `($1, $${index + 2})`
      ).join(', ');
      
      const tagParams = [promptId, ...tags];
      
      const tagQuery = `
        INSERT INTO prompt_tags (prompt_id, tag_name)
        VALUES ${tagValues}
        ON CONFLICT (prompt_id, tag_name) DO NOTHING
      `;
      
      await db.query(tagQuery, tagParams);
    }
    
    // Завершаем транзакцию
    await db.query('COMMIT');
    
    // Возвращаем созданный промпт с тегами
    const newPrompt = {
      ...promptResult.rows[0],
      tags: tags || [],
      favorite: false,
      rating: 0,
      usageCount: 0,
      createdAt: promptResult.rows[0].created_at,
      updatedAt: promptResult.rows[0].updated_at,
      isPublic: promptResult.rows[0].is_public
    };
    
    return NextResponse.json(newPrompt);
    
  } catch (error) {
    // Откатываем транзакцию в случае ошибки
    await db.query('ROLLBACK');
    console.error('Ошибка при создании промпта:', error);
    return NextResponse.json(
      { error: getApiMessage('api.prompts.error.create_failed', language) },
      { status: 500 }
    );
  }
}

/**
 * Обновление промпта
 */
export async function PUT(request) {
  try {
    const language = getLanguageFromRequest(request);
    const body = await request.json();
    const { promptId, userId, title, text, category, tags, negative, notes, isPublic, parameters } = body;
    
    if (!promptId || !userId || !title || !text) {
      return NextResponse.json(
        { error: getApiMessage('api.prompts.error.required_fields', language) },
        { status: 400 }
      );
    }
    
    // Проверяем, что промпт принадлежит пользователю
    const checkQuery = `SELECT id FROM prompts WHERE id = $1 AND user_id = $2`;
    const checkResult = await db.query(checkQuery, [promptId, userId]);
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: getApiMessage('api.prompts.error.not_found', language) },
        { status: 404 }
      );
    }
    
    // Начинаем транзакцию
    await db.query('BEGIN');
    
    // Обновляем промпт
    const promptQuery = `
      UPDATE prompts
      SET title = $1, text = $2, category = $3, negative = $4, notes = $5, is_public = $6, parameters = $7, updated_at = NOW()
      WHERE id = $8 AND user_id = $9
      RETURNING id, user_id, title, text, category, negative, notes, is_public, parameters, favorite, rating, usage_count, created_at, updated_at
    `;
    
    const promptResult = await db.query(promptQuery, [
      title, 
      text, 
      category || null, 
      negative || null, 
      notes || null, 
      isPublic || false,
      parameters ? JSON.stringify(parameters) : null,
      promptId,
      userId
    ]);
    
    // Удаляем старые теги
    await db.query('DELETE FROM prompt_tags WHERE prompt_id = $1', [promptId]);
    
    // Добавляем новые теги, если они есть
    if (tags && tags.length > 0) {
      const tagValues = tags.map((tag, index) => 
        `($1, $${index + 2})`
      ).join(', ');
      
      const tagParams = [promptId, ...tags];
      
      const tagQuery = `
        INSERT INTO prompt_tags (prompt_id, tag_name)
        VALUES ${tagValues}
        ON CONFLICT (prompt_id, tag_name) DO NOTHING
      `;
      
      await db.query(tagQuery, tagParams);
    }
    
    // Завершаем транзакцию
    await db.query('COMMIT');
    
    // Возвращаем обновленный промпт с тегами
    const updatedPrompt = {
      ...promptResult.rows[0],
      tags: tags || [],
      createdAt: promptResult.rows[0].created_at,
      updatedAt: promptResult.rows[0].updated_at,
      usageCount: promptResult.rows[0].usage_count,
      isPublic: promptResult.rows[0].is_public
    };
    
    return NextResponse.json(updatedPrompt);
    
  } catch (error) {
    // Откатываем транзакцию в случае ошибки
    await db.query('ROLLBACK');
    console.error('Ошибка при обновлении промпта:', error);
    return NextResponse.json(
      { error: getApiMessage('api.prompts.error.update_failed', language) },
      { status: 500 }
    );
  }
}

/**
 * Удаление промпта или обновление статуса избранного
 */
export async function DELETE(request) {
  try {
    const language = getLanguageFromRequest(request);
    const { searchParams } = new URL(request.url);
    const promptId = searchParams.get('promptId');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action') || 'delete'; // 'delete' или 'toggle-favorite'
    
    if (!promptId || !userId) {
      return NextResponse.json(
        { error: getApiMessage('api.prompts.error.required_fields', language) },
        { status: 400 }
      );
    }
    
    // Проверяем, что промпт принадлежит пользователю
    const checkQuery = `SELECT id FROM prompts WHERE id = $1 AND user_id = $2`;
    const checkResult = await db.query(checkQuery, [promptId, userId]);
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: getApiMessage('api.prompts.error.not_found', language) },
        { status: 404 }
      );
    }
    
    let result;
    
    if (action === 'toggle-favorite') {
      // Обновляем статус избранного
      const toggleQuery = `
        UPDATE prompts
        SET favorite = NOT favorite
        WHERE id = $1 AND user_id = $2
        RETURNING id, favorite
      `;
      
      result = await db.query(toggleQuery, [promptId, userId]);
      return NextResponse.json({
        id: result.rows[0].id,
        favorite: result.rows[0].favorite
      });
    } else {
      // Удаляем промпт и связанные теги (каскадное удаление)
      const deleteQuery = `DELETE FROM prompts WHERE id = $1 AND user_id = $2`;
      result = await db.query(deleteQuery, [promptId, userId]);
      
      return NextResponse.json({ success: result.rowCount > 0 });
    }
    
  } catch (error) {
    console.error('Ошибка при операции с промптом:', error);
    return NextResponse.json(
      { error: getApiMessage('api.prompts.error.operation_failed', language) },
      { status: 500 }
    );
  }
}

// Вспомогательная функция для определения столбца сортировки
function getSortColumn(sortBy) {
  switch (sortBy) {
    case 'title':
      return 'p.title';
    case 'created':
      return 'p.created_at';
    case 'updated':
      return 'p.updated_at';
    case 'usage':
      return 'p.usage_count';
    case 'rating':
      return 'p.rating';
    default:
      return 'p.updated_at';
  }
}