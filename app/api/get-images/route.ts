// app/api/get-images/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public/generated');
    
    // Если директория не существует, создаем ее и возвращаем пустой массив
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      return NextResponse.json({ images: [] });
    }
    
    // Получаем список файлов и фильтруем только изображения
    const files = fs.readdirSync(dir)
      .filter(file => /\.(jpe?g|png|gif|webp)$/i.test(file))
      .map(file => {
        const imagePath = path.join(dir, file);
        const metadataPath = path.join(dir, `${file.split('.')[0]}.json`);
        
        // Пытаемся прочитать метаданные, если они существуют
        let metadata = {};
        if (fs.existsSync(metadataPath)) {
          try {
            metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
          } catch (e) {
            console.error('Ошибка чтения метаданных:', e);
          }
        }
        
        return {
          name: file,
          path: `/generated/${file}`,
          url: `/generated/${file}`,
          created: fs.statSync(imagePath).birthtime,
          ...metadata
        };
      })
      // Сортируем по дате создания (новые вначале)
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    
    return NextResponse.json({ images: files });
  } catch (error: any) {
    console.error('Ошибка при получении списка изображений:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении списка изображений', message: error.message },
      { status: 500 }
    );
  }
}