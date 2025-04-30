/**
 * Модель для работы с пользователями
 */

import db from '../db';
import bcrypt from 'bcryptjs';

/**
 * Создает нового пользователя
 * @param {Object} userData - Данные пользователя
 * @returns {Promise<Object>} - Созданный пользователь
 */
async function createUser({ username, email, password, displayName }) {
  // Хеширование пароля
  const passwordHash = await bcrypt.hash(password, 10);
  
  const result = await db.query(
    'INSERT INTO users (username, email, password_hash, display_name) VALUES ($1, $2, $3, $4) RETURNING id, username, email, display_name, created_at',
    [username, email, passwordHash, displayName || username]
  );
  
  return result.rows[0];
}

/**
 * Находит пользователя по имени пользователя или email
 * @param {string} usernameOrEmail - Имя пользователя или email
 * @returns {Promise<Object|null>} - Найденный пользователь или null
 */
async function findUserByUsernameOrEmail(usernameOrEmail) {
  const result = await db.query(
    'SELECT id, username, email, password_hash, display_name, bio, avatar_url, created_at, is_verified FROM users WHERE username = $1 OR email = $1',
    [usernameOrEmail]
  );
  
  return result.rows[0] || null;
}

/**
 * Находит пользователя по ID
 * @param {number} id - ID пользователя
 * @returns {Promise<Object|null>} - Найденный пользователь или null
 */
async function findUserById(id) {
  const result = await db.query(
    'SELECT id, username, email, display_name, bio, avatar_url, credits, created_at, is_verified FROM users WHERE id = $1',
    [id]
  );
  
  return result.rows[0] || null;
}

/**
 * Обновляет профиль пользователя
 * @param {number} id - ID пользователя
 * @param {Object} userData - Данные для обновления
 * @returns {Promise<Object>} - Обновленный пользователь
 */
async function updateUserProfile(id, { displayName, bio, avatarUrl, email }) {
  const result = await db.query(
    'UPDATE users SET display_name = COALESCE($1, display_name), bio = COALESCE($2, bio), avatar_url = COALESCE($3, avatar_url), email = COALESCE($4, email), updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, username, email, display_name, bio, avatar_url, created_at, updated_at',
    [displayName, bio, avatarUrl, email, id]
  );
  
  return result.rows[0];
}

/**
 * Проверяет правильность пароля
 * @param {string} password - Пароль для проверки
 * @param {string} passwordHash - Хеш пароля из базы данных
 * @returns {Promise<boolean>} - Результат проверки
 */
async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

/**
 * Изменяет пароль пользователя
 * @param {number} id - ID пользователя
 * @param {string} newPassword - Новый пароль
 * @returns {Promise<boolean>} - Результат операции
 */
async function changePassword(id, newPassword) {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  const result = await db.query(
    'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [passwordHash, id]
  );
  
  return result.rowCount > 0;
}

/**
 * Получает список пользователей с пагинацией
 * @param {number} limit - Количество записей на странице
 * @param {number} offset - Смещение
 * @returns {Promise<Array>} - Список пользователей
 */
async function getUsers(limit = 10, offset = 0) {
  const result = await db.query(
    'SELECT id, username, display_name, avatar_url, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  
  return result.rows;
}

export {
  createUser,
  findUserByUsernameOrEmail,
  findUserById,
  updateUserProfile,
  verifyPassword,
  changePassword,
  getUsers
};