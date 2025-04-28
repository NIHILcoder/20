/**
 * API-маршрут для обновления профиля пользователя
 */

import { NextResponse } from 'next/server';
const { withAuth } = require('../../../../middleware/auth');
const userModel = require('../../../../models/user');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Настройка для загрузки файлов
const getUploadDir = () => {
  const uploadDir = path.join(process.cwd(), 'public/uploads/avatars');
  // Создаем директорию, если она не существует
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Генерация уникального имени файла
const generateUniqueFilename = (originalName) => {
  return `${uuidv4()}${path.extname(originalName)}`;
};

// Функция для обработки загрузки файла и получения данных формы
async function handleFileUpload(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('avatar');
    
    // Получаем остальные данные из формы
    const profileData = {
      displayName: formData.get('displayName'),
      bio: formData.get('bio'),
      email: formData.get('email')
    };
    
    // Если файл не был загружен, возвращаем только данные профиля
    if (!file) {
      return { avatarUrl: null, profileData };
    }
    
    // Проверка типа файла
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Недопустимый тип файла. Разрешены только изображения (JPEG, PNG, GIF, WEBP)');
    }
    
    // Генерируем уникальное имя файла
    const uniqueFilename = generateUniqueFilename(file.name);
    const uploadDir = getUploadDir();
    
    // Путь для сохранения файла
    const filePath = path.join(uploadDir, uniqueFilename);
    
    // Преобразуем файл в массив байтов и сохраняем
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);
    
    // Возвращаем URL для доступа к файлу и данные профиля
    return {
      avatarUrl: `/uploads/avatars/${uniqueFilename}`,
      profileData
    };
  } catch (error) {
    console.error('Ошибка при загрузке файла:', error);
    throw error;
  }
}

/**
 * Обработчик PUT-запроса для обновления профиля пользователя
 */
async function putHandler(request) {
  try {
    // Получаем данные из запроса
    let avatarUrl = null;
    let profileData;
    
    // Проверяем тип контента
    const contentType = request.headers.get('content-type');
    
    if (contentType && contentType.includes('multipart/form-data')) {
      // Обрабатываем загрузку файла и получаем данные формы за один раз
      const uploadResult = await handleFileUpload(request);
      avatarUrl = uploadResult.avatarUrl;
      profileData = uploadResult.profileData;
    } else {
      // Обычный JSON запрос
      profileData = await request.json();
    }
    
    // Если был загружен аватар, добавляем его URL к данным профиля
    if (avatarUrl) {
      profileData.avatarUrl = avatarUrl;
    }
    
    // Обновляем профиль пользователя
    const updatedUser = await userModel.updateUserProfile(request.user.id, profileData);
    
    // Подготовка данных пользователя для ответа
    const userData = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      displayName: updatedUser.display_name,
      bio: updatedUser.bio,
      avatarUrl: updatedUser.avatar_url,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
    };
    
    return NextResponse.json(userData, { status: 200 });
  } catch (error) {
    console.error('Ошибка при обновлении профиля пользователя:', error);
    return NextResponse.json(
      { error: error.message || 'Произошла ошибка при обновлении профиля пользователя' },
      { status: 500 }
    );
  }
}

// Оборачиваем обработчик в middleware аутентификации
export const PUT = withAuth(putHandler);