/**
 * Пример использования тестовых данных для проверки возможности присоединения к турнирам и коллаборациям
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockTournaments, mockCollaborations } from '@/data/mock-community-data';
import { getCurrentUser, checkTournamentParticipation, registerForTournament, 
         checkCollaborationParticipation, joinCollaboration } from '@/services/user-service';
import { User } from '@/types/user';

export default function CommunityParticipationExample() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Ошибка при загрузке пользователя:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUser();
  }, []);
  
  // Функция для проверки и присоединения к турниру
  async function handleJoinTournament(tournamentId: number) {
    if (!currentUser) {
      setMessage('Необходимо авторизоваться для участия в турнире');
      return;
    }
    
    try {
      setLoading(true);
      
      // Проверяем, участвует ли пользователь уже в турнире
      const participation = await checkTournamentParticipation(currentUser.id, tournamentId);
      
      if (participation) {
        setMessage(`Вы уже зарегистрированы на этот турнир. Статус: ${participation.status}`);
      } else {
        // Находим турнир в моковых данных
        const tournament = mockTournaments.find(t => t.id === tournamentId);
        
        if (!tournament) {
          setMessage('Турнир не найден');
          return;
        }
        
        // Проверяем, можно ли присоединиться к турниру
        if (tournament.status !== 'active') {
          setMessage(`Нельзя присоединиться к турниру со статусом ${tournament.status}`);
          return;
        }
        
        if (tournament.participants >= tournament.maxParticipants) {
          setMessage('Турнир уже заполнен');
          return;
        }
        
        // Регистрируемся на турнир
        await registerForTournament(currentUser.id, tournamentId);
        setMessage('Вы успешно зарегистрировались на турнир!');
      }
    } catch (error) {
      console.error('Ошибка при присоединении к турниру:', error);
      setMessage('Произошла ошибка при присоединении к турниру');
    } finally {
      setLoading(false);
    }
  }
  
  // Функция для проверки и присоединения к коллаборации
  async function handleJoinCollaboration(collaborationId: number) {
    if (!currentUser) {
      setMessage('Необходимо авторизоваться для участия в коллаборации');
      return;
    }
    
    try {
      setLoading(true);
      
      // Проверяем, участвует ли пользователь уже в коллаборации
      const participation = await checkCollaborationParticipation(currentUser.id, collaborationId);
      
      if (participation) {
        setMessage(`Вы уже участвуете в этой коллаборации. Статус: ${participation.status}`);
      } else {
        // Находим коллаборацию в моковых данных
        const collaboration = mockCollaborations.find(c => c.id === collaborationId);
        
        if (!collaboration) {
          setMessage('Коллаборация не найдена');
          return;
        }
        
        // Проверяем, можно ли присоединиться к коллаборации
        if (collaboration.status !== 'open' && collaboration.status !== 'in_progress') {
          setMessage(`Нельзя присоединиться к коллаборации со статусом ${collaboration.status}`);
          return;
        }
        
        if (collaboration.participants.length >= collaboration.maxParticipants) {
          setMessage('Коллаборация уже заполнена');
          return;
        }
        
        if (new Date(collaboration.deadline) < new Date()) {
          setMessage('Дедлайн коллаборации уже истек');
          return;
        }
        
        // Присоединяемся к коллаборации
        await joinCollaboration(currentUser.id, collaborationId);
        setMessage('Вы успешно присоединились к коллаборации!');
      }
    } catch (error) {
      console.error('Ошибка при присоединении к коллаборации:', error);
      setMessage('Произошла ошибка при присоединении к коллаборации');
    } finally {
      setLoading(false);
    }
  }
  
  if (loading) {
    return <div>Загрузка...</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Проверка присоединения к турнирам и коллаборациям</h1>
      
      {message && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
          {message}
          <button 
            className="ml-4 text-sm underline" 
            onClick={() => setMessage(null)}
          >
            Закрыть
          </button>
        </div>
      )}
      
      <div className="text-center py-8">
        <p className="text-lg">Для просмотра турниров и коллабораций перейдите в соответствующие разделы:</p>
        <div className="flex justify-center gap-4 mt-4">
          <Button className="px-6" onClick={() => window.location.href = '/community/tournaments'}>Турниры</Button>
          <Button className="px-6" onClick={() => window.location.href = '/community/collaborations'}>Коллаборации</Button>
        </div>
      </div>
    </div>
  );
}