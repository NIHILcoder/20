/**
 * API-эндпоинт для страницы избранного
 */

import { NextResponse } from 'next/server';
import db from '../../../db';
import { getApiMessage, getLanguageFromRequest } from '../translations';

/**
 * Получение коллекций пользователя
 */
export async function GET(request) {
  try {
    const language = getLanguageFromRequest(request);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: getApiMessage('api.favorites.error.user_id_required', language) },
        { status: 400 }
      );
    }
    
    // Получение коллекций пользователя
    const collectionsQuery = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM collection_items ci WHERE ci.collection_id = c.id) as item_count,
        (SELECT a.image_url FROM collection_items ci 
         JOIN artworks a ON ci.artwork_id = a.id 
         WHERE ci.collection_id = c.id 
         ORDER BY ci.added_at DESC LIMIT 1) as cover_image
      FROM collections c
      WHERE c.user_id = $1
      ORDER BY c.updated_at DESC
    `;
    
    const collectionsResult = await db.query(collectionsQuery, [userId]);
    const collections = collectionsResult.rows;
    
    // Получение избранных работ пользователя (лайки)
    const favoritesQuery = `
      SELECT a.*, u.username, u.display_name, u.avatar_url, l.created_at as favorited_at
      FROM likes l
      JOIN artworks a ON l.artwork_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE l.user_id = $1
      ORDER BY l.created_at DESC
    `;
    
    const favoritesResult = await db.query(favoritesQuery, [userId]);
    const favorites = favoritesResult.rows;
    
    return NextResponse.json({
      collections,
      favorites
    });
    
  } catch (error) {
    console.error('Ошибка при получении данных избранного:', error);
    return NextResponse.json(
      { error: getApiMessage('api.favorites.error.get_failed', language) },
      { status: 500 }
    );
  }
}

/**
 * Создание новой коллекции
 */
export async function POST(request) {
  try {
    const language = getLanguageFromRequest(request);
    const body = await request.json();
    const { userId, name, description } = body;
    
    if (!userId || !name) {
      return NextResponse.json(
        { error: getApiMessage('api.collection.error.name_required', language) },
        { status: 400 }
      );
    }
    
    const query = `
      INSERT INTO collections (user_id, name, description)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, name, description, created_at
    `;
    
    const result = await db.query(query, [userId, name, description || null]);
    
    return NextResponse.json(result.rows[0]);
    
  } catch (error) {
    console.error('Ошибка при создании коллекции:', error);
    return NextResponse.json(
      { error: getApiMessage('api.collection.error.create_failed', language) },
      { status: 500 }
    );
  }
}

/**
 * Добавление работы в коллекцию
 */
export async function PUT(request) {
  try {
    const language = getLanguageFromRequest(request);
    const body = await request.json();
    const { collectionId, artworkId } = body;
    
    if (!collectionId || !artworkId) {
      return NextResponse.json(
        { error: getApiMessage('api.collection_items.error.artwork_id_required', language) },
        { status: 400 }
      );
    }
    
    const query = `
      INSERT INTO collection_items (collection_id, artwork_id)
      VALUES ($1, $2)
      ON CONFLICT (collection_id, artwork_id) DO NOTHING
      RETURNING id, collection_id, artwork_id, added_at
    `;
    
    const result = await db.query(query, [collectionId, artworkId]);
    
    return NextResponse.json(result.rows[0] || { success: true });
    
  } catch (error) {
    console.error('Ошибка при добавлении работы в коллекцию:', error);
    return NextResponse.json(
      { error: getApiMessage('api.collection_items.error.add_failed', language) },
      { status: 500 }
    );
  }
}

/**
 * Удаление коллекции или удаление работы из коллекции
 */
export async function DELETE(request) {
  try {
    const language = getLanguageFromRequest(request);
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');
    const artworkId = searchParams.get('artworkId');
    
    if (!collectionId) {
      return NextResponse.json(
        { error: getApiMessage('api.collection.error.id_required', language) },
        { status: 400 }
      );
    }
    
    let query;
    let params;
    
    if (artworkId) {
      // Удаление работы из коллекции
      query = 'DELETE FROM collection_items WHERE collection_id = $1 AND artwork_id = $2';
      params = [collectionId, artworkId];
    } else {
      // Удаление всей коллекции
      query = 'DELETE FROM collections WHERE id = $1';
      params = [collectionId];
    }
    
    const result = await db.query(query, params);
    
    return NextResponse.json({ success: result.rowCount > 0 });
    
  } catch (error) {
    console.error('Ошибка при удалении:', error);
    return NextResponse.json(
      { error: getApiMessage('api.collection.error.delete_failed', language) },
      { status: 500 }
    );
  }
}