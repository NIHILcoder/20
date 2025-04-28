/**
 * Модель для работы с коллекциями
 */

const db = require('../db');

/**
 * Создает новую коллекцию
 * @param {Object} collectionData - Данные коллекции
 * @returns {Promise<Object>} - Созданная коллекция
 */
async function createCollection({ userId, name, description, coverImageUrl = null, isPublic = true }) {
  const result = await db.query(
    'INSERT INTO collections (user_id, name, description, cover_image_url, is_public) VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id, name, description, cover_image_url, is_public, created_at',
    [userId, name, description, coverImageUrl, isPublic]
  );
  
  return result.rows[0];
}

/**
 * Находит коллекцию по ID
 * @param {number} id - ID коллекции
 * @returns {Promise<Object|null>} - Найденная коллекция или null
 */
async function findCollectionById(id) {
  const result = await db.query(
    'SELECT c.*, u.username, u.display_name FROM collections c JOIN users u ON c.user_id = u.id WHERE c.id = $1',
    [id]
  );
  
  return result.rows[0] || null;
}

/**
 * Получает коллекции пользователя
 * @param {number} userId - ID пользователя
 * @returns {Promise<Array>} - Список коллекций
 */
async function getUserCollections(userId) {
  const result = await db.query(
    `SELECT c.*, 
      (SELECT COUNT(*) FROM collection_items ci WHERE ci.collection_id = c.id) as item_count,
      (SELECT a.image_url FROM collection_items ci 
       JOIN artworks a ON ci.artwork_id = a.id 
       WHERE ci.collection_id = c.id 
       ORDER BY ci.added_at DESC LIMIT 1) as cover_image
    FROM collections c
    WHERE c.user_id = $1
    ORDER BY c.updated_at DESC`,
    [userId]
  );
  
  return result.rows;
}

/**
 * Обновляет коллекцию
 * @param {number} id - ID коллекции
 * @param {Object} collectionData - Данные для обновления
 * @returns {Promise<Object>} - Обновленная коллекция
 */
async function updateCollection(id, { name, description, coverImageUrl, isPublic }) {
  const result = await db.query(
    'UPDATE collections SET name = COALESCE($1, name), description = COALESCE($2, description), cover_image_url = COALESCE($3, cover_image_url), is_public = COALESCE($4, is_public), updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, user_id, name, description, cover_image_url, is_public, created_at, updated_at',
    [name, description, coverImageUrl, isPublic, id]
  );
  
  return result.rows[0];
}

/**
 * Удаляет коллекцию
 * @param {number} id - ID коллекции
 * @returns {Promise<boolean>} - Результат операции
 */
async function deleteCollection(id) {
  const result = await db.query('DELETE FROM collections WHERE id = $1', [id]);
  return result.rowCount > 0;
}

/**
 * Добавляет работу в коллекцию
 * @param {number} collectionId - ID коллекции
 * @param {number} artworkId - ID работы
 * @returns {Promise<Object>} - Результат операции
 */
async function addArtworkToCollection(collectionId, artworkId) {
  try {
    const result = await db.query(
      'INSERT INTO collection_items (collection_id, artwork_id) VALUES ($1, $2) ON CONFLICT (collection_id, artwork_id) DO NOTHING RETURNING id, collection_id, artwork_id, added_at',
      [collectionId, artworkId]
    );
    return result.rows[0] || { success: true };
  } catch (error) {
    console.error('Ошибка при добавлении работы в коллекцию:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Удаляет работу из коллекции
 * @param {number} collectionId - ID коллекции
 * @param {number} artworkId - ID работы
 * @returns {Promise<boolean>} - Результат операции
 */
async function removeArtworkFromCollection(collectionId, artworkId) {
  const result = await db.query(
    'DELETE FROM collection_items WHERE collection_id = $1 AND artwork_id = $2',
    [collectionId, artworkId]
  );
  return result.rowCount > 0;
}

/**
 * Получает работы из коллекции
 * @param {number} collectionId - ID коллекции
 * @returns {Promise<Array>} - Список работ
 */
async function getCollectionArtworks(collectionId) {
  const result = await db.query(
    `SELECT a.*, u.username, u.display_name, u.avatar_url, ci.added_at
    FROM collection_items ci
    JOIN artworks a ON ci.artwork_id = a.id
    JOIN users u ON a.user_id = u.id
    WHERE ci.collection_id = $1
    ORDER BY ci.added_at DESC`,
    [collectionId]
  );
  
  return result.rows;
}

module.exports = {
  createCollection,
  findCollectionById,
  getUserCollections,
  updateCollection,
  deleteCollection,
  addArtworkToCollection,
  removeArtworkFromCollection,
  getCollectionArtworks
};