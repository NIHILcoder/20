/**
 * API-эндпоинт для управления коллекциями
 */

import { NextResponse } from 'next/server';
import db from '../../../db';
import { getApiMessage, getLanguageFromRequest } from '../translations';

/**
 * Получение информации о коллекции
 */
export async function GET(request) {
  try {
    const language = getLanguageFromRequest(request);
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');
    
    if (!collectionId) {
      return NextResponse.json(
        { error: getApiMessage('api.collection.error.id_required', language) },
        { status: 400 }
      );
    }
    
    // Получение информации о коллекции
    const query = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM collection_items ci WHERE ci.collection_id = c.id) as item_count,
        (SELECT a.image_url FROM collection_items ci 
         JOIN artworks a ON ci.artwork_id = a.id 
         WHERE ci.collection_id = c.id 
         ORDER BY ci.added_at DESC LIMIT 1) as cover_image
      FROM collections c
      WHERE c.id = $1
    `;
    
    const result = await db.query(query, [collectionId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: getApiMessage('api.collection.error.not_found', language) },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
    
  } catch (error) {
    console.error('Ошибка при получении информации о коллекции:', error);
    return NextResponse.json(
      { error: getApiMessage('api.error.general', language) },
      { status: 500 }
    );
  }
}

/**
 * Обновление информации о коллекции
 */
export async function PUT(request) {
  try {
    const language = getLanguageFromRequest(request);
    const body = await request.json();
    const { collectionId, name, description } = body;
    
    if (!collectionId || !name) {
      return NextResponse.json(
        { error: getApiMessage('api.collection.error.name_required', language) },
        { status: 400 }
      );
    }
    
    const query = `
      UPDATE collections
      SET name = $1, description = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, user_id, name, description, created_at, updated_at
    `;
    
    const result = await db.query(query, [name, description || null, collectionId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: getApiMessage('api.collection.error.not_found', language) },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
    
  } catch (error) {
    console.error('Ошибка при обновлении коллекции:', error);
    return NextResponse.json(
      { error: getApiMessage('api.collection.error.update_failed', language) },
      { status: 500 }
    );
  }
}

/**
 * Массовое добавление работ в коллекцию
 */
export async function POST(request) {
  try {
    const language = getLanguageFromRequest(request);
    const body = await request.json();
    const { collectionId, artworkIds } = body;
    
    if (!collectionId) {
      return NextResponse.json(
        { error: getApiMessage('api.collection.error.id_required', language) },
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
    
    return NextResponse.json({
      success: true,
      added_count: result.rowCount,
      items: result.rows
    });
    
  } catch (error) {
    console.error('Ошибка при массовом добавлении работ в коллекцию:', error);
    return NextResponse.json(
      { error: getApiMessage('api.collection_items.error.add_failed', language) },
      { status: 500 }
    );
  }
}

/**
 * Массовое удаление работ из коллекции или удаление коллекции
 */
export async function DELETE(request) {
  try {
    const language = getLanguageFromRequest(request);
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');
    const artworkIds = searchParams.get('artworkIds');
    
    if (!collectionId) {
      return NextResponse.json(
        { error: getApiMessage('api.collection.error.id_required', language) },
        { status: 400 }
      );
    }
    
    let result;
    
    if (artworkIds) {
      // Массовое удаление работ из коллекции
      const artworkIdsArray = artworkIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      
      if (artworkIdsArray.length === 0) {
        return NextResponse.json(
          { error: getApiMessage('api.collection_items.error.artwork_id_required', language) },
          { status: 400 }
        );
      }
      
      const query = `
        DELETE FROM collection_items 
        WHERE collection_id = $1 AND artwork_id = ANY($2::int[])
      `;
      
      result = await db.query(query, [collectionId, artworkIdsArray]);
      
      return NextResponse.json({
        success: true,
        removed_count: result.rowCount
      });
    } else {
      // Удаление всей коллекции
      // Сначала удаляем все элементы коллекции
      await db.query('DELETE FROM collection_items WHERE collection_id = $1', [collectionId]);
      
      // Затем удаляем саму коллекцию
      result = await db.query('DELETE FROM collections WHERE id = $1', [collectionId]);
      
      return NextResponse.json({
        success: result.rowCount > 0
      });
    }
  } catch (error) {
    console.error('Ошибка при удалении:', error);
    return NextResponse.json(
      { error: getApiMessage('api.collection.error.delete_failed', language) },
      { status: 500 }
    );
  }
}