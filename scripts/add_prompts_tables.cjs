// Скрипт для добавления таблиц промптов в базу данных
const config = require('../config/database');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Импортируем конфигурацию вручную, поскольку файл config использует ES модули
const configModule = require('../config/database.cjs');
// Если вы не переименовали файл конфигурации в .cjs, создайте его

// Создаем подключение к базе данных - используем параметры из .connection
const pool = new Pool(config.default?.connection || config.connection || config.default || config);

async function runMigration() {
  try {
    console.log('Начинаем миграцию таблиц промптов...');
    
    // Читаем SQL-файл миграции
    const migrationPath = path.join(__dirname, '../db/migrations/add_prompts_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Выполняем SQL-запросы
    await pool.query(migrationSQL);
    
    console.log('Миграция успешно завершена!');
    console.log('Добавлены таблицы: prompts, prompt_favorites, prompt_ratings');
  } catch (error) {
    console.error('Ошибка при выполнении миграции:', error);
  } finally {
    // Закрываем подключение к базе данных
    await pool.end();
  }
}

// Запускаем миграцию
runMigration();