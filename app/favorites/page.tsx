"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ParticlesBackground } from "@/components/particles-background";
import { CollectionsGrid } from "@/components/favorites/collections-grid";
import { CollectionItems } from "@/components/favorites/collection-items";
import { useLanguage, useLocalTranslation } from "@/components/language-context";
import { useAuth } from "@/components/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function FavoritesPage() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  // Добавляем переводы для страницы избранного
  const pageTranslations = {
    en: {
      'favorites.page_title': 'My Favorites',
      'favorites.page_subtitle': 'Manage your collections and favorite artworks',
      'favorites.login_required': 'Please log in to view your favorites',
      'favorites.redirecting': 'Redirecting to login page...',
    },
    ru: {
      'favorites.page_title': 'Мое избранное',
      'favorites.page_subtitle': 'Управляйте вашими коллекциями и избранными работами',
      'favorites.login_required': 'Пожалуйста, войдите в систему, чтобы просмотреть избранное',
      'favorites.redirecting': 'Перенаправление на страницу входа...',
    }
  };
  
  const t = useLocalTranslation(pageTranslations);
  
  useEffect(() => {
    // Проверяем авторизацию и перенаправляем на страницу входа, если пользователь не авторизован
    if (isAuthenticated === false) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
    setIsLoading(false);
  }, [isAuthenticated, router]);
  
  // Получаем ID пользователя из контекста авторизации
  const userId = user?.id || 0;
  
  // Если идет загрузка или проверка авторизации
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 relative min-h-screen">
        <ParticlesBackground />
        
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Если пользователь не авторизован
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4 relative min-h-screen">
        <ParticlesBackground />
        
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">
              {t.localT('favorites.page_title')}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.localT('favorites.login_required')}
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              {t.localT('favorites.redirecting')}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Если пользователь авторизован
  return (
    <div className="container mx-auto py-8 px-4 relative min-h-screen">
      <ParticlesBackground />
      
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent animate-gradient">
            {t.localT('favorites.page_title')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.localT('favorites.page_subtitle')}
          </p>
        </div>
        
        <div className="bg-background/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-border/50">
          {selectedCollectionId ? (
            <CollectionItems 
              userId={userId} 
              collectionId={selectedCollectionId} 
              onBack={() => setSelectedCollectionId(null)} 
            />
          ) : (
            <CollectionsGrid 
              userId={userId} 
              onCollectionSelect={setSelectedCollectionId} 
            />
          )}
        </div>
      </div>
    </div>
  );
}