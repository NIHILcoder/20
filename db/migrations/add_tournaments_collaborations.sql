-- Миграция для добавления таблиц турниров и коллабораций

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

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_id ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user_id ON tournament_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_status ON collaborations(status);
CREATE INDEX IF NOT EXISTS idx_collaborations_initiator_id ON collaborations(initiator_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_participants_collaboration_id ON collaboration_participants(collaboration_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_participants_user_id ON collaboration_participants(user_id);