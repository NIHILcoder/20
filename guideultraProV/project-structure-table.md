# Структура проекта VisioMera Evolution

Эта таблица показывает, какие файлы и компоненты относятся к каждой странице приложения.

## Страницы и связанные компоненты

| Страница | Файл страницы | Основные компоненты | API маршруты | Модели |
|----------|---------------|---------------------|--------------|--------|
| **Корневой макет** | `app/layout.tsx` | - `components/app-sidebar.tsx`<br>- `components/header.tsx`<br>- `components/bottom-nav.tsx`<br>- `contexts/theme-provider.tsx`<br>- `contexts/auth-context.tsx`<br>- `contexts/language-context.tsx` | - | - |
| **Главная** | `app/page.tsx` | - `improved-generation-form.tsx`<br>- `enhanced-particles-background.tsx` | - | - |
| **Сообщество** | `app/community/page.tsx` | - `community/artwork-grid.tsx`<br>- `community/community-filters.tsx`<br>- `community/tournaments.tsx`<br>- `community/collaborations.tsx`<br>- `enhanced-particles-background.tsx` | `api/community/` | - `artwork.js`<br>- `tournament.js`<br>- `collaboration.js` |
| **Избранное** | `app/favorites/page.tsx` | - `favorites/collections-grid.tsx`<br>- `favorites/collection-items.tsx`<br>- `particles-background.tsx` | - `api/favorites/`<br>- `api/collection/`<br>- `api/collection-items/` | - `collection.js` |
| **История** | `app/history/page.tsx` | - `history/history-list.tsx`<br>- `generation-statistics.tsx`<br>- `particles-background.tsx` | - `api/history/`<br>- `api/statistics/` | - `artwork.js` |
| **Профиль** | `app/profile/page.tsx` | - `particles-background.tsx`<br>- `avatar-upload.tsx` | - `api/user/` | - `user.js` |
| **Настройки** | `app/settings/page.tsx` | - `settings-components.tsx`<br>- `appearance-settings.tsx`<br>- `change-password-form.tsx` | - `api/user/` | - `user.js` |
| **Вход** | `app/login/page.tsx` | - `particles-background.tsx` | - `api/auth/` | - `user.js` |
| **Промпты** | `app/prompts/page.tsx` | - `prompts/comments-section.tsx`<br>- `prompts/hierarchical-categories.tsx`<br>- `prompts/infinite-scroll.tsx`<br>- `prompts/prompt-collections.tsx`<br>- `prompts/prompt-comments.tsx`<br>- `prompts/tags-selector.tsx` | - `api/prompts/` | - |
| **Обучение** | `app/learning/page.tsx` | - | - | - |
| **О нас** | `app/about/page.tsx` | - | - | - |

## Общие компоненты

| Тип компонента | Файлы |
|----------------|-------|
| **Навигация** | - `app-sidebar.tsx`<br>- `bottom-nav.tsx`<br>- `header.tsx` |
| **Контексты** | - `auth-context.tsx`<br>- `language-context.tsx`<br>- `theme-provider.tsx` |
| **UI компоненты** | - `ui/button.tsx`<br>- `ui/card.tsx`<br>- `ui/tabs.tsx`<br>- `ui/dialog.tsx`<br>- `ui/dropdown-menu.tsx`<br>- `ui/input.tsx`<br>- и другие в папке `components/ui/` |

## Структура базы данных

Основные таблицы базы данных:

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

## Примечание

Для визуализации структуры проекта в виде диаграммы используйте файл `project-structure.puml` с помощью PlantUML.