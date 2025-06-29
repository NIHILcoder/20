/**
 * Конфигурация подключения к базе данных PostgreSQL (CommonJS версия)
 */

module.exports = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'visiomera',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123',
    ssl: process.env.DB_SSL === 'true' ? true : false,
    
    // Настройки пула соединений
    max: 10,
    idleTimeoutMillis: 30000
  };