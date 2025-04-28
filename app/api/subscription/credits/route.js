import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import db from '../../../../db';
const { withAuth } = require('../../../../middleware/auth');

async function postHandler(request) {
  try {
    // Получаем данные из запроса
    const data = await request.json();
    const { amount = 100 } = data;
    
    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ success: false, error: 'Некорректное количество кредитов' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // Информация о пользователе добавляется в запрос middleware аутентификации
    const user = request.user;
    
    // Получаем ID пользователя
    const userId = user.id;
    
    // Получаем текущее количество кредитов из базы данных
    const userResult = await db.query('SELECT credits FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Пользователь не найден' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // Получаем текущее количество кредитов
    let currentCredits = userResult.rows[0].credits || 1000;
    
    // Увеличиваем количество кредитов
    currentCredits += amount;
    
    // Обновляем количество кредитов в базе данных
    await db.query('UPDATE users SET credits = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', 
      [currentCredits, userId]);
    
    // Создаем объект ответа
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Вы успешно приобрели ${amount} дополнительных кредитов`,
      credits: {
        added: amount,
        total: currentCredits,
        used: 248 // В реальном приложении это значение должно приходить из базы данных
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Ошибка при покупке дополнительных кредитов:', error);
    
    return new Response(JSON.stringify({ success: false, error: error.message || 'Произошла ошибка при покупке дополнительных кредитов' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Оборачиваем обработчик в middleware аутентификации
export const POST = withAuth(postHandler);