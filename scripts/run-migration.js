/**
 * Скрипт для выполнения SQL-миграций
 */

const fs = require('fs');
const path = require('path');
const db = require('../db');

async function runMigration() {
  try {
    console.log('Запуск миграции для добавления столбца credits...');
    
    // Чтение файла миграции
    const migrationPath = path.join(__dirname, '../db/migrations/add_credits_column.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Выполнение SQL-миграции
    await db.query(migrationSQL);
    
    console.log('Миграция успешно выполнена!');
    console.log('Столбец credits добавлен в таблицу users.');
    
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при выполнении миграции:', error);
    process.exit(1);
  }
}

// Запуск миграции
runMigration();