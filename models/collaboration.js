/**
 * Модель для работы с коллаборациями
 */

import db from '../db';

/**
 * Получение всех коллабораций
 * @returns {Promise<Array>} Массив коллабораций
 */
export async function getAllCollaborations() {
  try {
    const result = await db.query(
      `SELECT c.*, 
       u.username as initiator_username, u.display_name as initiator_name, u.avatar_url as initiator_avatar,
       (SELECT COUNT(*) FROM collaboration_participants WHERE collaboration_id = c.id) as participants_count
       FROM collaborations c
       JOIN users u ON c.initiator_id = u.id
       ORDER BY 
         CASE 
           WHEN c.status = 'open' THEN 1
           WHEN c.status = 'in_progress' THEN 2
           WHEN c.status = 'completed' THEN 3
         END, 
         c.created_at DESC`
    );
    
    // Преобразуем данные в формат, ожидаемый фронтендом
    const collaborations = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      createdAt: row.created_at,
      deadline: row.deadline,
      status: row.status,
      category: row.category,
      initiator: {
        id: row.initiator_id,
        name: row.initiator_name || row.initiator_username,
        avatar: row.initiator_avatar,
        role: 'Инициатор'
      },
      participants: [], // Будет заполнено отдельным запросом
      maxParticipants: row.max_participants,
      skills: row.skills || []
    }));
    
    // Для каждой коллаборации получаем участников
    for (const collab of collaborations) {
      const participantsResult = await db.query(
        `SELECT cp.*, u.username, u.display_name, u.avatar_url 
         FROM collaboration_participants cp
         JOIN users u ON cp.user_id = u.id
         WHERE cp.collaboration_id = $1 AND cp.status = 'active'`,
        [collab.id]
      );
      
      collab.participants = participantsResult.rows.map(p => ({
        id: p.user_id,
        name: p.display_name || p.username,
        avatar: p.avatar_url,
        role: p.role || 'Участник'
      }));
    }
    
    return collaborations;
  } catch (error) {
    console.error('Ошибка при получении коллабораций:', error);
    throw error;
  }
}

/**
 * Получение коллаборации по ID
 * @param {number} id - ID коллаборации
 * @returns {Promise<Object>} Данные коллаборации
 */
export async function getCollaborationById(id) {
  try {
    const result = await db.query(
      `SELECT c.*, 
       u.username as initiator_username, u.display_name as initiator_name, u.avatar_url as initiator_avatar
       FROM collaborations c
       JOIN users u ON c.initiator_id = u.id
       WHERE c.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    
    // Получаем участников
    const participantsResult = await db.query(
      `SELECT cp.*, u.username, u.display_name, u.avatar_url 
       FROM collaboration_participants cp
       JOIN users u ON cp.user_id = u.id
       WHERE cp.collaboration_id = $1 AND cp.status = 'active'`,
      [id]
    );
    
    const participants = participantsResult.rows.map(p => ({
      id: p.user_id,
      name: p.display_name || p.username,
      avatar: p.avatar_url,
      role: p.role || 'Участник'
    }));
    
    // Формируем объект в формате, ожидаемом фронтендом
    const collaboration = {
      id: row.id,
      title: row.title,
      description: row.description,
      createdAt: row.created_at,
      deadline: row.deadline,
      status: row.status,
      category: row.category,
      initiator: {
        id: row.initiator_id,
        name: row.initiator_name || row.initiator_username,
        avatar: row.initiator_avatar,
        role: 'Инициатор'
      },
      participants,
      maxParticipants: row.max_participants,
      skills: row.skills || []
    };
    
    return collaboration;
  } catch (error) {
    console.error(`Ошибка при получении коллаборации с ID ${id}:`, error);
    throw error;
  }
}

/**
 * Создание новой коллаборации
 * @param {Object} collaborationData - Данные коллаборации
 * @returns {Promise<Object>} Созданная коллаборация
 */
export async function createCollaboration(collaborationData) {
  try {
    const {
      title,
      description,
      deadline,
      status,
      category,
      initiatorId,
      maxParticipants,
      skills
    } = collaborationData;
    
    const result = await db.query(
      `INSERT INTO collaborations 
       (title, description, deadline, status, category, initiator_id, max_participants, skills) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [title, description, deadline, status, category, initiatorId, maxParticipants, skills]
    );
    
    // Автоматически добавляем инициатора как участника
    await db.query(
      `INSERT INTO collaboration_participants 
       (user_id, collaboration_id, join_date, status, role) 
       VALUES ($1, $2, CURRENT_DATE, 'active', 'Инициатор')`,
      [initiatorId, result.rows[0].id]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Ошибка при создании коллаборации:', error);
    throw error;
  }
}

/**
 * Обновление коллаборации
 * @param {number} id - ID коллаборации
 * @param {Object} collaborationData - Новые данные коллаборации
 * @returns {Promise<Object>} Обновленная коллаборация
 */
export async function updateCollaboration(id, collaborationData) {
  try {
    const {
      title,
      description,
      deadline,
      status,
      category,
      maxParticipants,
      skills
    } = collaborationData;
    
    const result = await db.query(
      `UPDATE collaborations 
       SET title = $1, description = $2, deadline = $3, status = $4, 
           category = $5, max_participants = $6, skills = $7, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $8 
       RETURNING *`,
      [title, description, deadline, status, category, maxParticipants, skills, id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error(`Ошибка при обновлении коллаборации с ID ${id}:`, error);
    throw error;
  }
}

/**
 * Удаление коллаборации
 * @param {number} id - ID коллаборации
 * @returns {Promise<boolean>} Результат удаления
 */
export async function deleteCollaboration(id) {
  try {
    const result = await db.query('DELETE FROM collaborations WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  } catch (error) {
    console.error(`Ошибка при удалении коллаборации с ID ${id}:`, error);
    throw error;
  }
}

/**
 * Присоединение пользователя к коллаборации
 * @param {number} userId - ID пользователя
 * @param {number} collaborationId - ID коллаборации
 * @param {string} role - Роль пользователя в коллаборации
 * @returns {Promise<Object>} Данные о присоединении
 */
export async function joinCollaboration(userId, collaborationId, role = 'Участник') {
  try {
    // Проверяем, не присоединился ли уже пользователь
    const checkResult = await db.query(
      'SELECT * FROM collaboration_participants WHERE user_id = $1 AND collaboration_id = $2',
      [userId, collaborationId]
    );
    
    if (checkResult.rows.length > 0) {
      // Если пользователь уже был участником, но покинул коллаборацию, обновляем его статус
      if (checkResult.rows[0].status === 'left') {
        const updateResult = await db.query(
          `UPDATE collaboration_participants 
           SET status = 'active', updated_at = CURRENT_TIMESTAMP 
           WHERE user_id = $1 AND collaboration_id = $2 
           RETURNING *`,
          [userId, collaborationId]
        );
        return updateResult.rows[0];
      }
      
      throw new Error('Пользователь уже участвует в этой коллаборации');
    }
    
    // Проверяем, не достигнут ли лимит участников
    const collaborationResult = await db.query(
      `SELECT c.max_participants, 
       (SELECT COUNT(*) FROM collaboration_participants WHERE collaboration_id = c.id AND status = 'active') as current_participants
       FROM collaborations c
       WHERE c.id = $1`,
      [collaborationId]
    );
    
    if (collaborationResult.rows.length === 0) {
      throw new Error('Коллаборация не найдена');
    }
    
    const collaboration = collaborationResult.rows[0];
    
    if (collaboration.current_participants >= collaboration.max_participants) {
      throw new Error('Достигнут лимит участников коллаборации');
    }
    
    // Добавляем пользователя
    const result = await db.query(
      `INSERT INTO collaboration_participants 
       (user_id, collaboration_id, join_date, status, role) 
       VALUES ($1, $2, CURRENT_DATE, 'active', $3) 
       RETURNING *`,
      [userId, collaborationId, role]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error(`Ошибка при присоединении пользователя ${userId} к коллаборации ${collaborationId}:`, error);
    throw error;
  }
}

/**
 * Проверка участия пользователя в коллаборации
 * @param {number} userId - ID пользователя
 * @param {number} collaborationId - ID коллаборации
 * @returns {Promise<Object|null>} Данные об участии или null
 */
export async function checkCollaborationParticipation(userId, collaborationId) {
  try {
    const result = await db.query(
      'SELECT * FROM collaboration_participants WHERE user_id = $1 AND collaboration_id = $2 AND status = \'active\'',
      [userId, collaborationId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error(`Ошибка при проверке участия пользователя ${userId} в коллаборации ${collaborationId}:`, error);
    throw error;
  }
}

/**
 * Получение всех участников коллаборации
 * @param {number} collaborationId - ID коллаборации
 * @returns {Promise<Array>} Массив участников
 */
export async function getCollaborationParticipants(collaborationId) {
  try {
    const result = await db.query(
      `SELECT cp.*, u.username, u.display_name, u.avatar_url 
       FROM collaboration_participants cp
       JOIN users u ON cp.user_id = u.id
       WHERE cp.collaboration_id = $1 AND cp.status = 'active'
       ORDER BY cp.join_date ASC`,
      [collaborationId]
    );
    
    return result.rows;
  } catch (error) {
    console.error(`Ошибка при получении участников коллаборации ${collaborationId}:`, error);
    throw error;
  }
}

export default {
  getAllCollaborations,
  getCollaborationById,
  createCollaboration,
  updateCollaboration,
  deleteCollaboration,
  joinCollaboration,
  checkCollaborationParticipation,
  getCollaborationParticipants
};