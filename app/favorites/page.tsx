"use client";

import { useState } from "react";
import { ParticlesBackground } from "@/components/particles-background";
import { CollectionsGrid } from "@/components/favorites/collections-grid";
import { CollectionItems } from "@/components/favorites/collection-items";
import { useLanguage, useLocalTranslation } from "@/components/language-context";

export default function FavoritesPage() {
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const { language } = useLanguage();
  
  // Добавляем переводы для страницы избранного
  const pageTranslations = {
    en: {
      'favorites.page_title': 'My Favorites',
      'favorites.page_subtitle': 'Manage your collections and favorite artworks',
    },
    ru: {
      'favorites.page_title': 'Мое избранное',
      'favorites.page_subtitle': 'Управляйте вашими коллекциями и избранными работами',
    }
  };
  
  const t = useLocalTranslation(pageTranslations);
  
  // Временная заглушка для ID пользователя
  // В реальном приложении должно быть получено из контекста авторизации
  const userId = 1;
  
  return (
    <div className="container mx-auto py-8 px-4 relative min-h-screen">
      <ParticlesBackground />
      
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            {t.localT('favorites.page_title')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.localT('favorites.page_subtitle')}
          </p>
        </div>
        
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
  );
}