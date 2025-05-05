'use client';

import { useState, useEffect } from "react";
import { getUserHistory, deleteArtworkFromHistory } from '@/services/api-service';
import type { HistoryResponse, Artwork, GroupedArtworks, PaginationData } from '@/services/api-service';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useLanguage, useLocalTranslation } from "@/components/language-context";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, Clock, Download, Trash2, Eye, Heart } from "lucide-react";

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
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
            }>
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="overflow-hidden group hover:shadow-md transition-all duration-300">
                  <div className="relative">
                    <Skeleton className="h-48 w-full" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex items-center justify-between mt-3">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
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
    <div>
      {Object.keys(groupedArtworks).map(dateKey => (
        <div key={dateKey} className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">{formatDate(dateKey)}</h2>
            <Badge variant="outline" className="rounded-full">
              {groupedArtworks[dateKey].length}
            </Badge>
          </div>
          
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "space-y-4"
          }>
            {groupedArtworks[dateKey].map((artwork: Artwork) => (
              <Card key={artwork.id} className="overflow-hidden group hover:shadow-md transition-all duration-300">
                <div className="relative">
                  <img 
                    src={artwork.image_url} 
                    alt={artwork.title || 'Generated artwork'} 
                    className="w-full h-48 object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {artwork.is_saved && (
                      <Badge variant="secondary" className="bg-primary/80 hover:bg-primary">
                        {t.localT('history.saved')}
                      </Badge>
                    )}
                    {artwork.is_public && (
                      <Badge variant="secondary" className="bg-blue-500/80 hover:bg-blue-500">
                        {t.localT('history.shared')}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Оверлей с действиями при наведении */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="secondary" size="icon" className="rounded-full h-9 w-9">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {t.localT('history.download')}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="secondary" size="icon" className="rounded-full h-9 w-9">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {t.localT('history.view_details')}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="rounded-full h-9 w-9"
                            onClick={(e) => {
                              e.stopPropagation();
                              setArtworkToDelete(artwork.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {t.localT('history.delete')}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-medium truncate">
                    {artwork.title || t.localT('history.untitled')}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {artwork.prompt}
                  </p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {new Date(artwork.created_at).toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {artwork.likes_count > 0 && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Heart className={`h-3.5 w-3.5 mr-1 ${artwork.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
                          {artwork.likes_count}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
      
      {/* Пагинация */}
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              // Показываем только текущую страницу, первую, последнюю и соседние
              if (
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              
              // Добавляем многоточие между разрывами
              if (
                (page === 2 && currentPage > 3) || 
                (page === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return <PaginationItem key={page}>...</PaginationItem>;
              }
              
              return null;
            })}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) handlePageChange(currentPage + 1);
                }}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      
      {/* Диалог подтверждения удаления */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.localT('history.delete_confirmation_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.localT('history.delete_confirmation_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.localT('history.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteArtwork} className="bg-destructive hover:bg-destructive/90">
              {t.localT('history.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}