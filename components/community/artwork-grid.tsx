'use client';

import { useState, useEffect } from 'react';
import { getCommunityArtworks } from '@/services/api-service';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, MessageSquare, Eye, Download, Share2, X } from 'lucide-react';
import { useLanguage, useLocalTranslation } from '@/components/language-context';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
// Пагинация реализована с использованием базовых HTML-элементов

interface ArtworkGridProps {
  category?: string;
  sortBy?: string;
  search?: string;
  modelType?: string;
  timeRange?: string;
  viewMode?: 'grid' | 'list';
}

interface Artwork {
  id: number;
  title: string;
  description: string;
  image_url: string;
  user_id: number;
  username: string;
  display_name: string;
  avatar_url: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  views: number;
  tags: string[];
  model: string;
  prompt?: string;
}

interface PaginationData {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface CommunityArtworksResponse {
  artworks: Artwork[];
  pagination: PaginationData;
}

export function ArtworkGrid({
  category = 'all',
  sortBy = 'newest',
  search = '',
  modelType = 'all',
  timeRange = 'all',
  viewMode = 'grid'
}: ArtworkGridProps) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    limit: 12,
    offset: 0,
    hasMore: false
  });
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { language } = useLanguage();
  const t = useLocalTranslation({
    en: {
      'artwork_details': 'Artwork Details',
      'by_artist': 'By',
      'created_at': 'Created at',
      'model': 'Model',
      'prompt': 'Prompt',
      'no_prompt': 'No prompt information available',
      'no_artworks_found': 'No artworks found matching your criteria'
    },
    ru: {
      'artwork_details': 'Детали работы',
      'by_artist': 'Автор',
      'created_at': 'Создано',
      'model': 'Модель',
      'prompt': 'Промпт',
      'no_prompt': 'Информация о промпте отсутствует',
      'no_artworks_found': 'Не найдено работ, соответствующих вашим критериям'
    }
  });
  
  // Загрузка работ
  useEffect(() => {
    const fetchArtworks = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getCommunityArtworks({
          limit: pagination.limit,
          offset: pagination.offset,
          category,
          sortBy,
          search,
          modelType,
          timeRange
        });
        
        if (response && typeof response === 'object' && 'artworks' in response && 'pagination' in response) {
          setArtworks(response.artworks as Artwork[]);
          // Обновляем только те поля пагинации, которые не вызовут повторный запрос
          setPagination(prev => ({
            ...prev,
            total: response.pagination.total,
            hasMore: response.pagination.hasMore
          }));
        } else {
          throw new Error('Неверный формат ответа API');
        }
      } catch (err) {
        setError('Ошибка при загрузке работ сообщества');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArtworks();
  }, [category, sortBy, search, modelType, timeRange, pagination.limit, pagination.offset]);
  
  // Обработчик изменения страницы
  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * pagination.limit;
    setPagination(prev => ({ ...prev, offset: newOffset }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Текущая страница
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  // Общее количество страниц
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  
  // Отображение состояния загрузки
  if (loading && artworks.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
            <CardFooter className="flex justify-between p-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </CardFooter>
          </Card>
        ))}
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
            setPagination(prev => ({ ...prev }));
          }}
        >
          Попробовать снова
        </Button>
      </div>
    );
  }
  
  // Функция форматирования даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Обработчик для скачивания изображения
  const handleDownloadArtwork = async (artwork: Artwork) => {
    try {
      const response = await fetch(artwork.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `artwork_${artwork.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Можно добавить уведомление об успешном скачивании
    } catch (error) {
      console.error('Ошибка при скачивании изображения:', error);
    }
  };
  
  // Обработчик для открытия диалогового окна с деталями работы
  const handleArtworkClick = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setDialogOpen(true);
  };
  
  // Отображение пустого результата
  if (artworks.length === 0 && !loading) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">
          {t.localT('no_artworks_found')}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
        : "space-y-4"
      }>
        {artworks.map((artwork) => (
          <Card key={artwork.id} className={viewMode === 'list' ? "flex overflow-hidden" : "overflow-hidden"} onClick={() => handleArtworkClick(artwork)}>
            <div className={viewMode === 'list' ? "w-1/3" : ""}>
              <img 
                src={artwork.image_url} 
                alt={artwork.title} 
                className="h-48 w-full object-cover transition-transform hover:scale-105 cursor-pointer"
              />
            </div>
            <div className={viewMode === 'list' ? "w-2/3" : ""}>
              <CardContent className="p-4">
                <h3 className="font-medium truncate">{artwork.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{artwork.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {artwork.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {artwork.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{artwork.tags.length - 3}</Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center p-4">
                <div className="flex items-center space-x-2">
                  <img 
                    src={artwork.avatar_url || '/placeholder-user.jpg'} 
                    alt={artwork.display_name || artwork.username} 
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="text-sm">{artwork.display_name || artwork.username}</span>
                </div>
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span className="text-xs">{artwork.likes_count}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-xs">{artwork.comments_count}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span className="text-xs">{artwork.views}</span>
                  </div>
                </div>
              </CardFooter>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="mx-auto flex w-full justify-center">
            <ul className="flex flex-row items-center gap-1">
              <li>
                <a
                  className="flex items-center gap-1 pl-2.5 h-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m15 18-6-6 6-6"/></svg>
                  <span>Previous</span>
                </a>
              </li>
              
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <li key={i}>
                    <a
                      className={`flex h-9 w-9 items-center justify-center rounded-md ${pageNumber === currentPage ? 'border border-input bg-background' : 'hover:bg-accent hover:text-accent-foreground'}`}
                      onClick={() => handlePageChange(pageNumber)}
                      style={{ cursor: 'pointer' }}
                    >
                      {pageNumber}
                    </a>
                  </li>
                );
              })}
              
              <li>
                <a
                  className="flex items-center gap-1 pr-2.5 h-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  <span>Next</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m9 18 6-6-6-6"/></svg>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Диалоговое окно с деталями работы */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-sm">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">{t.localT('artwork_details')}</DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedArtwork && (
            <div className="space-y-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-md">
                <img 
                  src={selectedArtwork.image_url} 
                  alt={selectedArtwork.title} 
                  className="h-full w-full object-contain"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selectedArtwork.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    <span>{selectedArtwork.likes_count}</span>
                    <MessageSquare className="h-4 w-4 ml-2" />
                    <span>{selectedArtwork.comments_count}</span>
                    <Eye className="h-4 w-4 ml-2" />
                    <span>{selectedArtwork.views}</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {t.localT('by_artist')} <span className="font-medium">{selectedArtwork.display_name || selectedArtwork.username}</span>
                </p>
                
                <p className="text-sm">
                  <span className="font-medium">{t.localT('created_at')}:</span> {formatDate(selectedArtwork.created_at)}
                </p>
                
                {selectedArtwork.model && (
                  <p className="text-sm">
                    <span className="font-medium">{t.localT('model')}:</span> {selectedArtwork.model}
                  </p>
                )}
                
                <Separator className="my-2" />
                
                <div className="space-y-2">
                  <p className="font-medium text-sm">{t.localT('prompt')}:</p>
                  <p className="text-sm bg-muted/50 p-3 rounded-md">
                    {selectedArtwork.prompt || t.localT('no_prompt')}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-3">
                  {selectedArtwork.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <DialogFooter className="flex justify-end space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleDownloadArtwork(selectedArtwork)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t.localT('community.download')}
                </Button>
                <Button 
                  variant="default"
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  {t.localT('community.share')}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}