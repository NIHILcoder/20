'use client';

import { useState, useEffect } from 'react';
import { getUserHistory, deleteArtworkFromHistory } from '@/services/api-service';
import type { HistoryResponse, Artwork, GroupedArtworks, PaginationData } from '@/services/api-service';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useLanguage, useLocalTranslation } from '@/components/language-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, Clock, Download, Trash2, Eye, Heart } from 'lucide-react';

interface HistoryListProps {
  userId: number;
  filter?: string;
  search?: string;
  viewMode?: 'grid' | 'list';
}

// Using types from api-service.d.ts

export function HistoryList({
  userId,
  filter = 'all',
  search = '',
  viewMode = 'grid'
}: HistoryListProps) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [groupedArtworks, setGroupedArtworks] = useState<GroupedArtworks>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [artworkToDelete, setArtworkToDelete] = useState<number | null>(null);
  
  const { language } = useLanguage();
  const t = useLocalTranslation({en: {}, ru: {}});
  
  // Загрузка истории
  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await getUserHistory({
          userId,
          limit: pagination.limit,
          offset: pagination.offset,
          filter,
          search
        });
        
        const typedResponse = response as HistoryResponse;
        setArtworks(typedResponse.artworks);
        setGroupedArtworks(typedResponse.groupedArtworks);
        setPagination(typedResponse.pagination);
      } catch (err) {
        setError('Ошибка при загрузке истории генераций');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [userId, filter, search, pagination.limit, pagination.offset]);
  
  // Обработчик удаления работы
  const handleDeleteArtwork = async () => {
    if (!artworkToDelete || !userId) return;
    
    try {
      await deleteArtworkFromHistory(artworkToDelete, userId);
      
      // Обновляем список после удаления
      setArtworks(artworks.filter(artwork => artwork.id !== artworkToDelete));
      
      // Обновляем сгруппированный список
      const newGroupedArtworks = { ...groupedArtworks };
      Object.keys(newGroupedArtworks).forEach(date => {
        newGroupedArtworks[date] = newGroupedArtworks[date].filter(
          (artwork: Artwork) => artwork.id !== artworkToDelete
        );
        
        if (newGroupedArtworks[date].length === 0) {
          delete newGroupedArtworks[date];
        }
      });
      
      setGroupedArtworks(newGroupedArtworks);
      setPagination((prev: PaginationData) => ({
        ...prev,
        total: prev.total - 1
      }));
    } catch (err) {
      console.error('Ошибка при удалении работы:', err);
    } finally {
      setDeleteDialogOpen(false);
      setArtworkToDelete(null);
    }
  };
  
  // Обработчик изменения страницы
  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * pagination.limit;
    setPagination((prev: PaginationData) => ({ ...prev, offset: newOffset }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Текущая страница
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  // Общее количество страниц
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  
  // Форматирование даты
  const formatDate = (dateKey: string) => {
    if (dateKey === 'today') {
      return t.localT('history.today');
    } else if (dateKey === 'yesterday') {
      return t.localT('history.yesterday');
    } else {
      const date = new Date(dateKey);
      return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  };
  
  // Отображение состояния загрузки
  if (loading && artworks.length === 0) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, groupIndex) => (
          <div key={groupIndex} className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {Array.from({ length: 3 }).map((_, index) => (
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
            setPagination((prev: PaginationData) => ({ ...prev }));
          }}
        >
          Попробовать снова
        </Button>
      </div>
    );
  }
  
  // Отображение пустого результата
  if (Object.keys(groupedArtworks).length === 0 && !loading) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">
          {t.localT('history.no_artworks_found')}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {Object.keys(groupedArtworks).map(dateKey => (
        <div key={dateKey} className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2 border-b pb-2 mb-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {formatDate(dateKey)}
          </h3>
          
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" 
            : "space-y-4"
          }>
            {groupedArtworks[dateKey].map((artwork: Artwork) => (
              <Card key={artwork.id} className={viewMode === 'list' ? "flex overflow-hidden hover:shadow-md transition-shadow duration-200" : "overflow-hidden hover:shadow-md transition-shadow duration-200"}>
                <div className={viewMode === 'list' ? "w-1/3 group overflow-hidden" : "group overflow-hidden"}>
                  <img 
                    src={artwork.image_url} 
                    alt={artwork.title || artwork.prompt} 
                    className="h-48 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                </div>
                <div className={viewMode === 'list' ? "w-2/3 flex flex-col h-full" : "flex flex-col h-full"}>
                  <CardContent className="p-4 flex-1">
                    <h3 className="font-medium truncate">{artwork.title || t.localT('history.untitled')}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{artwork.prompt}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">{artwork.model || 'AI'}</Badge>
                      {artwork.is_public && (
                        <Badge className="text-xs">{t.localT('history.public')}</Badge>
                      )}
                      {artwork.is_saved && (
                        <Badge variant="secondary" className="text-xs">{t.localT('history.saved')}</Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 flex justify-between items-center border-t mt-auto">
                    <div className="flex items-center text-muted-foreground text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(artwork.created_at).toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {artwork.is_liked && (
                        <div className="flex items-center ml-2">
                          <Heart className="h-3 w-3 mr-1 fill-current text-red-500" />
                          <span>{artwork.likes_count}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t.localT('history.view_image')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t.localT('history.download')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => {
                                setArtworkToDelete(artwork.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t.localT('history.delete_image')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardFooter>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
      
      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination className="shadow-sm rounded-lg p-1 bg-card">
            <PaginationContent>
              <PaginationItem>
                {currentPage > 1 ? (
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)}
                  />
                ) : (
                  <PaginationPrevious 
                    onClick={() => {}}
                    className="pointer-events-none opacity-50"
                  />
                )}
              </PaginationItem>
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
                  <PaginationItem key={i}>
                    <PaginationLink 
                      isActive={pageNumber === currentPage}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                {currentPage < totalPages ? (
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)}
                  />
                ) : (
                  <PaginationNext 
                    onClick={() => {}}
                    className="pointer-events-none opacity-50"
                  />
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      
      {/* Диалог подтверждения удаления */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.localT('history.confirm_delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.localT('history.delete_confirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.localT('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteArtwork} className="bg-red-500 hover:bg-red-600">
              {t.localT('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}