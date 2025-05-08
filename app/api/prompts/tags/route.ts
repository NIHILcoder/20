import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Обработчик GET-запросов для получения популярных тегов промптов
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем популярные теги из всех промптов
    // Используем unnest для развертывания массива тегов
    const query = `
      SELECT 
        tag as id,
        tag as name,
        COUNT(*) as count
      FROM (
        SELECT unnest(tags) as tag
        FROM prompts
        WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
      ) as tags_unnested
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 20
    `;

    const result = await db.query(query, []);
    const tags = result.rows.map((row: any) => ({
      ...row,
      count: parseInt(row.count)
    }));

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}