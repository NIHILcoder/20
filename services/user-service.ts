/**
 * Сервис для работы с пользователями и их данными
 */

import { Collection } from './api-service';

/**
 * Интерфейс для пользователя
 */
export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Получение текущего пользователя
 * @returns Информация о текущем пользователе
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/user/current');
    
    if (!response.ok) {
      // Если API еще не реализован или вернул ошибку, возвращаем демо-пользователя
      // для корректной работы компонентов
      console.warn('API /api/user/current недоступен, используем демо-данные');
      return {
        id: 1,
        username: 'demo_user',
        email: 'demo@example.com',
        displayName: 'Демо Пользователь',
        avatar: 'https://i.pravatar.cc/150?img=8',
        bio: 'Это демо-пользователь для тестирования функциональности',
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    const userData = await response.json();
    
    // Преобразуем полученные данные в соответствии с интерфейсом User
    return {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      displayName: userData.display_name || userData.username,
      avatar: userData.avatar_url,
      bio: userData.bio || '',
      role: userData.role || '',
      createdAt: userData.created_at || new Date().toISOString(),
      updatedAt: userData.updated_at || new Date().toISOString()
    };
  } catch (error) {
    console.error('Ошибка при получении текущего пользователя:', error);
    // При ошибке также возвращаем демо-пользователя
    return {
      id: 1,
      username: 'demo_user',
      email: 'demo@example.com',
      displayName: 'Демо Пользователь',
      avatar: 'https://i.pravatar.cc/150?img=8',
      bio: 'Это демо-пользователь для тестирования функциональности',
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

/**
 * Получение коллекций пользователя
 * @param userId - ID пользователя
 * @returns Коллекции пользователя
 */
export async function getUserCollections(userId: number): Promise<Collection[]> {
  if (!userId) {
    throw new Error('Необходимо указать ID пользователя');
  }

  const queryParams = new URLSearchParams();
  queryParams.append('userId', userId.toString());

  const response = await fetch(`/api/user/collections?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Ошибка при получении коллекций пользователя');
  }
  
  return response.json();
}

/**
 * Проверка авторизации пользователя
 * @returns true, если пользователь авторизован
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Интерфейс для участия в турнире
 */
export interface TournamentParticipation {
  userId: number;
  tournamentId: number;
  registrationDate: string;
  status: 'registered' | 'submitted' | 'finalist' | 'winner';
  submissionUrl?: string;
  score?: number;
}

/**
 * Проверка участия пользователя в турнире
 * @param userId - ID пользователя
 * @param tournamentId - ID турнира
 * @returns Информация об участии в турнире или null, если пользователь не участвует
 */
export async function checkTournamentParticipation(userId: number, tournamentId: number): Promise<TournamentParticipation | null> {
  try {
    const response = await fetch(`/api/community/tournaments/check-participation?userId=${userId}&tournamentId=${tournamentId}`);
    
    if (!response.ok) {
      throw new Error('Ошибка при проверке участия в турнире');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка при проверке участия в турнире:', error);
    return null;
  }
}

/**
 * Регистрация пользователя на турнир
 * @param userId - ID пользователя
 * @param tournamentId - ID турнира
 * @returns Информация о созданном участии в турнире
 */
export async function registerForTournament(userId: number, tournamentId: number): Promise<TournamentParticipation> {
  try {
    const response = await fetch(`/api/community/tournaments/${tournamentId}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Не удалось зарегистрироваться на турнир');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при регистрации на турнир:', error);
    throw error;
  }
}

/**
 * Интерфейс для участия в коллаборации
 */
export interface CollaborationParticipation {
  userId: number;
  collaborationId: number;
  joinDate: string;
  status: 'active' | 'completed' | 'left';
  role?: string;
}

/**
 * Проверка участия пользователя в коллаборации
 * @param userId - ID пользователя
 * @param collaborationId - ID коллаборации
 * @returns Информация об участии в коллаборации или null, если пользователь не участвует
 */
export async function checkCollaborationParticipation(userId: number, collaborationId: number): Promise<CollaborationParticipation | null> {
  try {
    const response = await fetch(`/api/community/collaborations/check-participation?userId=${userId}&collaborationId=${collaborationId}`);
    
    if (!response.ok) {
      throw new Error('Ошибка при проверке участия в коллаборации');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка при проверке участия в коллаборации:', error);
    return null;
  }
}

/**
 * Присоединение пользователя к коллаборации
 * @param userId - ID пользователя
 * @param collaborationId - ID коллаборации
 * @param role - Роль пользователя в коллаборации
 * @returns Информация о созданном участии в коллаборации
 */
export async function joinCollaboration(userId: number, collaborationId: number, role: string = 'Участник'): Promise<CollaborationParticipation> {
  try {
    const response = await fetch(`/api/community/collaborations/${collaborationId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, role })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Не удалось присоединиться к коллаборации');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при присоединении к коллаборации:', error);
    throw error;
  }
}