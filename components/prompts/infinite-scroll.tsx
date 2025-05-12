'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollProps {
  loadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
  className?: string;
  loadingText?: string;
  endMessage?: string;
  children: React.ReactNode;
}

export function InfiniteScroll({
  loadMore,
  hasMore,
  isLoading,
  threshold = 200,
  className = '',
  loadingText = 'Загрузка...',
  endMessage = 'Больше нет элементов',
  children
}: InfiniteScrollProps) {
  const [shouldLoadMore, setShouldLoadMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Обработчик прокрутки
  useEffect(() => {
    const handleScroll = () => {
      if (!loaderRef.current || isLoading || !hasMore) return;
      
      const loaderElement = loaderRef.current;
      const scrollContainer = scrollContainerRef.current;
      
      // Если контейнер не определен, используем window
      const containerHeight = scrollContainer 
        ? scrollContainer.clientHeight 
        : window.innerHeight;
      
      const containerScrollTop = scrollContainer 
        ? scrollContainer.scrollTop 
        : window.scrollY || document.documentElement.scrollTop;
      
      const containerScrollHeight = scrollContainer 
        ? scrollContainer.scrollHeight 
        : document.documentElement.scrollHeight;
      
      // Проверяем, достигли ли мы порога загрузки
      const isThresholdReached = 
        containerScrollTop + containerHeight + threshold >= containerScrollHeight;
      
      if (isThresholdReached && hasMore && !isLoading) {
        setShouldLoadMore(true);
      }
    };
    
    // Определяем, к какому элементу прикрепить обработчик прокрутки
    const scrollTarget = scrollContainerRef.current || window;
    scrollTarget.addEventListener('scroll', handleScroll);
    
    // Вызываем обработчик сразу, чтобы проверить начальное состояние
    handleScroll();
    
    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, isLoading, threshold]);
  
  // Загружаем больше элементов, когда shouldLoadMore становится true
  useEffect(() => {
    if (shouldLoadMore && hasMore && !isLoading) {
      loadMore();
      setShouldLoadMore(false);
    }
  }, [shouldLoadMore, hasMore, isLoading, loadMore]);
  
  return (
    <div ref={scrollContainerRef} className={className}>
      {children}
      
      <div ref={loaderRef} className="py-4 text-center">
        {isLoading && (
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>{loadingText}</span>
          </div>
        )}
        
        {!hasMore && !isLoading && (
          <div className="text-muted-foreground text-sm">
            {endMessage}
          </div>
        )}
      </div>
    </div>
  );
}