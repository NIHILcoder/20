'use client';

import { useState, useEffect } from 'react';
import { getUserFavorites, removeArtworkFromCollection, addArtworkToCollection } from '@/services/api-service';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage, useLocalTranslation } from '@/components/language-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, Download, Trash2, Share2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface CollectionItemsProps {
  userId: number;
  collectionId: number;
  onBack: () => void;
}

interface Collection {
  id: number;
  name: string;
  description: string | null;
  user_id: number;
}

interface CollectionItem {
  id: number;
  artwork_id: number;
  collection_id: number;
  added_at: string;
  artwork: {
    id: number;
    title: string;
    description: string;
    image_url: string;
    user_id: number;
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export function CollectionItems({ userId, collectionId, onBack }: CollectionItemsProps) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  
  const { language } = useLanguage();
  const t = useLocalTranslation({en: {}, ru: {}});
  
  // Загрузка коллекции и её элементов
  useEffect(() => {
    const fetchCollectionItems = async () => {
      if (!userId || !collectionId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Здесь должен быть запрос к API для получения элементов коллекции
        // Для примера используем getUserFavorites и фильтруем нужную коллекцию
        const response = await getUserFavorites(userId);
        if (response && typeof response === 'object' && 'collections' in response) {
          // Явно приводим response.collections к типу Collection[]
          const collections = response.collections as Collection[];
          const foundCollection = collections.find((c: Collection) => c.id === collectionId);
        
          if (foundCollection) {
            setCollection(foundCollection);
          
          // Здесь должен быть запрос к API для получения элементов коллекции
          // В реальном приложении нужно создать отдельный эндпоинт
            // Для примера создадим заглушку
            const mockItems: CollectionItem[] = [];
            setItems(mockItems);
          } else {
            setError('Коллекция не найдена');
          }
        } else {
          throw new Error('Неверный формат ответа API');
        }
      } catch (err) {
        setError('Ошибка при загрузке элементов коллекции');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollectionItems();
  }, [userId, collectionId]);
  
  // Удаление элемента из коллекции
  const handleRemoveItem = async () => {
    if (!itemToDelete || !collectionId) return;
    
    try {
      await removeArtworkFromCollection(collectionId, itemToDelete);
      setItems(items.filter(item => item.artwork_id !== itemToDelete));
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Ошибка при удалении работы из коллекции:', err);
    }
  };
  
  // Отображение состояния загрузки
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  // Отображение ошибки
  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" className="flex items-center gap-2" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          {t.localT('favorites.back_to_collections')}
        </Button>
        <div className="text-center p-8">
          <p className="text-red-500">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setLoading(true);
              setError(null);
            }}
          >
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="flex items-center gap-2" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          {t.localT('favorites.back_to_collections')}
        </Button>
        <h2 className="text-2xl font-bold">
          {collection?.name}
        </h2>
      </div>
      
      {collection?.description && (
        <p className="text-muted-foreground">{collection.description}</p>
      )}
      
      {/* Элементы коллекции */}
      {items.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-muted/20">
          <h3 className="mt-4 text-lg font-medium">
            {t.localT('favorites.empty_collection')}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.localT('favorites.add_to_collection')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative group">
                <img 
                  src={item.artwork.image_url} 
                  alt={item.artwork.title} 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="outline" size="sm" className="text-white border-white hover:bg-white/20 hover:text-white">
                    {t.localT('favorites.view')}
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium truncate">{item.artwork.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{item.artwork.description}</p>
                <div className="flex items-center mt-2">
                  <img 
                    src={item.artwork.avatar_url || '/placeholder-user.jpg'} 
                    alt={item.artwork.display_name || item.artwork.username} 
                    className="h-6 w-6 rounded-full mr-2"
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.artwork.display_name || item.artwork.username}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="p-4 flex justify-end border-t">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      {t.localT('favorites.download')}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="h-4 w-4 mr-2" />
                      {t.localT('favorites.share')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500"
                      onClick={() => {
                        setItemToDelete(item.artwork_id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t.localT('favorites.remove')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Диалог подтверждения удаления */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.localT('favorites.confirm_remove')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.localT('favorites.remove_confirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.localT('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveItem} className="bg-red-500 hover:bg-red-600">
              {t.localT('common.remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}