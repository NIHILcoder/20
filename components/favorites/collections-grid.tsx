'use client';

import { useState, useEffect } from 'react';
import { getUserFavorites, createCollection, deleteCollection } from '@/services/api-service';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage, useLocalTranslation } from '@/components/language-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Folder, MoreHorizontal, Edit, Trash2, Heart } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface CollectionsGridProps {
  userId: number;
  onCollectionSelect?: (collectionId: number) => void;
}

interface Collection {
  id: number;
  name: string;
  description: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
  item_count: number;
  cover_image: string | null;
}

interface Favorite {
  id: number;
  title: string;
  image_url: string;
  user_id: number;
  username: string;
  display_name: string;
  avatar_url: string;
  favorited_at: string;
}

export function CollectionsGrid({ userId, onCollectionSelect }: CollectionsGridProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для диалогов
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<number | null>(null);
  
  // Состояния для формы создания коллекции
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  
  const { language } = useLanguage();
  
  // Добавляем переводы для компонента
  const translations = {
    en: {
      'favorites.my_collections': 'My Collections',
      'favorites.new_collection': 'New Collection',
      'favorites.create_collection': 'Create Collection',
      'favorites.create_collection_description': 'Create a new collection to organize your favorite artworks',
      'favorites.collection_name': 'Collection Name',
      'favorites.collection_name_placeholder': 'Enter collection name',
      'favorites.collection_description': 'Description (optional)',
      'favorites.collection_description_placeholder': 'Enter collection description',
      'favorites.create': 'Create',
      'favorites.cancel': 'Cancel',
      'favorites.delete_collection': 'Delete Collection',
      'favorites.delete_collection_confirm': 'Are you sure you want to delete this collection? This action cannot be undone.',
      'favorites.delete': 'Delete',
      'favorites.edit': 'Edit',
      'favorites.items': 'items',
      'favorites.empty_state': 'You don\'t have any collections yet',
      'favorites.create_first': 'Create your first collection to organize your favorite artworks',
      'favorites.try_again': 'Try Again',
      'favorites.view': 'View',
      'favorites.actions': 'Actions'
    },
    ru: {
      'favorites.my_collections': 'Мои коллекции',
      'favorites.new_collection': 'Новая коллекция',
      'favorites.create_collection': 'Создать коллекцию',
      'favorites.create_collection_description': 'Создайте новую коллекцию для организации ваших любимых работ',
      'favorites.collection_name': 'Название коллекции',
      'favorites.collection_name_placeholder': 'Введите название коллекции',
      'favorites.collection_description': 'Описание (необязательно)',
      'favorites.collection_description_placeholder': 'Введите описание коллекции',
      'favorites.create': 'Создать',
      'favorites.cancel': 'Отмена',
      'favorites.delete_collection': 'Удалить коллекцию',
      'favorites.delete_collection_confirm': 'Вы уверены, что хотите удалить эту коллекцию? Это действие нельзя отменить.',
      'favorites.delete': 'Удалить',
      'favorites.edit': 'Редактировать',
      'favorites.items': 'элементов',
      'favorites.empty_state': 'У вас пока нет коллекций',
      'favorites.create_first': 'Создайте свою первую коллекцию для организации любимых работ',
      'favorites.try_again': 'Попробовать снова',
      'favorites.view': 'Просмотр',
      'favorites.actions': 'Действия'
    }
  };
  
  const t = useLocalTranslation(translations);
  
  // Загрузка коллекций и избранного
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await getUserFavorites(userId);
        if (response && typeof response === 'object' && 'collections' in response && 'favorites' in response) {
          setCollections(response.collections as Collection[]);
          setFavorites(response.favorites as Favorite[]);
        } else {
          throw new Error('Неверный формат ответа API');
        }
      } catch (err) {
        setError('Ошибка при загрузке избранного');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFavorites();
  }, [userId]);
  
  // Создание новой коллекции
  const handleCreateCollection = async () => {
    if (!newCollectionName.trim() || !userId) return;
    
    try {
      const newCollection = await createCollection({
        userId,
        name: newCollectionName.trim(),
        description: newCollectionDescription.trim() || undefined
      });
      
      setCollections([...collections, { 
        ...newCollection as Collection, 
        item_count: 0, 
        cover_image: null 
      }]);
      setNewCollectionName('');
      setNewCollectionDescription('');
      setCreateDialogOpen(false);
    } catch (err) {
      console.error('Ошибка при создании коллекции:', err);
    }
  };
  
  // Удаление коллекции
  const handleDeleteCollection = async () => {
    if (!collectionToDelete) return;
    
    try {
      await deleteCollection(collectionToDelete);
      setCollections(collections.filter(collection => collection.id !== collectionToDelete));
      setDeleteDialogOpen(false);
      setCollectionToDelete(null);
    } catch (err) {
      console.error('Ошибка при удалении коллекции:', err);
    }
  };
  
  // Отображение состояния загрузки
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full rounded-md" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-4 w-16" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  // Отображение ошибки
  if (error) {
    return (
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
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          {t.localT('favorites.my_collections')}
        </h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 transition-all duration-300">
              <Plus className="h-4 w-4" />
              <span>{t.localT('favorites.new_collection')}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">{t.localT('favorites.create_collection')}</DialogTitle>
              <DialogDescription>
                {t.localT('favorites.create_collection_description')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t.localT('favorites.collection_name')}
                </label>
                <Input 
                  value={newCollectionName} 
                  onChange={(e) => setNewCollectionName(e.target.value)} 
                  placeholder={t.localT('favorites.collection_name_placeholder')}
                  className="focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t.localT('favorites.collection_description')}
                </label>
                <Textarea 
                  value={newCollectionDescription} 
                  onChange={(e) => setNewCollectionDescription(e.target.value)} 
                  placeholder={t.localT('favorites.collection_description_placeholder')}
                  rows={3}
                  className="focus-visible:ring-primary resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                {t.localT('common.cancel')}
              </Button>
              <Button 
                onClick={handleCreateCollection}
                className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                disabled={!newCollectionName.trim()}
              >
                {t.localT('common.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Сетка коллекций */}
      {collections.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-background/80 backdrop-blur-sm shadow-md border-border/50 transition-all duration-300 hover:shadow-lg">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
            <Folder className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-6 text-xl font-medium">
            {t.localT('favorites.no_collections')}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            {t.localT('favorites.create_first_collection')}
          </p>
          <Button
            className="mt-6 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 transition-all duration-300"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t.localT('favorites.create_collection')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Card 
              key={collection.id} 
              className="overflow-hidden border border-border/50 transition-all duration-300 hover:shadow-md group"
            >
              <div 
                className="cursor-pointer" 
                onClick={() => onCollectionSelect && onCollectionSelect(collection.id)}
              >
                <div className="h-48 bg-muted flex items-center justify-center overflow-hidden relative">
                  {collection.cover_image ? (
                    <>
                      <img 
                        src={collection.cover_image} 
                        alt={collection.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button variant="secondary" className="bg-white/80 hover:bg-white">
                          {t.localT('favorites.view')}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Folder className="h-16 w-16 text-primary/70" />
                  )}
                </div>
                <CardContent className="p-5">
                  <h3 className="font-medium truncate">{collection.name}</h3>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {collection.description}
                    </p>
                  )}
                </CardContent>
              </div>
              <CardFooter className="p-4 flex justify-between items-center border-t">
                <span className="text-sm text-muted-foreground flex items-center">
                  <Heart className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                  {collection.item_count} {collection.item_count === 1 
                    ? t.localT('favorites.item') 
                    : t.localT('favorites.items')}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="cursor-pointer">
                      <Edit className="h-4 w-4 mr-2" />
                      {t.localT('favorites.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500 cursor-pointer"
                      onClick={() => {
                        setCollectionToDelete(collection.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t.localT('favorites.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Избранные работы */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <Heart className="h-5 w-5 text-red-500" />
          {t.localT('favorites.liked_artworks')}
        </h2>
        
        {favorites.length === 0 ? (
          <div className="text-center p-12 border rounded-lg bg-background/80 backdrop-blur-sm shadow-md border-border/50">
            <Heart className="h-12 w-12 mx-auto text-red-500/70" />
            <h3 className="mt-4 text-lg font-medium">
              {t.localT('favorites.no_favorites')}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              {t.localT('favorites.like_artworks')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                <div className="relative">
                  <img 
                    src={favorite.image_url} 
                    alt={favorite.title} 
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="outline" size="sm" className="text-white border-white hover:bg-white/20 hover:text-white">
                      {t.localT('favorites.view')}
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium truncate">{favorite.title}</h3>
                  <div className="flex items-center mt-2">
                    <img 
                      src={favorite.avatar_url || '/placeholder-user.jpg'} 
                      alt={favorite.display_name || favorite.username} 
                      className="h-6 w-6 rounded-full mr-2"
                    />
                    <span className="text-sm text-muted-foreground">
                      {favorite.display_name || favorite.username}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Диалог подтверждения удаления */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-red-500">
              {t.localT('favorites.delete_collection')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.localT('favorites.delete_collection_confirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.localT('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCollection} 
              className="bg-red-500 hover:bg-red-600 text-white focus:ring-red-500"
            >
              {t.localT('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}