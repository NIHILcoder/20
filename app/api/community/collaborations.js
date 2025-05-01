/**
 * API-маршруты для работы с коллаборациями
 */

import { NextResponse } from 'next/server';
import {
  getAllCollaborations,
  getCollaborationById,
  createCollaboration,
  updateCollaboration,
  deleteCollaboration,
  joinCollaboration,
  checkCollaborationParticipation,
  getCollaborationParticipants
} from '@/models/collaboration';

/**
 * GET /api/community/collaborations
 * Получение списка всех коллабораций
 */
export async function GET(request) {
  try {
    const collaborations = await getAllCollaborations();
    return NextResponse.json(collaborations);
  } catch (error) {
    console.error('Ошибка при получении коллабораций:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении коллабораций' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/community/collaborations
 * Создание новой коллаборации
 */
export async function POST(request) {
  try {
    const collaborationData = await request.json();
    
    // Проверка обязательных полей
    if (!collaborationData.title || !collaborationData.initiatorId || !collaborationData.maxParticipants) {
      return NextResponse.json(
        { error: 'Отсутствуют обязательные поля' },
        { status: 400 }
      );
    }
    
    // Устанавливаем статус 'open' по умолчанию, если не указан
    if (!collaborationData.status) {
      collaborationData.status = 'open';
    }
    
    const newCollaboration = await createCollaboration(collaborationData);
    
    // Получаем полные данные о созданной коллаборации
    const collaboration = await getCollaborationById(newCollaboration.id);
    
    return NextResponse.json(collaboration, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании коллаборации:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании коллаборации' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/community/collaborations/:id
 * Получение коллаборации по ID
 */
export async function GET_BY_ID(request, { params }) {
  try {
    const { id } = params;
    const collaboration = await getCollaborationById(id);
    
    if (!collaboration) {
      return NextResponse.json(
        { error: 'Коллаборация не найдена' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(collaboration);
  } catch (error) {
    console.error(`Ошибка при получении коллаборации:`, error);
    return NextResponse.json(
      { error: 'Ошибка при получении коллаборации' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/community/collaborations/:id
 * Обновление коллаборации
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const collaborationData = await request.json();
    
    const updatedCollaboration = await updateCollaboration(id, collaborationData);
    
    if (!updatedCollaboration) {
      return NextResponse.json(
        { error: 'Коллаборация не найдена' },
        { status: 404 }
      );
    }
    
    // Получаем полные данные об обновленной коллаборации
    const collaboration = await getCollaborationById(id);
    
    return NextResponse.json(collaboration);
  } catch (error) {
    console.error(`Ошибка при обновлении коллаборации:`, error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении коллаборации' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/community/collaborations/:id
 * Удаление коллаборации
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const success = await deleteCollaboration(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Коллаборация не найдена' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Ошибка при удалении коллаборации:`, error);
    return NextResponse.json(
      { error: 'Ошибка при удалении коллаборации' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/community/collaborations/:id/join
 * Присоединение пользователя к коллаборации
 */
export async function JOIN(request, { params }) {
  try {
    const { id } = params;
    const { userId, role } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Отсутствует ID пользователя' },
        { status: 400 }
      );
    }
    
    const participation = await joinCollaboration(userId, id, role);
    
    return NextResponse.json({
      userId: participation.user_id,
      collaborationId: participation.collaboration_id,
      joinDate: participation.join_date,
      status: participation.status,
      role: participation.role
    });
  } catch (error) {
    console.error(`Ошибка при присоединении к коллаборации:`, error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при присоединении к коллаборации' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/community/collaborations/:id/participants
 * Получение списка участников коллаборации
 */
export async function GET_PARTICIPANTS(request, { params }) {
  try {
    const { id } = params;
    const participants = await getCollaborationParticipants(id);
    
    // Преобразуем данные в формат, ожидаемый фронтендом
    const formattedParticipants = participants.map(participant => ({
      id: participant.user_id,
      name: participant.display_name || participant.username,
      avatar: participant.avatar_url,
      role: participant.role,
      joinDate: participant.join_date,
      status: participant.status
    }));
    
    return NextResponse.json(formattedParticipants);
  } catch (error) {
    console.error(`Ошибка при получении участников коллаборации:`, error);
    return NextResponse.json(
      { error: 'Ошибка при получении участников коллаборации' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/community/collaborations/check-participation
 * Проверка участия пользователя в коллаборации
 */
export async function CHECK_PARTICIPATION(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const collaborationId = searchParams.get('collaborationId');
    
    if (!userId || !collaborationId) {
      return NextResponse.json(
        { error: 'Отсутствуют обязательные параметры' },
        { status: 400 }
      );
    }
    
    const participation = await checkCollaborationParticipation(userId, collaborationId);
    
    if (!participation) {
      return NextResponse.json(null);
    }
    
    return NextResponse.json({
      userId: participation.user_id,
      collaborationId: participation.collaboration_id,
      joinDate: participation.join_date,
      status: participation.status,
      role: participation.role
    });
  } catch (error) {
    console.error(`Ошибка при проверке участия в коллаборации:`, error);
    return NextResponse.json(
      { error: 'Ошибка при проверке участия в коллаборации' },
      { status: 500 }
    );
  }
}