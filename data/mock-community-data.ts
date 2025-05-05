/**
 * Файл с тестовыми данными для турниров и коллабораций
 * Используется для демонстрации функциональности присоединения
 */

import { User } from '@/types/user';

/**
 * Интерфейс для турнира
 */
export interface Tournament {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  participants: number;
  maxParticipants: number;
  prize: string;
  status: 'upcoming' | 'active' | 'completed';
  image: string;
  category: string;
  rules?: string;
  organizer?: string;
  submissionDeadline?: string;
}

/**
 * Интерфейс для коллаборации
 */
export interface Collaboration {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  deadline: string;
  status: 'open' | 'in_progress' | 'completed';
  category: string;
  initiator: {
    id: number;
    name: string;
    avatar: string;
    role: string;
  };
  participants: {
    id: number;
    name: string;
    avatar: string;
    role: string;
  }[];
  maxParticipants: number;
  skills: string[];
}

/**
 * Тестовые данные для турниров
 */
export const mockTournaments: Tournament[] = [
  {
    id: 1,
    title: 'Весенний конкурс цифрового искусства',
    description: 'Создайте уникальное произведение искусства, отражающее тему "Возрождение природы". Лучшие работы будут представлены на виртуальной выставке.',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 дней назад
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 дней вперед
    participants: 45,
    maxParticipants: 100,
    prize: 'Графический планшет Wacom Intuos Pro + подписка на Adobe Creative Cloud на год',
    status: 'active',
    image: 'https://i.pravatar.cc/300?img=1',
    category: 'Цифровое искусство',
    rules: 'Работы должны быть созданы с использованием ИИ-инструментов. Формат: JPG или PNG, разрешение не менее 2000x2000 пикселей.',
    organizer: 'Студия VisioMera',
    submissionDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() // 10 дней вперед
  },
  {
    id: 2,
    title: 'Фантастические миры будущего',
    description: 'Турнир для создателей концепт-артов. Создайте визуализацию футуристического мира 2150 года с использованием передовых технологий ИИ.',
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 дней вперед
    endDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 дней вперед
    participants: 0,
    maxParticipants: 50,
    prize: '50 000 рублей и возможность работы с ведущей игровой студией',
    status: 'upcoming',
    image: 'https://i.pravatar.cc/300?img=2',
    category: 'Концепт-арт',
    rules: 'Участники должны предоставить серию из 3-5 изображений, демонстрирующих различные аспекты придуманного мира.',
    organizer: 'GameDev Future',
    submissionDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 дней вперед
  },
  {
    id: 3,
    title: 'Ретроспектива: Искусство в стиле 80-х',
    description: 'Создайте произведения в стиле ретро-волны, вдохновленные эстетикой 1980-х годов. Синтвейв, неон и пиксельная графика приветствуются!',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 дней назад
    endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 дня назад
    participants: 78,
    maxParticipants: 80,
    prize: 'Коллекционное издание ретро-консоли с предустановленными играми 80-х',
    status: 'completed',
    image: 'https://i.pravatar.cc/300?img=3',
    category: 'Ретро-арт',
    rules: 'Работы должны соответствовать эстетике 80-х годов. Анимированные GIF также принимаются к участию.',
    organizer: 'Retrowave Community',
    submissionDeadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 дней назад
  },
  {
    id: 4,
    title: 'Портреты будущего',
    description: 'Создайте портреты людей будущего с использованием ИИ. Как будут выглядеть люди через 100 лет?',
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 дня назад
    endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 дней вперед
    participants: 23,
    maxParticipants: 150,
    prize: 'Профессиональная фотосессия и публикация в журнале "Искусство будущего"',
    status: 'active',
    image: 'https://i.pravatar.cc/300?img=4',
    category: 'Портреты',
    rules: 'Каждый участник может представить до 3 портретов. Работы должны сопровождаться кратким описанием концепции.',
    organizer: 'Галерея современного искусства',
    submissionDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString() // 20 дней вперед
  },
  {
    id: 5,
    title: 'Архитектура невозможного',
    description: 'Турнир для архитекторов и дизайнеров. Создайте невозможные архитектурные сооружения, которые бросают вызов законам физики.',
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 дней вперед
    endDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(), // 40 дней вперед
    participants: 0,
    maxParticipants: 75,
    prize: 'Грант на обучение в школе архитектурного дизайна',
    status: 'upcoming',
    image: 'https://i.pravatar.cc/300?img=5',
    category: 'Архитектура',
    rules: 'Проекты должны включать как минимум 3 ракурса здания и краткое описание концепции.',
    organizer: 'Институт современной архитектуры',
    submissionDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString() // 35 дней вперед
  }
];

/**
 * Тестовые данные для коллабораций
 */
export const mockCollaborations: Collaboration[] = [
  {
    id: 1,
    title: 'Создание иллюстраций для детской книги',
    description: 'Ищем художников для создания серии иллюстраций к детской книге о приключениях в космосе. Нужно 15 иллюстраций в мультяшном стиле.',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 дней назад
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 дней вперед
    status: 'open',
    category: 'Иллюстрация',
    initiator: {
      id: 101,
      name: 'Анна Писатель',
      avatar: 'https://i.pravatar.cc/150?img=10',
      role: 'Автор книги'
    },
    participants: [
      {
        id: 102,
        name: 'Михаил Художник',
        avatar: 'https://i.pravatar.cc/150?img=11',
        role: 'Иллюстратор'
      },
      {
        id: 103,
        name: 'Елена Дизайнер',
        avatar: 'https://i.pravatar.cc/150?img=12',
        role: 'Дизайнер персонажей'
      }
    ],
    maxParticipants: 5,
    skills: ['Иллюстрация', 'Детский стиль', 'Цифровое искусство']
  },
  {
    id: 2,
    title: 'Разработка концепт-артов для инди-игры',
    description: 'Наша инди-студия ищет художников для создания концепт-артов для игры в жанре фэнтези. Нужны концепты персонажей, локаций и предметов.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 дней назад
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 дней вперед
    status: 'open',
    category: 'Концепт-арт',
    initiator: {
      id: 201,
      name: 'Игорь Разработчик',
      avatar: 'https://i.pravatar.cc/150?img=20',
      role: 'Геймдизайнер'
    },
    participants: [
      {
        id: 202,
        name: 'Алексей Художник',
        avatar: 'https://i.pravatar.cc/150?img=21',
        role: 'Концепт-художник'
      }
    ],
    maxParticipants: 4,
    skills: ['Концепт-арт', 'Фэнтези', 'Дизайн персонажей', 'Дизайн окружения']
  },
  {
    id: 3,
    title: 'Создание анимированных эмодзи для мессенджера',
    description: 'Требуются аниматоры для создания набора из 20 анимированных эмодзи для нового мессенджера. Стиль - минималистичный и яркий.',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 дней назад
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 дня назад
    status: 'completed',
    category: 'Анимация',
    initiator: {
      id: 301,
      name: 'Дмитрий Продакт',
      avatar: 'https://i.pravatar.cc/150?img=30',
      role: 'Продакт-менеджер'
    },
    participants: [
      {
        id: 302,
        name: 'Ольга Аниматор',
        avatar: 'https://i.pravatar.cc/150?img=31',
        role: 'Аниматор'
      },
      {
        id: 303,
        name: 'Сергей Дизайнер',
        avatar: 'https://i.pravatar.cc/150?img=32',
        role: 'UI/UX дизайнер'
      },
      {
        id: 304,
        name: 'Мария Иллюстратор',
        avatar: 'https://i.pravatar.cc/150?img=33',
        role: 'Иллюстратор'
      }
    ],
    maxParticipants: 5,
    skills: ['Анимация', '2D графика', 'After Effects', 'Иллюстрация']
  },
  {
    id: 4,
    title: 'Коллаборация художников для NFT-коллекции',
    description: 'Собираем команду художников для создания уникальной NFT-коллекции на тему "Цифровые джунгли". Планируется создать 100 уникальных работ.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 дня назад
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 дней вперед
    status: 'in_progress',
    category: 'NFT',
    initiator: {
      id: 401,
      name: 'Артём Крипто',
      avatar: 'https://i.pravatar.cc/150?img=40',
      role: 'NFT-продюсер'
    },
    participants: [
      {
        id: 402,
        name: 'Кирилл Диджитал',
        avatar: 'https://i.pravatar.cc/150?img=41',
        role: 'Цифровой художник'
      },
      {
        id: 403,
        name: 'Наталья Арт',
        avatar: 'https://i.pravatar.cc/150?img=42',
        role: 'Художник'
      },
      {
        id: 404,
        name: 'Павел Крипто',
        avatar: 'https://i.pravatar.cc/150?img=43',
        role: 'Блокчейн-специалист'
      }
    ],
    maxParticipants: 6,
    skills: ['NFT', 'Цифровое искусство', 'Криптовалюты', 'Иллюстрация']
  },
  {
    id: 5,
    title: 'Создание визуальных эффектов для короткометражного фильма',
    description: 'Ищем специалистов по VFX для работы над короткометражным научно-фантастическим фильмом. Требуется создание космических сцен и эффектов.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 дней назад
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 дней вперед
    status: 'open',
    category: 'VFX',
    initiator: {
      id: 501,
      name: 'Андрей Режиссёр',
      avatar: 'https://i.pravatar.cc/150?img=50',
      role: 'Режиссёр'
    },
    participants: [],
    maxParticipants: 8,
    skills: ['VFX', 'After Effects', 'Blender', '3D моделирование', 'Композитинг']
  }
];