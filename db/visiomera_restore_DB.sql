-- =================================================================
-- СКРИПТ ПОЛНОГО ВОССТАНОВЛЕНИЯ БАЗЫ ДАННЫХ VISIOMERA
-- =================================================================

-- Создание базы данных (если не существует)
-- CREATE DATABASE IF NOT EXISTS visiomera;

-- Подключение к базе данных (выполните вручную: \c visiomera)
-- \c visiomera;

-- =================================================================
-- ОСНОВНАЯ СХЕМА БАЗЫ ДАННЫХ
-- =================================================================

-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url VARCHAR(255),
  credits INTEGER DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP WITH TIME ZONE
);

-- Создание таблицы работ (генераций)
CREATE TABLE IF NOT EXISTS artworks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100),
  description TEXT,
  image_url VARCHAR(255) NOT NULL,
  prompt TEXT,
  negative_prompt TEXT,
  model VARCHAR(100),
  parameters JSONB,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  views INTEGER DEFAULT 0
);

-- Создание таблицы коллекций
CREATE TABLE IF NOT EXISTS collections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  cover_image_url VARCHAR(255),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы связи работ и коллекций
CREATE TABLE IF NOT EXISTS collection_items (
  id SERIAL PRIMARY KEY,
  collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
  artwork_id INTEGER REFERENCES artworks(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(collection_id, artwork_id)
);

-- Создание таблицы комментариев
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  artwork_id INTEGER REFERENCES artworks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы лайков
CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  artwork_id INTEGER REFERENCES artworks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, artwork_id)
);

-- Создание таблицы подписок
CREATE TABLE IF NOT EXISTS follows (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id)
);

-- Создание таблицы тегов
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

-- Создание таблицы связи работ и тегов
CREATE TABLE IF NOT EXISTS artwork_tags (
  id SERIAL PRIMARY KEY,
  artwork_id INTEGER REFERENCES artworks(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(artwork_id, tag_id)
);

-- Создание таблицы уведомлений
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы сессий
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- ТАБЛИЦЫ ПРОМПТОВ
-- =================================================================

-- Создание таблицы промптов
CREATE TABLE IF NOT EXISTS prompts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  text TEXT NOT NULL,
  category VARCHAR(50),
  tags TEXT[] DEFAULT '{}',
  negative TEXT,
  notes TEXT,
  parameters JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  favorite BOOLEAN DEFAULT FALSE,
  rating INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы избранных промптов
CREATE TABLE IF NOT EXISTS prompt_favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  prompt_id INTEGER REFERENCES prompts(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, prompt_id)
);

-- Создание таблицы рейтингов промптов
CREATE TABLE IF NOT EXISTS prompt_ratings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  prompt_id INTEGER REFERENCES prompts(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, prompt_id)
);

-- Создание таблицы тегов промптов
CREATE TABLE IF NOT EXISTS prompt_tags (
  id SERIAL PRIMARY KEY,
  prompt_id INTEGER REFERENCES prompts(id) ON DELETE CASCADE,
  tag_name VARCHAR(50) NOT NULL,
  UNIQUE(prompt_id, tag_name)
);

-- =================================================================
-- ТАБЛИЦЫ ТУРНИРОВ И КОЛЛАБОРАЦИЙ
-- =================================================================

-- Создание таблицы турниров
CREATE TABLE IF NOT EXISTS tournaments (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  max_participants INTEGER NOT NULL,
  prize VARCHAR(100),
  status VARCHAR(20) NOT NULL CHECK (status IN ('upcoming', 'active', 'completed')),
  image VARCHAR(255),
  category VARCHAR(50),
  rules TEXT,
  organizer VARCHAR(100),
  submission_deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы участников турнира
CREATE TABLE IF NOT EXISTS tournament_participants (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
  registration_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('registered', 'submitted', 'finalist', 'winner')),
  submission_url VARCHAR(255),
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, tournament_id)
);

-- Создание таблицы коллабораций
CREATE TABLE IF NOT EXISTS collaborations (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deadline DATE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('open', 'in_progress', 'completed')),
  category VARCHAR(50),
  initiator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  max_participants INTEGER NOT NULL,
  skills TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы участников коллабораций
CREATE TABLE IF NOT EXISTS collaboration_participants (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  collaboration_id INTEGER REFERENCES collaborations(id) ON DELETE CASCADE,
  join_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'completed', 'left')),
  role VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, collaboration_id)
);

-- =================================================================
-- ПРОВЕРКА И ДОБАВЛЕНИЕ СТОЛБЦА CREDITS (если не существует)
-- =================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'credits'
    ) THEN
        ALTER TABLE users ADD COLUMN credits INTEGER DEFAULT 1000;
        UPDATE users SET credits = 1000 WHERE credits IS NULL;
        RAISE NOTICE 'Столбец credits добавлен в таблицу users';
    ELSE
        RAISE NOTICE 'Столбец credits уже существует в таблице users';
    END IF;
END
$$;

-- =================================================================
-- СОЗДАНИЕ ИНДЕКСОВ ДЛЯ ОПТИМИЗАЦИИ
-- =================================================================

-- Индексы для основных таблиц
CREATE INDEX IF NOT EXISTS idx_artworks_user_id ON artworks(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_artwork_id ON comments(artwork_id);
CREATE INDEX IF NOT EXISTS idx_likes_artwork_id ON likes(artwork_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Индексы для промптов
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompt_favorites_user_id ON prompt_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_favorites_prompt_id ON prompt_favorites(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_ratings_prompt_id ON prompt_ratings(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_tags_prompt_id ON prompt_tags(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_tags_tag_name ON prompt_tags(tag_name);

-- Индексы для турниров и коллабораций
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_id ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user_id ON tournament_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_status ON collaborations(status);
CREATE INDEX IF NOT EXISTS idx_collaborations_initiator_id ON collaborations(initiator_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_participants_collaboration_id ON collaboration_participants(collaboration_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_participants_user_id ON collaboration_participants(user_id);

-- =================================================================
-- ЗАВЕРШЕНИЕ ВОССТАНОВЛЕНИЯ
-- =================================================================

-- Обновление статистики таблиц
ANALYZE;

-- Вывод информации о созданных таблицах
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Итоговое сообщение
SELECT 'База данных visiomera успешно восстановлена!' as status;
SELECT 'Созданы все таблицы, индексы и ограничения.' as info;
SELECT 'Проверьте структуру базы данных перед импортом данных.' as next_steps;