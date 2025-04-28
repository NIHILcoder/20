"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Save } from "lucide-react";
import { useAuth } from "./auth-context";

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Валидация пароля
  const validatePassword = () => {
    if (newPassword.length < 8) {
      setError('Новый пароль должен содержать не менее 8 символов');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    
    if (newPassword === currentPassword) {
      setError('Новый пароль должен отличаться от текущего');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Сбрасываем предыдущие сообщения
    setError(null);
    setSuccessMessage(null);
    
    // Проверяем валидность пароля
    if (!validatePassword()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Отправляем запрос на изменение пароля
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      
      // Проверяем тип контента ответа перед парсингом JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Если ответ не в формате JSON, создаем объект с текстом ошибки
        const text = await response.text();
        data = { error: `Ошибка сервера: ${text.substring(0, 100)}...` };
      }
      
      if (!response.ok) {
        throw new Error(data?.error || 'Произошла ошибка при изменении пароля');
      }
      
      // Очищаем форму
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Показываем сообщение об успехе
      setSuccessMessage('Пароль успешно изменен');
      
      // Вызываем колбэк успешного изменения, если он предоставлен
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Ошибка при изменении пароля:', err);
      setError(err.message || 'Произошла ошибка при изменении пароля');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="current-password">Текущий пароль</Label>
        <Input
          id="current-password"
          type="password"
          placeholder="••••••••"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="new-password">Новый пароль</Label>
          <Input
            id="new-password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Подтвердите новый пароль</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
      </div>
      
      {error && (
        <div className="text-sm text-destructive">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="text-sm text-green-600 dark:text-green-500">
          {successMessage}
        </div>
      )}
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
            Обновление...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Обновить пароль
          </>
        )}
      </Button>
    </form>
  );
}