import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Обработчик GET-запросов для получения категорий промптов
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем категории и количество промптов в каждой категории
    const query = `
      SELECT 
        category as id, 
        category as name, 
        COUNT(*) as count
      FROM prompts
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
    `;

    const result = await db.query(query, []);

    // Добавляем цвета для категорий
    const categoryColors: Record<string, string> = {
      'portraits': '#f97316',
      'landscapes': '#84cc16',
      'fantasy': '#8b5cf6',
      'scifi': '#06b6d4',
      'abstract': '#ec4899',
      'animals': '#f59e0b',
      'architecture': '#64748b',
      'anime': '#0ea5e9',
      'digital': '#10b981',
      'photography': '#6366f1',
      'concept': '#f43f5e',
      'character': '#d946ef'
    };

    const categories = result.rows.map((row: any) => ({
      ...row,
      count: parseInt(row.count),
      color: categoryColors[row.id] || '#64748b' // Серый цвет по умолчанию
    }));

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching prompt categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}