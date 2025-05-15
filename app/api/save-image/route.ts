// app/api/save-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { imageData, filename, prompt } = await request.json();
    
    // Удаляем заголовок data:image/png;base64, если он есть
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Создаем папку, если ее нет
    const dir = path.join(process.cwd(), 'public/generated');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Создаем метаданные изображения
    const metadata = {
      prompt,
      created: new Date().toISOString(),
      filename
    };
    
    // Сохраняем метаданные в отдельный JSON файл
    const metadataPath = path.join(dir, `${filename.split('.')[0]}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    
    // Сохраняем файл изображения
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, buffer);
    
    return NextResponse.json({ 
      success: true, 
      path: `/generated/${filename}` 
    });
  } catch (error: any) {
    console.error('Ошибка при сохранении изображения:', error);
    return NextResponse.json(
      { error: 'Ошибка при сохранении изображения', message: error.message },
      { status: 500 }
    );
  }
}