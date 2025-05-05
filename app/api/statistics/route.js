/**
 * API-эндпоинт для получения статистики генераций пользователя
 */

import { NextResponse } from 'next/server';
import db from '@/db';
import { withAuth } from '../../../middleware/auth';

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get('userId'));
    const timeRange = searchParams.get('timeRange') || 'week'; // day, week, month, year
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Необходимо указать ID пользователя' },
        { status: 400 }
      );
    }
    
    // Проверка, что пользователь запрашивает свою статистику
    if (userId !== request.user.id) {
      return NextResponse.json(
        { error: 'У вас нет прав на просмотр статистики другого пользователя' },
        { status: 403 }
      );
    }
    
    // Определение временного интервала для запроса
    let timeCondition;
    switch(timeRange) {
      case 'day':
        timeCondition = `created_at >= CURRENT_DATE`;
        break;
      case 'week':
        timeCondition = `created_at >= CURRENT_DATE - INTERVAL '7 days'`;
        break;
      case 'month':
        timeCondition = `created_at >= CURRENT_DATE - INTERVAL '30 days'`;
        break;
      case 'year':
        timeCondition = `created_at >= CURRENT_DATE - INTERVAL '365 days'`;
        break;
      default:
        timeCondition = `created_at >= CURRENT_DATE - INTERVAL '7 days'`;
    }
    
    // Получение общего количества генераций
    const totalQuery = `
      SELECT COUNT(*) as total
      FROM artworks
      WHERE user_id = $1 AND ${timeCondition}
    `;
    const totalResult = await db.query(totalQuery, [userId]);
    const totalGenerations = parseInt(totalResult.rows[0].total) || 0;
    
    // Получение среднего количества генераций в день
    const avgQuery = `
      SELECT COALESCE(AVG(daily_count), 0) as average
      FROM (
        SELECT DATE(created_at) as day, COUNT(*) as daily_count
        FROM artworks
        WHERE user_id = $1 AND ${timeCondition}
        GROUP BY DATE(created_at)
      ) as daily_stats
    `;
    const avgResult = await db.query(avgQuery, [userId]);
    const averageGenerations = parseFloat(avgResult.rows[0].average) || 0;
    
    // Получение самого активного дня недели
    const activeDayQuery = `
      SELECT 
        CASE 
          WHEN EXTRACT(DOW FROM created_at) = 0 THEN 'Sunday'
          WHEN EXTRACT(DOW FROM created_at) = 1 THEN 'Monday'
          WHEN EXTRACT(DOW FROM created_at) = 2 THEN 'Tuesday'
          WHEN EXTRACT(DOW FROM created_at) = 3 THEN 'Wednesday'
          WHEN EXTRACT(DOW FROM created_at) = 4 THEN 'Thursday'
          WHEN EXTRACT(DOW FROM created_at) = 5 THEN 'Friday'
          WHEN EXTRACT(DOW FROM created_at) = 6 THEN 'Saturday'
        END as day_of_week,
        COUNT(*) as count
      FROM artworks
      WHERE user_id = $1 AND ${timeCondition}
      GROUP BY day_of_week
      ORDER BY count DESC
      LIMIT 1
    `;
    const activeDayResult = await db.query(activeDayQuery, [userId]);
    const mostActiveDay = activeDayResult.rows.length > 0 ? activeDayResult.rows[0].day_of_week : null;
    
    // Получение количества генераций по дням недели
    const byDayQuery = `
      SELECT 
        EXTRACT(DOW FROM created_at) as day_num,
        COUNT(*) as count
      FROM artworks
      WHERE user_id = $1 AND ${timeCondition}
      GROUP BY day_num
      ORDER BY day_num
    `;
    const byDayResult = await db.query(byDayQuery, [userId]);
    
    // Преобразование результатов в массив по дням недели (0-6, где 0 - воскресенье)
    const generationsByDay = Array(7).fill(0);
    byDayResult.rows.forEach(row => {
      const dayIndex = parseInt(row.day_num);
      generationsByDay[dayIndex] = parseInt(row.count);
    });
    
    // Получение использования моделей
    const modelsQuery = `
      SELECT 
        CASE 
          WHEN model = 'flux_realistic' THEN 0
          WHEN model = 'anime_diffusion' THEN 1
          WHEN model = 'dreamshaper' THEN 2
          WHEN model = 'realistic_vision' THEN 3
          ELSE 4
        END as model_index,
        COUNT(*) as count
      FROM artworks
      WHERE user_id = $1 AND ${timeCondition}
      GROUP BY model_index
      ORDER BY model_index
    `;
    const modelsResult = await db.query(modelsQuery, [userId]);
    
    // Преобразование результатов в массив по моделям
    const modelUsage = Array(5).fill(0);
    modelsResult.rows.forEach(row => {
      const modelIndex = parseInt(row.model_index);
      modelUsage[modelIndex] = parseInt(row.count);
    });
    
    // Получение данных о затраченном времени (на основе параметров генерации)
    // Предполагаем, что у нас есть информация о времени генерации в параметрах
    const timeQuery = `
      SELECT 
        SUM(COALESCE((parameters->>'generation_time')::float, 5)) as total_time,
        AVG(COALESCE((parameters->>'generation_time')::float, 5)) as avg_time,
        MAX(COALESCE((parameters->>'generation_time')::float, 5)) as max_time
      FROM artworks
      WHERE user_id = $1 AND ${timeCondition}
    `;
    const timeResult = await db.query(timeQuery, [userId]);
    
    const totalTime = Math.round(parseFloat(timeResult.rows[0].total_time) || 0);
    const avgTime = parseFloat(timeResult.rows[0].avg_time) || 0;
    const longestTime = Math.round(parseFloat(timeResult.rows[0].max_time) || 0);
    
    // Получение затраченного времени по дням недели
    const timeByDayQuery = `
      SELECT 
        EXTRACT(DOW FROM created_at) as day_num,
        SUM(COALESCE((parameters->>'generation_time')::float, 5)) as total_time
      FROM artworks
      WHERE user_id = $1 AND ${timeCondition}
      GROUP BY day_num
      ORDER BY day_num
    `;
    const timeByDayResult = await db.query(timeByDayQuery, [userId]);
    
    // Преобразование результатов в массив по дням недели
    const timeByDay = Array(7).fill(0);
    timeByDayResult.rows.forEach(row => {
      const dayIndex = parseInt(row.day_num);
      timeByDay[dayIndex] = Math.round(parseFloat(row.total_time));
    });
    
    // Формирование итогового объекта с данными статистики
    const statisticsData = {
      generations: {
        total: totalGenerations,
        average: averageGenerations,
        mostActiveDay: mostActiveDay,
        byDay: generationsByDay
      },
      models: {
        usage: modelUsage
      },
      time: {
        total: totalTime,
        average: avgTime,
        longest: longestTime,
        byDay: timeByDay
      }
    };
    
    return NextResponse.json(statisticsData);
    
  } catch (error) {
    console.error('Ошибка при получении статистики генераций:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при получении статистики генераций' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);