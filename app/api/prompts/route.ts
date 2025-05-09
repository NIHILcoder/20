import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { withAuth } from '@/middleware/auth';

// Обработчик GET-запросов для получения промптов
async function getHandler(request: NextRequest) {
  try {
    // Информация о пользователе добавляется в запрос middleware аутентификации
    const user = request.user;

    const { searchParams } = new URL(request.url);
    const userIdString = searchParams.get('userId');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortDirection = searchParams.get('sortDirection') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const favorites = searchParams.get('favorites') === 'true';
    const tab = searchParams.get('tab') || 'my-prompts';

    // Проверка на наличие userId
    if (!userIdString) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }
    const userId = parseInt(userIdString, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid userId format' }, { status: 400 });
    }

    // Базовый запрос
    let query = `
      SELECT 
        p.id, p.title, p.text, p.category, p.tags, p.created_at as "createdAt", 
        p.updated_at as "updatedAt", p.negative, p.parameters, p.notes, 
        p.is_public as "isPublic", p.usage_count as "usageCount", 
        u.username as "author", 
        CASE WHEN f.prompt_id IS NOT NULL THEN true ELSE false END as favorite,
        COALESCE(AVG(r.rating), 0) as rating
      FROM prompts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN prompt_favorites f ON p.id = f.prompt_id AND f.user_id = $1
      LEFT JOIN prompt_ratings r ON p.id = r.prompt_id
    `;

    // Условия WHERE
    const whereConditions = [];
    const queryParams: (string | number)[] = [userId];
    let paramIndex = 2;

    // Фильтр по владельцу или публичным промптам
    if (tab === 'my-prompts') {
      whereConditions.push(`p.user_id = $1`);
    } else if (tab === 'community') {
      whereConditions.push(`(p.is_public = true OR p.user_id = $1)`);
    }

    // Фильтр по категории
    if (category) {
      whereConditions.push(`p.category = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }

    // Поиск по тексту
    if (search) {
      whereConditions.push(`(p.title ILIKE $${paramIndex} OR p.text ILIKE $${paramIndex} OR p.tags::text ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Фильтр по избранному
    if (favorites) {
      whereConditions.push(`f.prompt_id IS NOT NULL`);
    }

    // Добавляем условия WHERE к запросу
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // Группировка для агрегации рейтинга
    query += ` GROUP BY p.id, u.username, f.prompt_id`;

    // Сортировка
    const sortColumn = sortBy === 'rating' ? 'rating' : `p.${sortBy}`;
    query += ` ORDER BY ${sortColumn} ${sortDirection === 'asc' ? 'ASC' : 'DESC'}`;

    // Подсчет общего количества записей для пагинации
    const countQuery = `
      SELECT COUNT(*) FROM prompts p
      LEFT JOIN prompt_favorites f ON p.id = f.prompt_id AND f.user_id = $1
      ${whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''}
    `;
    
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Добавляем пагинацию
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    // Выполняем запрос
    const result = await db.query(query, queryParams);

    // Преобразуем данные
    const prompts = result.rows.map((row: any) => ({
      ...row,
      tags: row.tags || [],
      parameters: row.parameters || {},
      rating: parseFloat(row.rating) || 0
    }));

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
    console.error('Error fetching prompts:', error);
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}

// Обработчик POST-запросов для создания промптов
async function postHandler(request: NextRequest) {
  try {
    // Информация о пользователе добавляется в запрос middleware аутентификации
    const user = request.user;

    const data = await request.json();
    const { userId: userIdFromRequest, title, text, category, tags, negative, notes, isPublic, parameters } = data;

    // Проверка обязательных полей
    if (userIdFromRequest === undefined || userIdFromRequest === null || !title || !text) {
      return NextResponse.json({ error: 'Missing required fields (userId, title, text)' }, { status: 400 });
    }

    // userIdFromRequest должен быть числом, так как frontend (prompts-service.ts) отправляет его как number
    if (typeof userIdFromRequest !== 'number') {
      return NextResponse.json({ error: 'Invalid userId type in request body, expected number' }, { status: 400 });
    }
    const userId = userIdFromRequest;

    // Проверка прав доступа
    const sessionUserId = user.id;
    if (sessionUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Вставка нового промпта
    const query = `
      INSERT INTO prompts (
        user_id, title, text, category, tags, negative, notes, is_public, parameters, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING id, title, text, category, tags, negative, notes, is_public as "isPublic", 
                parameters, created_at as "createdAt", updated_at as "updatedAt", usage_count as "usageCount"
    `;

    const result = await db.query(query, [
      userId, // Используем числовой userId
      title,
      text,
      category || null,
      tags || [],
      negative || null,
      notes || null,
      isPublic || false,
      parameters || {}
    ]);

    const prompt = {
      ...result.rows[0],
      favorite: false,
      rating: 0,
      author: user.username || user.display_name
    };

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 });
  }
}

// Обработчик PUT-запросов для обновления промптов
async function putHandler(request: NextRequest) {
  try {
    // Информация о пользователе добавляется в запрос middleware аутентификации
    const user = request.user;

    const data = await request.json();
    const { promptId, userId, title, text, category, tags, negative, notes, isPublic, parameters } = data;

    // Проверка обязательных полей
    if (!promptId || !userId || !title || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Проверка прав доступа
    const sessionUserId = user.id;
    if (sessionUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Проверка существования промпта и прав на его редактирование
    const checkQuery = `SELECT user_id FROM prompts WHERE id = $1`;
    const checkResult = await db.query(checkQuery, [promptId]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    if (checkResult.rows[0].user_id !== userId) {
      return NextResponse.json({ error: 'You do not have permission to edit this prompt' }, { status: 403 });
    }

    // Обновление промпта
    const query = `
      UPDATE prompts SET
        title = $1,
        text = $2,
        category = $3,
        tags = $4,
        negative = $5,
        notes = $6,
        is_public = $7,
        parameters = $8,
        updated_at = NOW()
      WHERE id = $9 AND user_id = $10
      RETURNING id, title, text, category, tags, negative, notes, is_public as "isPublic", 
                parameters, created_at as "createdAt", updated_at as "updatedAt", usage_count as "usageCount"
    `;

    const result = await db.query(query, [
      title,
      text,
      category || null,
      tags || [],
      negative || null,
      notes || null,
      isPublic || false,
      parameters || {},
      promptId,
      userId
    ]);

    // Получение дополнительных данных для ответа
    const favoriteQuery = `SELECT 1 FROM prompt_favorites WHERE prompt_id = $1 AND user_id = $2`;
    const favoriteResult = await db.query(favoriteQuery, [promptId, userId]);
    const favorite = favoriteResult.rows.length > 0;

    const ratingQuery = `SELECT COALESCE(AVG(rating), 0) as rating FROM prompt_ratings WHERE prompt_id = $1`;
    const ratingResult = await db.query(ratingQuery, [promptId]);
    const rating = parseFloat(ratingResult.rows[0].rating) || 0;

    const prompt = {
      ...result.rows[0],
      favorite,
      rating,
      author: user.username || user.display_name
    };

    return NextResponse.json(prompt);
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 });
  }
}

// Обработчик DELETE-запросов для удаления промптов или изменения статуса избранного
async function deleteHandler(request: NextRequest) {
  try {
    // Информация о пользователе добавляется в запрос middleware аутентификации
    const user = request.user;

    const { searchParams } = new URL(request.url);
    const promptId = searchParams.get('promptId');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    if (!promptId || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Проверка прав доступа
    if (user.id.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Переключение статуса избранного
    if (action === 'toggle-favorite') {
      // Проверяем, есть ли уже в избранном
      const checkQuery = `SELECT 1 FROM prompt_favorites WHERE prompt_id = $1 AND user_id = $2`;
      const checkResult = await db.query(checkQuery, [promptId, userId]);
      const exists = checkResult.rows.length > 0;

      if (exists) {
        // Удаляем из избранного
        await db.query(`DELETE FROM prompt_favorites WHERE prompt_id = $1 AND user_id = $2`, [promptId, userId]);
        return NextResponse.json({ id: promptId, favorite: false });
      } else {
        // Добавляем в избранное
        await db.query(`INSERT INTO prompt_favorites (prompt_id, user_id, added_at) VALUES ($1, $2, NOW())`, [promptId, userId]);
        return NextResponse.json({ id: promptId, favorite: true });
      }
    }

    // Удаление промпта
    // Сначала проверяем, принадлежит ли промпт пользователю
    const checkQuery = `SELECT user_id FROM prompts WHERE id = $1`;
    const checkResult = await db.query(checkQuery, [promptId]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    const userIdNumber = parseInt(userId);
    if (checkResult.rows[0].user_id !== userIdNumber) {
      return NextResponse.json({ error: 'You do not have permission to delete this prompt' }, { status: 403 });
    }

    // Удаляем связанные записи (избранное, рейтинги)
    await db.query(`DELETE FROM prompt_favorites WHERE prompt_id = $1`, [promptId]);
    await db.query(`DELETE FROM prompt_ratings WHERE prompt_id = $1`, [promptId]);

    // Удаляем сам промпт
    await db.query(`DELETE FROM prompts WHERE id = $1 AND user_id = $2`, [promptId, userIdNumber]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing prompt action:', error);
    return NextResponse.json({ error: 'Failed to process prompt action' }, { status: 500 });
  }
}

// Экспорт обработчиков с использованием middleware аутентификации
export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler);