/**
 * Скрипт для добавления столбца credits в таблицу users
 */

const db = require('../db');

async function addCreditsColumn() {
  try {
    console.log('Добавление столбца credits в таблицу users...');
    
    // Проверяем, существует ли столбец credits в таблице users
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'credits'
    `;
    
    const columnExists = await db.query(checkColumnQuery);
    
    if (columnExists.rows.length === 0) {
      // Добавляем столбец credits с значением по умолчанию 1000
      await db.query(`ALTER TABLE users ADD COLUMN credits INTEGER DEFAULT 1000`);
      
      // Обновляем существующие записи
      await db.query(`UPDATE users SET credits = 1000 WHERE credits IS NULL`);
      
      console.log('Столбец credits успешно добавлен в таблицу users!');
    } else {
      console.log('Столбец credits уже существует в таблице users.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при добавлении столбца credits:', error);
    process.exit(1);
  }
}

// Запуск функции
addCreditsColumn();