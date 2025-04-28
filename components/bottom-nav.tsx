"use client";

import { useRouter } from 'next/navigation';
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react';
import { useAuth } from '@/components/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/components/language-context';

export function BottomNav() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background px-4 backdrop-blur-sm">
      <button
        onClick={() => router.push('/')}
        className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground"
      >
        <Home className="h-6 w-6" />
        <span className="text-xs mt-1">Главная</span>
      </button>

      <button
        onClick={() => router.push('/prompts')}
        className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground"
      >
        <Search className="h-6 w-6" />
        <span className="text-xs mt-1">Поиск</span>
      </button>

      <button
        onClick={() => router.push('/generate')}
        className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground"
      >
        <PlusSquare className="h-6 w-6" />
        <span className="text-xs mt-1">Создать</span>
      </button>

      <button
        onClick={() => router.push('/favorites')}
        className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground"
      >
        <Heart className="h-6 w-6" />
        <span className="text-xs mt-1">Избранное</span>
      </button>

      {!isAuthenticated && (
        <button
          onClick={() => router.push('/login')}
          className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground"
        >
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Войти</span>
        </button>
      )}
    </div>
  );
}
//