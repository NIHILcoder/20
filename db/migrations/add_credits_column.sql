-- Миграция для добавления столбца credits в таблицу users

-- Проверяем, существует ли столбец credits в таблице users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'credits'
    ) THEN
        -- Добавляем столбец credits с значением по умолчанию 1000
        ALTER TABLE users ADD COLUMN credits INTEGER DEFAULT 1000;
        
        -- Обновляем существующие записи, устанавливая значение credits = 1000
        UPDATE users SET credits = 1000 WHERE credits IS NULL;
    END IF;
END
$$;