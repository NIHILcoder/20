# VisioMera Evolution - Система сообщества и аккаунтов

## Описание

Этот проект реализует полную систему сообщества и аккаунтов для платформы VisioMera с использованием PostgreSQL без ORM. Система включает в себя управление пользователями, работами, коллекциями, комментариями и взаимодействиями между пользователями.

## Настройка базы данных

### Предварительные требования

1. Установленный PostgreSQL (версия 12 или выше)
2. Node.js (версия 14 или выше)

### Шаги настройки

1. **Создайте базу данных PostgreSQL**

   ```sql
   CREATE DATABASE visiomera;
   ```

2. **Настройте переменные окружения**

   Создайте файл `.env` в корне проекта на основе `.env.example` и заполните его своими данными:

   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=visiomera
   DB_USER=postgres
   DB_PASSWORD=ваш_пароль
   DB_SSL=false

   JWT_SECRET=ваш_секретный_ключ_jwt
   JWT_EXPIRES_IN=7d
   ```

3. **Инициализируйте базу данных**

   Запустите скрипт для создания всех необходимых таблиц:

   ```bash
   npm run db:init
   ```

## Структура базы данных

Система использует следующие основные таблицы:

- **users** - Пользователи системы
- **artworks** - Работы (генерации) пользователей
- **collections** - Коллекции работ
- **collection_items** - Связь между коллекциями и работами
- **comments** - Комментарии к работам
- **likes** - Лайки работ
- **follows** - Подписки между пользователями
- **tags** - Теги для работ
- **artwork_tags** - Связь между работами и тегами
- **notifications** - Уведомления пользователей
- **sessions** - Сессии пользователей

## API-маршруты

### Аутентификация

- `POST /api/auth/register` - Регистрация нового пользователя
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/logout` - Выход из системы
- `GET /api/auth/me` - Получение информации о текущем пользователе

### Пользователи

- `GET /api/users` - Получение списка пользователей
- `GET /api/users/:id` - Получение информации о пользователе
- `PUT /api/users/:id` - Обновление профиля пользователя
- `GET /api/users/:id/artworks` - Получение работ пользователя
- `GET /api/users/:id/collections` - Получение коллекций пользователя
- `GET /api/users/:id/followers` - Получение подписчиков пользователя
- `GET /api/users/:id/following` - Получение подписок пользователя

### Работы

- `POST /api/artworks` - Создание новой работы
- `GET /api/artworks` - Получение списка работ
- `GET /api/artworks/:id` - Получение информации о работе
- `PUT /api/artworks/:id` - Обновление работы
- `DELETE /api/artworks/:id` - Удаление работы
- `POST /api/artworks/:id/like` - Лайк работы
- `DELETE /api/artworks/:id/like` - Удаление лайка
- `GET /api/artworks/:id/comments` - Получение комментариев к работе
- `POST /api/artworks/:id/comments` - Добавление комментария

### Коллекции

- `POST /api/collections` - Создание новой коллекции
- `GET /api/collections` - Получение списка коллекций
- `GET /api/collections/:id` - Получение информации о коллекции
- `PUT /api/collections/:id` - Обновление коллекции
- `DELETE /api/collections/:id` - Удаление коллекции
- `POST /api/collections/:id/items` - Добавление работы в коллекцию
- `DELETE /api/collections/:id/items/:artworkId` - Удаление работы из коллекции

## Запуск проекта

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build

# Запуск в продакшен-режиме
npm start
```

## Технологии

- Next.js - Фреймворк для React
- PostgreSQL - База данных
- Node.js - Серверная платформа
- bcryptjs - Хеширование паролей
- jsonwebtoken - JWT-аутентификация
- pg - Драйвер PostgreSQL для Node.js