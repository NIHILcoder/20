/**
 * Скрипт для создания таблицы prompt_tags (CommonJS версия)
 */

const db = require('../db/index.js');

async function createPromptTagsTable() {
  try {
    // SQL для создания таблицы prompt_tags
    const createTableSQL = `
      -- Создание таблицы тегов промптов, если она не существует
      CREATE TABLE IF NOT EXISTS prompt_tags (
        id SERIAL PRIMARY KEY,
        prompt_id INTEGER REFERENCES prompts(id) ON DELETE CASCADE,
        tag_name VARCHAR(50) NOT NULL,
        UNIQUE(prompt_id, tag_name)
      );

      -- Создание индексов
      CREATE INDEX IF NOT EXISTS idx_prompt_tags_prompt_id ON prompt_tags(prompt_id);
      CREATE INDEX IF NOT EXISTS idx_prompt_tags_tag_name ON prompt_tags(tag_name);
    `;

    // Выполнение SQL-запроса
    await db.query(createTableSQL);
    console.log('Таблица prompt_tags успешно создана!');
  } catch (error) {
    console.error('Ошибка при создании таблицы prompt_tags:', error);
  } finally {
    // Закрываем пул соединений
    db.pool.end();
  }
}

// Запускаем функцию создания таблицы
createPromptTagsTable();