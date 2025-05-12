'use client';

import { useState, useEffect, useRef } from 'react';
import { Tag, X, Plus, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedBadge } from '@/components/animated-components';
import { cn } from '@/lib/utils';

interface TagItem {
  id: string;
  name: string;
  count: number;
  color?: string;
  isCustom?: boolean;
}

interface TagsSelectorProps {
  title?: string;
  tags: TagItem[];
  selectedTags: string[];
  onTagSelect: (tagId: string) => void;
  onTagsChange?: (tags: string[]) => void;
  onTagCreate?: (tagName: string) => void;
  className?: string;
  allowCreate?: boolean;
  maxHeight?: string;
  showCounts?: boolean;
}

export function TagsSelector({
  title = 'Теги',
  tags,
  selectedTags,
  onTagSelect,
  onTagsChange,
  onTagCreate,
  className,
  allowCreate = false,
  maxHeight = '300px',
  showCounts = true
}: TagsSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filteredTags, setFilteredTags] = useState<TagItem[]>(tags);
  const inputRef = useRef<HTMLInputElement>(null);

  // Фильтрация тегов при изменении поискового запроса или списка тегов
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTags(tags);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = tags.filter(tag => 
      tag.name.toLowerCase().includes(query)
    );
    setFilteredTags(filtered);
  }, [searchQuery, tags]);

  // Обработчик добавления нового тега
  const handleAddTag = () => {
    if (!newTagName.trim() || !onTagCreate) return;
    
    onTagCreate(newTagName.trim());
    setNewTagName('');
    
    // Фокус на поле ввода после добавления
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Обработчик нажатия Enter в поле ввода нового тега
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagName.trim() && onTagCreate) {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Обработчик очистки всех выбранных тегов
  const handleClearTags = () => {
    if (onTagsChange) {
      onTagsChange([]);
    }
  };

  // Переключение состояния свернутости
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Card className={cn("mb-4", className)}>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleCollapse}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="p-4 pt-2">
          {/* Поиск тегов */}
          <div className="relative mb-3">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск тегов..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Выбранные теги */}
          {selectedTags.length > 0 && (
            <div className="mb-3">
              <div className="text-sm font-medium mb-2">Выбранные теги:</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedTags.map(tagId => {
                  const tag = tags.find(t => t.id === tagId);
                  return tag ? (
                    <AnimatedBadge
                      key={tag.id}
                      className="flex items-center gap-1 pr-1 bg-secondary/50"
                      style={tag.color ? { backgroundColor: `${tag.color}20`, borderColor: tag.color } : undefined}
                    >
                      {tag.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 rounded-full"
                        onClick={() => onTagSelect(tag.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </AnimatedBadge>
                  ) : null;
                })}
                {selectedTags.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={handleClearTags}
                  >
                    Очистить все
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* Список доступных тегов */}
          <ScrollArea className={`max-h-[${maxHeight}]`}>
            <div className="flex flex-wrap gap-1.5">
              {filteredTags.length > 0 ? (
                filteredTags.map(tag => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "secondary" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all hover:bg-secondary/50",
                      selectedTags.includes(tag.id) && "bg-secondary"
                    )}
                    style={tag.color ? { 
                      backgroundColor: selectedTags.includes(tag.id) ? `${tag.color}20` : 'transparent', 
                      borderColor: tag.color,
                      color: tag.color
                    } : undefined}
                    onClick={() => onTagSelect(tag.id)}
                  >
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {tag.name}
                      {showCounts && tag.count > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">({tag.count})</span>
                      )}
                    </span>
                  </Badge>
                ))
              ) : (
                <div className="text-sm text-muted-foreground py-2 w-full text-center">
                  {searchQuery ? 'Теги не найдены' : 'Нет доступных тегов'}
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Форма добавления нового тега */}
          {allowCreate && (
            <div className="mt-3 flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Новый тег"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button 
                size="sm" 
                disabled={!newTagName.trim()}
                onClick={handleAddTag}
              >
                <Plus className="h-4 w-4 mr-1" />
                Добавить
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}