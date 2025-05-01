/**
 * API-маршруты для работы с турнирами
 */

import { NextResponse } from 'next/server';
import {
  getAllTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  registerUserForTournament,
  checkTournamentParticipation,
  getTournamentParticipants
} from '@/models/tournament';

/**
 * GET /api/community/tournaments
 * Получение списка всех турниров
 */
export async function GET(request) {
  try {
    const tournaments = await getAllTournaments();
    
    // Преобразуем данные в формат, ожидаемый фронтендом
    const formattedTournaments = tournaments.map(tournament => ({
      id: tournament.id,
      title: tournament.title,
      description: tournament.description,
      startDate: tournament.start_date,
      endDate: tournament.end_date,
      participants: parseInt(tournament.participants),
      maxParticipants: tournament.max_participants,
      prize: tournament.prize,
      status: tournament.status,
      image: tournament.image,
      category: tournament.category,
      rules: tournament.rules,
      organizer: tournament.organizer,
      submissionDeadline: tournament.submission_deadline
    }));
    
    return NextResponse.json(formattedTournaments);
  } catch (error) {
    console.error('Ошибка при получении турниров:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении турниров' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/community/tournaments
 * Создание нового турнира
 */
export async function POST(request) {
  try {
    const tournamentData = await request.json();
    
    // Проверка обязательных полей
    if (!tournamentData.title || !tournamentData.startDate || !tournamentData.endDate || !tournamentData.maxParticipants) {
      return NextResponse.json(
        { error: 'Отсутствуют обязательные поля' },
        { status: 400 }
      );
    }
    
    const newTournament = await createTournament(tournamentData);
    
    // Преобразуем данные в формат, ожидаемый фронтендом
    const formattedTournament = {
      id: newTournament.id,
      title: newTournament.title,
      description: newTournament.description,
      startDate: newTournament.start_date,
      endDate: newTournament.end_date,
      participants: 0,
      maxParticipants: newTournament.max_participants,
      prize: newTournament.prize,
      status: newTournament.status,
      image: newTournament.image,
      category: newTournament.category,
      rules: newTournament.rules,
      organizer: newTournament.organizer,
      submissionDeadline: newTournament.submission_deadline
    };
    
    return NextResponse.json(formattedTournament, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании турнира:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании турнира' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/community/tournaments/:id
 * Получение турнира по ID
 */
export async function GET_BY_ID(request, { params }) {
  try {
    const { id } = params;
    const tournament = await getTournamentById(id);
    
    if (!tournament) {
      return NextResponse.json(
        { error: 'Турнир не найден' },
        { status: 404 }
      );
    }
    
    // Преобразуем данные в формат, ожидаемый фронтендом
    const formattedTournament = {
      id: tournament.id,
      title: tournament.title,
      description: tournament.description,
      startDate: tournament.start_date,
      endDate: tournament.end_date,
      participants: parseInt(tournament.participants),
      maxParticipants: tournament.max_participants,
      prize: tournament.prize,
      status: tournament.status,
      image: tournament.image,
      category: tournament.category,
      rules: tournament.rules,
      organizer: tournament.organizer,
      submissionDeadline: tournament.submission_deadline
    };
    
    return NextResponse.json(formattedTournament);
  } catch (error) {
    console.error(`Ошибка при получении турнира:`, error);
    return NextResponse.json(
      { error: 'Ошибка при получении турнира' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/community/tournaments/:id
 * Обновление турнира
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const tournamentData = await request.json();
    
    const updatedTournament = await updateTournament(id, tournamentData);
    
    if (!updatedTournament) {
      return NextResponse.json(
        { error: 'Турнир не найден' },
        { status: 404 }
      );
    }
    
    // Преобразуем данные в формат, ожидаемый фронтендом
    const formattedTournament = {
      id: updatedTournament.id,
      title: updatedTournament.title,
      description: updatedTournament.description,
      startDate: updatedTournament.start_date,
      endDate: updatedTournament.end_date,
      participants: parseInt(updatedTournament.participants || 0),
      maxParticipants: updatedTournament.max_participants,
      prize: updatedTournament.prize,
      status: updatedTournament.status,
      image: updatedTournament.image,
      category: updatedTournament.category,
      rules: updatedTournament.rules,
      organizer: updatedTournament.organizer,
      submissionDeadline: updatedTournament.submission_deadline
    };
    
    return NextResponse.json(formattedTournament);
  } catch (error) {
    console.error(`Ошибка при обновлении турнира:`, error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении турнира' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/community/tournaments/:id
 * Удаление турнира
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const success = await deleteTournament(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Турнир не найден' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Ошибка при удалении турнира:`, error);
    return NextResponse.json(
      { error: 'Ошибка при удалении турнира' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/community/tournaments/:id/register
 * Регистрация пользователя на турнир
 */
export async function REGISTER(request, { params }) {
  try {
    const { id } = params;
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Отсутствует ID пользователя' },
        { status: 400 }
      );
    }
    
    const participation = await registerUserForTournament(userId, id);
    
    return NextResponse.json({
      userId: participation.user_id,
      tournamentId: participation.tournament_id,
      registrationDate: participation.registration_date,
      status: participation.status
    });
  } catch (error) {
    console.error(`Ошибка при регистрации на турнир:`, error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при регистрации на турнир' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/community/tournaments/:id/participants
 * Получение списка участников турнира
 */
export async function GET_PARTICIPANTS(request, { params }) {
  try {
    const { id } = params;
    const participants = await getTournamentParticipants(id);
    
    // Преобразуем данные в формат, ожидаемый фронтендом
    const formattedParticipants = participants.map(participant => ({
      userId: participant.user_id,
      tournamentId: participant.tournament_id,
      registrationDate: participant.registration_date,
      status: participant.status,
      submissionUrl: participant.submission_url,
      score: participant.score,
      username: participant.username,
      displayName: participant.display_name,
      avatar: participant.avatar_url
    }));
    
    return NextResponse.json(formattedParticipants);
  } catch (error) {
    console.error(`Ошибка при получении участников турнира:`, error);
    return NextResponse.json(
      { error: 'Ошибка при получении участников турнира' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/community/tournaments/check-participation
 * Проверка участия пользователя в турнире
 */
export async function CHECK_PARTICIPATION(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const tournamentId = searchParams.get('tournamentId');
    
    if (!userId || !tournamentId) {
      return NextResponse.json(
        { error: 'Отсутствуют обязательные параметры' },
        { status: 400 }
      );
    }
    
    const participation = await checkTournamentParticipation(userId, tournamentId);
    
    if (!participation) {
      return NextResponse.json(null);
    }
    
    return NextResponse.json({
      userId: participation.user_id,
      tournamentId: participation.tournament_id,
      registrationDate: participation.registration_date,
      status: participation.status,
      submissionUrl: participation.submission_url,
      score: participation.score
    });
  } catch (error) {
    console.error(`Ошибка при проверке участия в турнире:`, error);
    return NextResponse.json(
      { error: 'Ошибка при проверке участия в турнире' },
      { status: 500 }
    );
  }
}