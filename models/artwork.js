/**
 * Модель для работы с работами (генерациями)
 */

import db from '../db';

/**
 * Создает новую работу
 * @param {Object} artworkData - Данные работы
 * @returns {Promise<Object>} - Созданная работа
 */
async function createArtwork({ userId, title, description, imageUrl, prompt, negativePrompt, model, parameters, isPublic = true }) {
  const result = await db.query(
    'INSERT INTO artworks (user_id, title, description, image_url, prompt, negative_prompt, model, parameters, is_public) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, user_id, title, description, image_url, prompt, negative_prompt, model, parameters, is_public, created_at',
    [userId, title, description, imageUrl, prompt, negativePrompt, model, parameters ? JSON.stringify(parameters) : null, isPublic]
  );
  
  return result.rows[0];
}

/**
 * Находит работу по ID
 * @param {number} id - ID работы
 * @returns {Promise<Object|null>} - Найденная работа или null
 */
async function findArtworkById(id) {
  const result = await db.query(
    'SELECT a.*, u.username, u.display_name, u.avatar_url FROM artworks a JOIN users u ON a.user_id = u.id WHERE a.id = $1',
    [id]
  );
  
  return result.rows[0] || null;
}

/**
 * Обновляет работу
 * @param {number} id - ID работы
 * @param {Object} artworkData - Данные для обновления
 * @returns {Promise<Object>} - Обновленная работа
 */
async function updateArtwork(id, { title, description, isPublic }) {
  const result = await db.query(
    'UPDATE artworks SET title = COALESCE($1, title), description = COALESCE($2, description), is_public = COALESCE($3, is_public), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, user_id, title, description, image_url, prompt, negative_prompt, model, parameters, is_public, created_at, updated_at',
    [title, description, isPublic, id]
  );
  
  return result.rows[0];
}

/**
 * Удаляет работу
 * @param {number} id - ID работы
 * @returns {Promise<boolean>} - Результат операции
 */
async function deleteArtwork(id) {
  const result = await db.query('DELETE FROM artworks WHERE id = $1', [id]);
  return result.rowCount > 0;
}

/**
 * Получает список работ с пагинацией
 * @param {Object} options - Опции запроса
 * @returns {Promise<Array>} - Список работ
 */
async function getArtworks({ limit = 10, offset = 0, userId = null, isPublic = true }) {
  let query = 'SELECT a.*, u.username, u.display_name, u.avatar_url FROM artworks a JOIN users u ON a.user_id = u.id';
  const params = [];
  const conditions = [];
  
  if (userId) {
    conditions.push('a.user_id = $' + (params.length + 1));
    params.push(userId);
  }
  
  if (isPublic !== null) {
    conditions.push('a.is_public = $' + (params.length + 1));
    params.push(isPublic);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY a.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
  params.push(limit, offset);
  
  const result = await db.query(query, params);
  return result.rows;
}

/**
 * Добавляет лайк к работе
 * @param {number} userId - ID пользователя
 * @param {number} artworkId - ID работы
 * @returns {Promise<boolean>} - Результат операции
 */
async function likeArtwork(userId, artworkId) {
  try {
    await db.query(
      'INSERT INTO likes (user_id, artwork_id) VALUES ($1, $2) ON CONFLICT (user_id, artwork_id) DO NOTHING',
      [userId, artworkId]
    );
    return true;
  } catch (error) {
    console.error('Ошибка при добавлении лайка:', error);
    return false;
  }
}

/**
 * Удаляет лайк с работы
 * @param {number} userId - ID пользователя
 * @param {number} artworkId - ID работы
 * @returns {Promise<boolean>} - Результат операции
 */
async function unlikeArtwork(userId, artworkId) {
  const result = await db.query(
    'DELETE FROM likes WHERE user_id = $1 AND artwork_id = $2',
    [userId, artworkId]
  );
  return result.rowCount > 0;
}

/**
 * Получает количество лайков работы
 * @param {number} artworkId - ID работы
 * @returns {Promise<number>} - Количество лайков
 */
async function getArtworkLikesCount(artworkId) {
  const result = await db.query(
    'SELECT COUNT(*) as count FROM likes WHERE artwork_id = $1',
    [artworkId]
  );
  return parseInt(result.rows[0].count, 10);
}

/**
 * Проверяет, поставил ли пользователь лайк работе
 * @param {number} userId - ID пользователя
 * @param {number} artworkId - ID работы
 * @returns {Promise<boolean>} - Результат проверки
 */
async function hasUserLikedArtwork(userId, artworkId) {
  const result = await db.query(
    'SELECT 1 FROM likes WHERE user_id = $1 AND artwork_id = $2',
    [userId, artworkId]
  );
  return result.rows.length > 0;
}

export default {
  createArtwork,
  findArtworkById,
  updateArtwork,
  deleteArtwork,
  getArtworks,
  likeArtwork,
  unlikeArtwork,
  getArtworkLikesCount,
  hasUserLikedArtwork
};