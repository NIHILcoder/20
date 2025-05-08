-- Создание таблицы промптов (если еще не существует)
CREATE TABLE IF NOT EXISTS prompts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  text TEXT NOT NULL,
  category VARCHAR(50),
  negative TEXT,
  notes TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  favorite BOOLEAN DEFAULT FALSE,
  rating INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  parameters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы тегов промптов
CREATE TABLE IF NOT EXISTS prompt_tags (
  id SERIAL PRIMARY KEY,
  prompt_id INTEGER REFERENCES prompts(id) ON DELETE CASCADE,
  tag_name VARCHAR(50) NOT NULL,
  UNIQUE(prompt_id, tag_name)
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_prompt_tags_prompt_id ON prompt_tags(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_tags_tag_name ON prompt_tags(tag_name);