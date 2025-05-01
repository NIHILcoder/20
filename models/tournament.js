/**
 * Модель для работы с турнирами
 */

import db from '../db';

/**
 * Получение всех турниров
 * @returns {Promise<Array>} Массив турниров
 */
export async function getAllTournaments() {
  try {
    const result = await db.query(
      `SELECT t.*, 
       (SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = t.id) as participants
       FROM tournaments t
       ORDER BY 
         CASE 
           WHEN t.status = 'active' THEN 1
           WHEN t.status = 'upcoming' THEN 2
           WHEN t.status = 'completed' THEN 3
         END, 
         t.start_date ASC`
    );
    return result.rows;
  } catch (error) {
    console.error('Ошибка при получении турниров:', error);
    throw error;
  }
}

/**
 * Получение турнира по ID
 * @param {number} id - ID турнира
 * @returns {Promise<Object>} Данные турнира
 */
export async function getTournamentById(id) {
  try {
    const result = await db.query(
      `SELECT t.*, 
       (SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = t.id) as participants
       FROM tournaments t
       WHERE t.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error(`Ошибка при получении турнира с ID ${id}:`, error);
    throw error;
  }
}

/**
 * Создание нового турнира
 * @param {Object} tournamentData - Данные турнира
 * @returns {Promise<Object>} Созданный турнир
 */
export async function createTournament(tournamentData) {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      maxParticipants,
      prize,
      status,
      image,
      category,
      rules,
      organizer,
      submissionDeadline
    } = tournamentData;
    
    const result = await db.query(
      `INSERT INTO tournaments 
       (title, description, start_date, end_date, max_participants, prize, status, image, category, rules, organizer, submission_deadline) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
      [title, description, startDate, endDate, maxParticipants, prize, status, image, category, rules, organizer, submissionDeadline]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Ошибка при создании турнира:', error);
    throw error;
  }
}

/**
 * Обновление турнира
 * @param {number} id - ID турнира
 * @param {Object} tournamentData - Новые данные турнира
 * @returns {Promise<Object>} Обновленный турнир
 */
export async function updateTournament(id, tournamentData) {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      maxParticipants,
      prize,
      status,
      image,
      category,
      rules,
      organizer,
      submissionDeadline
    } = tournamentData;
    
    const result = await db.query(
      `UPDATE tournaments 
       SET title = $1, description = $2, start_date = $3, end_date = $4, 
           max_participants = $5, prize = $6, status = $7, image = $8, 
           category = $9, rules = $10, organizer = $11, submission_deadline = $12, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $13 
       RETURNING *`,
      [title, description, startDate, endDate, maxParticipants, prize, status, image, category, rules, organizer, submissionDeadline, id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error(`Ошибка при обновлении турнира с ID ${id}:`, error);
    throw error;
  }
}

/**
 * Удаление турнира
 * @param {number} id - ID турнира
 * @returns {Promise<boolean>} Результат удаления
 */
export async function deleteTournament(id) {
  try {
    const result = await db.query('DELETE FROM tournaments WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  } catch (error) {
    console.error(`Ошибка при удалении турнира с ID ${id}:`, error);
    throw error;
  }
}

/**
 * Регистрация пользователя на турнир
 * @param {number} userId - ID пользователя
 * @param {number} tournamentId - ID турнира
 * @returns {Promise<Object>} Данные о регистрации
 */
export async function registerUserForTournament(userId, tournamentId) {
  try {
    // Проверяем, не зарегистрирован ли уже пользователь
    const checkResult = await db.query(
      'SELECT * FROM tournament_participants WHERE user_id = $1 AND tournament_id = $2',
      [userId, tournamentId]
    );
    
    if (checkResult.rows.length > 0) {
      throw new Error('Пользователь уже зарегистрирован на этот турнир');
    }
    
    // Проверяем, не достигнут ли лимит участников
    const tournamentResult = await db.query(
      `SELECT t.max_participants, 
       (SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = t.id) as current_participants
       FROM tournaments t
       WHERE t.id = $1`,
      [tournamentId]
    );
    
    if (tournamentResult.rows.length === 0) {
      throw new Error('Турнир не найден');
    }
    
    const tournament = tournamentResult.rows[0];
    
    if (tournament.current_participants >= tournament.max_participants) {
      throw new Error('Достигнут лимит участников турнира');
    }
    
    // Регистрируем пользователя
    const result = await db.query(
      `INSERT INTO tournament_participants 
       (user_id, tournament_id, registration_date, status) 
       VALUES ($1, $2, CURRENT_DATE, 'registered') 
       RETURNING *`,
      [userId, tournamentId]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error(`Ошибка при регистрации пользователя ${userId} на турнир ${tournamentId}:`, error);
    throw error;
  }
}

/**
 * Проверка участия пользователя в турнире
 * @param {number} userId - ID пользователя
 * @param {number} tournamentId - ID турнира
 * @returns {Promise<Object|null>} Данные об участии или null
 */
export async function checkTournamentParticipation(userId, tournamentId) {
  try {
    const result = await db.query(
      'SELECT * FROM tournament_participants WHERE user_id = $1 AND tournament_id = $2',
      [userId, tournamentId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error(`Ошибка при проверке участия пользователя ${userId} в турнире ${tournamentId}:`, error);
    throw error;
  }
}

/**
 * Получение всех участников турнира
 * @param {number} tournamentId - ID турнира
 * @returns {Promise<Array>} Массив участников
 */
export async function getTournamentParticipants(tournamentId) {
  try {
    const result = await db.query(
      `SELECT tp.*, u.username, u.display_name, u.avatar_url 
       FROM tournament_participants tp
       JOIN users u ON tp.user_id = u.id
       WHERE tp.tournament_id = $1
       ORDER BY tp.registration_date ASC`,
      [tournamentId]
    );
    
    return result.rows;
  } catch (error) {
    console.error(`Ошибка при получении участников турнира ${tournamentId}:`, error);
    throw error;
  }
}

export default {
  getAllTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  registerUserForTournament,
  checkTournamentParticipation,
  getTournamentParticipants
};