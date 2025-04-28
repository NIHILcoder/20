/**
 * Скрипт для инициализации базы данных
 * Запускается командой: npm run db:init
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const dbConfig = require('../config/database');

// Создание пула соединений с базой данных
const pool = new Pool({
  host: dbConfig.connection.host,
  port: dbConfig.connection.port,
  database: dbConfig.connection.database,
  user: dbConfig.connection.user,
  password: dbConfig.connection.password,
  ssl: dbConfig.connection.ssl
});

// Путь к файлу схемы базы данных
const schemaPath = path.join(__dirname, '../db/schema.sql');

async function initDb() {
  console.log('Начало инициализации базы данных...');
  
  try {
    // Чтение файла схемы
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Подключение к базе данных
    const client = await pool.connect();
    
    try {
      // Выполнение SQL-запросов из файла схемы
      await client.query(schema);
      console.log('База данных успешно инициализирована!');
    } finally {
      // Освобождение клиента
      client.release();
    }
  } catch (err) {
    console.error('Ошибка при инициализации базы данных:', err);
    process.exit(1);
  } finally {
    // Закрытие пула соединений
    await pool.end();
  }
}

// Запуск инициализации
initDb();