"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from 'next/navigation';
import { useAuth } from "./auth-context";
import { AlertTriangle } from "lucide-react";

interface DeleteAccountDialogProps {
  onClose?: () => void;
}

export function DeleteAccountDialog({ onClose }: DeleteAccountDialogProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isAgreementChecked, setIsAgreementChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { logout } = useAuth();
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && onClose) {
      onClose();
    }
    // Сбрасываем состояние при закрытии диалога
    if (!open) {
      setConfirmText('');
      setIsAgreementChecked(false);
      setError(null);
    }
  };
  
  const handleDeleteAccount = async () => {
    // Проверяем, что пользователь ввел правильный текст подтверждения
    if (confirmText !== 'Я подтверждаю') {
      setError('Пожалуйста, введите текст подтверждения точно как указано');
      return;
    }
    
    // Проверяем, что пользователь согласился с условиями
    if (!isAgreementChecked) {
      setError('Пожалуйста, подтвердите, что вы понимаете последствия удаления аккаунта');
      return;
    }
    
    setIsDeleting(true);
    setError(null);
    
    try {
      // Отправляем запрос на удаление аккаунта
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Проверяем тип контента ответа перед обработкой
      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.error || 'Произошла ошибка при удалении аккаунта');
        } else {
          // Если ответ не в формате JSON, создаем сообщение об ошибке из текста
          const text = await response.text();
          throw new Error(`Ошибка сервера: ${text.substring(0, 100)}...`);
        }
      }
      
      // Даже если ответ успешный, проверяем его формат
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Если сервер вернул не JSON, но статус успешный, просто продолжаем
        console.warn('Сервер вернул не JSON ответ при успешном удалении аккаунта');
      }
      
      // Закрываем диалог
      setIsOpen(false);
      
      // Выходим из системы
      await logout();
      
      // Перенаправляем на главную страницу
      router.push('/');
    } catch (err: any) {
      console.error('Ошибка при удалении аккаунта:', err);
      setError(err.message || 'Произошла ошибка при удалении аккаунта');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const isDeleteButtonDisabled = confirmText !== 'Я подтверждаю' || !isAgreementChecked || isDeleting;
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive">Удалить аккаунт</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Удаление аккаунта
          </DialogTitle>
          <DialogDescription>
            Это действие <strong>необратимо</strong>. После удаления аккаунта все ваши данные, включая профиль, генерации и историю, будут полностью удалены.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-destructive/10 p-3 rounded-md text-sm">
            <p className="font-medium mb-1">Последствия удаления аккаунта:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Все ваши личные данные будут удалены</li>
              <li>Все ваши генерации будут удалены</li>
              <li>Вы потеряете доступ к своей подписке</li>
              <li>Это действие нельзя отменить</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-text" className="text-sm font-medium">
              Для подтверждения введите "Я подтверждаю"
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Я подтверждаю"
            />
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="agreement" 
              checked={isAgreementChecked}
              onCheckedChange={(checked) => setIsAgreementChecked(checked === true)}
            />
            <Label htmlFor="agreement" className="text-sm">
              Я понимаю, что удаление аккаунта необратимо, и все мои данные будут потеряны
            </Label>
          </div>
          
          {error && (
            <div className="text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Отмена
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteAccount} 
            disabled={isDeleteButtonDisabled}
          >
            {isDeleting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                Удаление...
              </>
            ) : (
              'Удалить аккаунт навсегда'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}