import { NextResponse } from 'next/server';
const { withAuth } = require('../../../../middleware/auth');
import db from '../../../../db';

/**
 * Обработчик POST-запроса для обновления кредитов пользователя
 */
async function postHandler(request) {
  try {
    // Получаем данные из запроса
    const data = await request.json();
    const { amount = 0 } = data;
    
    if (!amount) {
      return NextResponse.json(
        { error: 'Необходимо указать количество кредитов' },
        { status: 400 }
      );
    }
    
    // Информация о пользователе добавляется в запрос middleware аутентификации
    const user = request.user;
    
    // Получаем текущее количество кредитов из базы данных
    const userResult = await db.query('SELECT credits FROM users WHERE id = $1', [user.id]);
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }
    
    // Получаем текущее количество кредитов
    let currentCredits = userResult.rows[0].credits || 1000;
    
    // Обновляем количество кредитов
    currentCredits += amount;
    
    // Проверяем, что количество кредитов не стало отрицательным
    if (currentCredits < 0) {
      return NextResponse.json(
        { error: 'Недостаточно кредитов' },
        { status: 400 }
      );
    }
    
    // Обновляем количество кредитов в базе данных
    await db.query('UPDATE users SET credits = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', 
      [currentCredits, user.id]);
    
    return NextResponse.json({
      success: true,
      credits: {
        added: amount,
        total: currentCredits
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Ошибка при обновлении кредитов пользователя:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при обновлении кредитов пользователя' },
      { status: 500 }
    );
  }
}

// Оборачиваем обработчик в middleware аутентификации
export const POST = withAuth(postHandler);