/**
 * API-эндпоинт для элементов коллекции
 */

const { NextResponse } = require('next/server');
import db from '../../../db';
const { getApiMessage, getLanguageFromRequest } = require('../translations');

/**
 * Получение элементов коллекции
 */
export async function GET(request) {
  try {
    const language = getLanguageFromRequest(request);
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');
    
    if (!collectionId) {
      return NextResponse.json(
        { error: getApiMessage('api.collection_items.error.collection_id_required', language) },
        { status: 400 }
      );
    }
    
    // Получение элементов коллекции с информацией о работах
    const query = `
      SELECT ci.*, a.id as artwork_id, a.title, a.description, a.image_url, 
             a.user_id, u.username, u.display_name, u.avatar_url
      FROM collection_items ci
      JOIN artworks a ON ci.artwork_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE ci.collection_id = $1
      ORDER BY ci.added_at DESC
    `;
    
    const result = await db.query(query, [collectionId]);
    
    // Преобразуем результат в нужный формат
    const items = result.rows.map(row => ({
      id: row.id,
      artwork_id: row.artwork_id,
      collection_id: row.collection_id,
      added_at: row.added_at,
      artwork: {
        id: row.artwork_id,
        title: row.title,
        description: row.description,
        image_url: row.image_url,
        user_id: row.user_id,
        username: row.username,
        display_name: row.display_name,
        avatar_url: row.avatar_url
      }
    }));
    
    return NextResponse.json(items);
    
  } catch (error) {
    console.error('Ошибка при получении элементов коллекции:', error);
    return NextResponse.json(
      { error: getApiMessage('api.collection_items.error.get_failed', language) },
      { status: 500 }
    );
  }
}

/**
 * Массовое добавление элементов в коллекцию
 */
export async function POST(request) {
  try {
    const language = getLanguageFromRequest(request);
    const body = await request.json();
    const { collectionId, artworkIds } = body;
    
    if (!collectionId) {
      return NextResponse.json(
        { error: getApiMessage('api.collection_items.error.collection_id_required', language) },
        { status: 400 }
      );
    }
    
    if (!artworkIds || !Array.isArray(artworkIds) || artworkIds.length === 0) {
      return NextResponse.json(
        { error: getApiMessage('api.collection_items.error.artwork_id_required', language) },
        { status: 400 }
      );
    }
    
    // Проверяем существование коллекции
    const collectionCheck = await db.query('SELECT id FROM collections WHERE id = $1', [collectionId]);
    
    if (collectionCheck.rows.length === 0) {
      return NextResponse.json(
        { error: getApiMessage('api.collection.error.not_found', language) },
        { status: 404 }
      );
    }
    
    // Подготавливаем массовую вставку
    const values = [];
    const params = [];
    let paramIndex = 1;
    
    artworkIds.forEach(artworkId => {
      values.push(`($${paramIndex}, $${paramIndex + 1})`);
      params.push(collectionId, artworkId);
      paramIndex += 2;
    });
    
    const query = `
      INSERT INTO collection_items (collection_id, artwork_id)
      VALUES ${values.join(', ')}
      ON CONFLICT (collection_id, artwork_id) DO NOTHING
      RETURNING id, collection_id, artwork_id, added_at
    `;
    
    const result = await db.query(query, params);
    
    // Получаем информацию о добавленных работах
    if (result.rowCount > 0) {
      const artworkQuery = `
        SELECT ci.*, a.id as artwork_id, a.title, a.description, a.image_url, 
               a.user_id, u.username, u.display_name, u.avatar_url
        FROM collection_items ci
        JOIN artworks a ON ci.artwork_id = a.id
        JOIN users u ON a.user_id = u.id
        WHERE ci.id = ANY($1::int[])
      `;
      
      const itemIds = result.rows.map(row => row.id);
      const artworksResult = await db.query(artworkQuery, [itemIds]);
      
      // Преобразуем результат в нужный формат
      const items = artworksResult.rows.map(row => ({
        id: row.id,
        artwork_id: row.artwork_id,
        collection_id: row.collection_id,
        added_at: row.added_at,
        artwork: {
          id: row.artwork_id,
          title: row.title,
          description: row.description,
          image_url: row.image_url,
          user_id: row.user_id,
          username: row.username,
          display_name: row.display_name,
          avatar_url: row.avatar_url
        }
      }));
      
      return NextResponse.json({
        success: true,
        added_count: result.rowCount,
        items: items
      });
    }
    
    return NextResponse.json({
      success: true,
      added_count: 0,
      items: []
    });
    
  } catch (error) {
    console.error('Ошибка при добавлении элементов в коллекцию:', error);
    return NextResponse.json(
      { error: getApiMessage('api.collection_items.error.add_failed', language) },
      { status: 500 }
    );
  }
}

/**
 * Удаление элемента из коллекции
 */
export async function DELETE(request) {
  try {
    const language = getLanguageFromRequest(request);
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');
    const artworkId = searchParams.get('artworkId');
    const itemId = searchParams.get('itemId');
    
    if (!collectionId && !itemId) {
      return NextResponse.json(
        { error: getApiMessage('api.collection_items.error.collection_id_required', language) },
        { status: 400 }
      );
    }
    
    let query;
    let params;
    
    if (itemId) {
      // Удаление по ID элемента
      query = 'DELETE FROM collection_items WHERE id = $1';
      params = [itemId];
    } else if (collectionId && artworkId) {
      // Удаление по ID коллекции и ID работы
      query = 'DELETE FROM collection_items WHERE collection_id = $1 AND artwork_id = $2';
      params = [collectionId, artworkId];
    } else if (collectionId) {
      // Удаление всех элементов коллекции
      query = 'DELETE FROM collection_items WHERE collection_id = $1';
      params = [collectionId];
    } else {
      return NextResponse.json(
        { error: getApiMessage('api.collection_items.error.artwork_id_required', language) },
        { status: 400 }
      );
    }
    
    const result = await db.query(query, params);
    
    return NextResponse.json({
      success: true,
      removed_count: result.rowCount
    });
    
  } catch (error) {
    console.error('Ошибка при удалении элемента из коллекции:', error);
    return NextResponse.json(
      { error: getApiMessage('api.collection_items.error.remove_failed', language) },
      { status: 500 }
    );
  }
}