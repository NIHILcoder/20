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
      return null;
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
    return null;
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
    // В реальном приложении здесь будет запрос к API
    // Имитация задержки API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Демо-данные для имитации ответа API
    // В реальном приложении эти данные будут приходить с сервера
    if (userId === 1 && tournamentId === 1) {
      return {
        userId: 1,
        tournamentId: 1,
        registrationDate: '2023-06-16',
        status: 'registered'
      };
    }
    
    return null;
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
    // В реальном приложении здесь будет запрос к API
    // Имитация задержки API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Демо-данные для имитации ответа API
    // В реальном приложении эти данные будут приходить с сервера после успешной регистрации
    const participation: TournamentParticipation = {
      userId,
      tournamentId,
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'registered'
    };
    
    return participation;
  } catch (error) {
    console.error('Ошибка при регистрации на турнир:', error);
    throw new Error('Не удалось зарегистрироваться на турнир');
  }
}