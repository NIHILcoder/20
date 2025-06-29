// app/api/save-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { imageData, filename, prompt, userId } = await request.json();
    
    // Удаляем заголовок data:image/png;base64, если он есть
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    
    // Проверяем, является ли imageData URL-адресом
    if (imageData.startsWith('http')) {
      try {
        // Если это URL, загружаем изображение
        const imageResponse = await fetch(imageData);
        if (!imageResponse.ok) {
          throw new Error(`Не удалось загрузить изображение: ${imageResponse.status}`);
        }
        
        // Получаем данные изображения
        const buffer = await imageResponse.arrayBuffer();
        
        // Создаем папку, если её нет
        const dir = path.join(process.cwd(), 'public/generated');
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Создаем метаданные изображения
        const metadata = {
          prompt,
          created: new Date().toISOString(),
          filename,
          sourceUrl: imageData,
          userId: userId // Сохраняем ID пользователя
        };
        
        // Сохраняем метаданные в отдельный JSON файл
        const metadataPath = path.join(dir, `${filename.split('.')[0]}.json`);
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
        
        // Сохраняем файл изображения
        const filepath = path.join(dir, filename);
        fs.writeFileSync(filepath, Buffer.from(buffer));

        // Если предоставлен userId, добавляем запись в базу данных
        if (userId) {
          try {
            const db = await import('@/db').then(module => module.default);
            // Добавляем запись в базу данных
            const result = await db.query(
              'INSERT INTO artworks (user_id, title, description, image_url, prompt, model, is_public) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
              [userId, prompt.substring(0, 100), prompt, `/generated/${filename}`, prompt, 'flux_realistic', false]
            );
            
            return NextResponse.json({ 
              success: true, 
              path: `/generated/${filename}`,
              artworkId: result.rows[0].id
            });
          } catch (dbError) {
            console.error('Ошибка при сохранении в БД:', dbError);
            // Если произошла ошибка при сохранении в БД, все равно возвращаем успех
            // для сохранения изображения
            return NextResponse.json({ 
              success: true, 
              path: `/generated/${filename}` 
            });
          }
        }
        
        return NextResponse.json({ 
          success: true, 
          path: `/generated/${filename}` 
        });
      } catch (error: any) {
        console.error('Ошибка при сохранении изображения с URL:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка при сохранении изображения с URL' },
          { status: 500 }
        );
      }
    } else {
      // Если это base64, конвертируем и сохраняем
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Создаем папку, если её нет
      const dir = path.join(process.cwd(), 'public/generated');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Создаем метаданные изображения
      const metadata = {
        prompt,
        created: new Date().toISOString(),
        filename,
        userId: userId // Сохраняем ID пользователя
      };
      
      // Сохраняем метаданные в отдельный JSON файл
      const metadataPath = path.join(dir, `${filename.split('.')[0]}.json`);
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      
      // Сохраняем файл изображения
      const filepath = path.join(dir, filename);
      fs.writeFileSync(filepath, buffer);

      // Если предоставлен userId, добавляем запись в базу данных
      if (userId) {
        try {
          const db = await import('@/db').then(module => module.default);
          // Добавляем запись в базу данных
          const result = await db.query(
            'INSERT INTO artworks (user_id, title, description, image_url, prompt, model, is_public) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [userId, prompt.substring(0, 100), prompt, `/generated/${filename}`, prompt, 'flux_realistic', false]
          );
          
          return NextResponse.json({ 
            success: true, 
            path: `/generated/${filename}`,
            artworkId: result.rows[0].id 
          });
        } catch (dbError) {
          console.error('Ошибка при сохранении в БД:', dbError);
          // Если произошла ошибка при сохранении в БД, все равно возвращаем успех
          // для сохранения изображения
          return NextResponse.json({ 
            success: true, 
            path: `/generated/${filename}` 
          });
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        path: `/generated/${filename}` 
      });
    }
  } catch (error: any) {
    console.error('Ошибка при сохранении изображения:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при сохранении изображения', message: error.message },
      { status: 500 }
    );
  }
}