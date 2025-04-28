"use client";

import React, { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";
import { useAuth } from "./auth-context";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  onAvatarChange?: (url: string) => void;
  size?: "sm" | "md" | "lg" | "xl";
}

export function AvatarUpload({ 
  currentAvatarUrl, 
  onAvatarChange,
  size = "lg" 
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateProfile, user } = useAuth(); // Moved to the top level
  
  // Определение размеров аватара
  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
    xl: "h-40 w-40"
  };
  
  // Получение инициалов из имени пользователя для фолбэка
  const getInitials = () => {
    if (!user) return "U";
    
    const name = user.displayName || user.username;
    return name.charAt(0).toUpperCase();
  };
  
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Проверка типа файла
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Недопустимый тип файла. Разрешены только изображения (JPEG, PNG, GIF, WEBP)');
      return;
    }
    
    // Проверка размера файла (макс. 5 МБ)
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5 МБ');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Создаем объект FormData для отправки файла
      const formData = new FormData();
      formData.append('avatar', file);
      
      // Если есть другие поля профиля, добавляем их
      if (user) {
        formData.append('displayName', user.displayName || user.username);
        formData.append('bio', user.bio || '');
        formData.append('email', user.email || '');
      }
      
      // Отправляем запрос на сервер
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        body: formData,
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при загрузке аватара');
      }
      
      const data = await response.json();
      
      // Обновляем контекст аутентификации
      await updateProfile({ avatarUrl: data.avatarUrl });
      
      // Вызываем колбэк, если он предоставлен
      if (onAvatarChange && data.avatarUrl) {
        onAvatarChange(data.avatarUrl);
      }
    } catch (err: any) {
      console.error('Ошибка при загрузке аватара:', err);
      setError(err.message || 'Произошла ошибка при загрузке аватара');
    } finally {
      setIsUploading(false);
      // Сбрасываем значение input, чтобы можно было загрузить тот же файл повторно
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  return (
    <div className="relative">
      <Avatar className={`${sizeClasses[size]} group relative cursor-pointer`} onClick={handleFileSelect}>
        <AvatarImage src={currentAvatarUrl || undefined} alt="Аватар пользователя" />
        <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
          {getInitials()}
        </AvatarFallback>
        
        {/* Оверлей при наведении */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
          <Camera className="h-6 w-6 text-white" />
        </div>
      </Avatar>
      
      {/* Индикатор загрузки */}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      )}
      
      {/* Скрытый input для выбора файла */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
      />
      
      {/* Сообщение об ошибке */}
      {error && (
        <div className="mt-2 text-sm text-red-500">{error}</div>
      )}
    </div>
  );
}