/**
 * Модуль для работы с базой данных PostgreSQL
 */

import pkg from 'pg';
const { Pool } = pkg;
import dbConfig from '../config/database.js';

// Создание пула соединений с базой данных
const pool = new Pool({
  host: dbConfig.connection.host,
  port: dbConfig.connection.port,
  database: dbConfig.connection.database,
  user: dbConfig.connection.user,
  password: dbConfig.connection.password,
  ssl: dbConfig.connection.ssl,
  max: dbConfig.pool.max,
  idleTimeoutMillis: dbConfig.pool.idleTimeoutMillis,
  connectionTimeoutMillis: 2000,
});

// Обработка ошибок подключения
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Выполняет SQL-запрос к базе данных
 * @param {string} text - SQL-запрос
 * @param {Array} params - Параметры запроса
 * @returns {Promise} - Результат запроса
 */
const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

/**
 * Выполняет транзакцию в базе данных
 * @param {Function} callback - Функция, выполняющая запросы в транзакции
 * @returns {Promise} - Результат транзакции
 */
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

export default {
  query,
  transaction,
  pool
};