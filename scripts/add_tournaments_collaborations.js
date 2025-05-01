/**
 * Скрипт для добавления таблиц турниров и коллабораций в базу данных
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db/index.js';

// Получение текущего пути файла для ES модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('Запуск миграции для добавления таблиц турниров и коллабораций...');
    
    // Чтение SQL-файла миграции
    const migrationPath = path.join(__dirname, '../db/migrations/add_tournaments_collaborations.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Выполнение SQL-запросов
    await db.query(migrationSQL);
    
    console.log('Миграция успешно выполнена!');
    console.log('Добавлены таблицы: tournaments, tournament_participants, collaborations, collaboration_participants');
    
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при выполнении миграции:', error);
    process.exit(1);
  }
}

runMigration();