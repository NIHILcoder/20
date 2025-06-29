'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage, useLocalTranslation } from '@/components/language-context';
import { Search, Filter, Grid, Rows, SlidersHorizontal, Flame, Clock, Award, Trophy, Users } from 'lucide-react';
import { Tournaments } from './tournaments';
import { Collaborations } from './collaborations';

interface CommunityFiltersProps {
  onFilterChange: (filters: {
    category: string;
    sortBy: string;
    search: string;
    modelType: string;
    timeRange: string;
    viewMode: 'grid' | 'list';
    activeTab: string;
  }) => void;
}

export function CommunityFilters({ onFilterChange }: CommunityFiltersProps) {
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');
  const [modelType, setModelType] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('artworks');
  
  const { language } = useLanguage();
  const t = useLocalTranslation({
    en: {
      'community.artworks': 'Artworks',
      'community.tournaments': 'Tournaments',
      'community.collaborations': 'Collaborations',
      'community.newest': 'Newest',
      'community.trending': 'Trending',
      'community.popular': 'Popular',
      'community.all_categories': 'All Categories',
      'community.portrait': 'Portrait',
      'community.landscape': 'Landscape',
      'community.abstract': 'Abstract',
      'community.fantasy': 'Fantasy',
      'community.sci-fi': 'Sci-Fi',
      'community.cyberpunk': 'Cyberpunk',
      'community.anime': 'Anime',
      'community.digital-art': 'Digital Art',
      'community.concept-art': 'Concept Art',
      'community.animals': 'Animals',
      'community.architecture': 'Architecture',
      'community.art': 'Art',
      'community.other': 'Other',
      'community.all_models': 'All Models',
      'community.other_models': 'Other Models',
      'community.all_time': 'All Time',
      'community.today': 'Today',
      'community.yesterday': 'Yesterday',
      'community.this_week': 'This Week',
      'community.this_month': 'This Month',
      'community.this_quarter': 'This Quarter',
      'community.this_year': 'This Year',
      'community.search_placeholder': 'Search community...',
      'community.grid_view': 'Grid View',
      'community.list_view': 'List View',
      'community.filters': 'Filters',
      'community.category': 'Category',
      'community.select_category': 'Select Category',
      'community.model_type': 'Model Type',
      'community.select_model': 'Select Model',
      'community.time_range': 'Time Range',
      'community.select_time': 'Select Time Range'
    },
    ru: {
      'community.artworks': 'Работы',
      'community.tournaments': 'Турниры',
      'community.collaborations': 'Коллаборации',
      'community.newest': 'Новые',
      'community.trending': 'В тренде',
      'community.popular': 'Популярные',
      'community.all_categories': 'Все категории',
      'community.portrait': 'Портрет',
      'community.landscape': 'Пейзаж',
      'community.abstract': 'Абстракция',
      'community.fantasy': 'Фэнтези',
      'community.sci-fi': 'Научная фантастика',
      'community.cyberpunk': 'Киберпанк',
      'community.anime': 'Аниме',
      'community.digital-art': 'Цифровое искусство',
      'community.concept-art': 'Концепт-арт',
      'community.animals': 'Животные',
      'community.architecture': 'Архитектура',
      'community.art': 'Искусство',
      'community.other': 'Другое',
      'community.all_models': 'Все модели',
      'community.other_models': 'Другие модели',
      'community.all_time': 'За все время',
      'community.today': 'Сегодня',
      'community.yesterday': 'Вчера',
      'community.this_week': 'За эту неделю',
      'community.this_month': 'За этот месяц',
      'community.this_quarter': 'За этот квартал',
      'community.this_year': 'За этот год',
      'community.search_placeholder': 'Поиск по сообществу...',
      'community.grid_view': 'Сетка',
      'community.list_view': 'Список',
      'community.filters': 'Фильтры',
      'community.category': 'Категория',
      'community.select_category': 'Выберите категорию',
      'community.model_type': 'Тип модели',
      'community.select_model': 'Выберите модель',
      'community.time_range': 'Временной диапазон',
      'community.select_time': 'Выберите период'
    }
  });
  
  // Категории работ
  const categories = [
    { id: 'all', name: t.localT('community.all_categories') },
    { id: 'portrait', name: t.localT('community.portrait') },
    { id: 'landscape', name: t.localT('community.landscape') },
    { id: 'abstract', name: t.localT('community.abstract') },
    { id: 'fantasy', name: t.localT('community.fantasy') },
    { id: 'sci-fi', name: t.localT('community.sci-fi') },
    { id: 'cyberpunk', name: t.localT('community.cyberpunk') },
    { id: 'anime', name: t.localT('community.anime') },
    { id: 'digital-art', name: t.localT('community.digital-art') },
    { id: 'concept-art', name: t.localT('community.concept-art') },
    { id: 'animals', name: t.localT('community.animals') },
    { id: 'architecture', name: t.localT('community.architecture') },
    { id: 'art', name: t.localT('community.art') },
    { id: 'other', name: t.localT('community.other') }
  ];
  
  // Типы моделей
  const modelTypes = [
    { id: 'all', name: t.localT('community.all_models') },
    { id: 'stable-diffusion-xl', name: 'Stable Diffusion XL' },
    { id: 'stable-diffusion-3', name: 'Stable Diffusion 3' },
    { id: 'flux', name: 'FLUX Standard' },
    { id: 'flux_ultra', name: 'FLUX Ultra' },
    { id: 'flux_realistic', name: 'FLUX Raw' },
    { id: 'flux_fill', name: 'FLUX Fill' },
    { id: 'dalle-3', name: 'DALL-E 3' },
    { id: 'kandinsky-3', name: 'Kandinsky 3' },
    { id: 'other', name: t.localT('community.other_models') }
  ];
  
  // Временные диапазоны
  const timeRanges = [
    { id: 'all', name: t.localT('community.all_time') },
    { id: 'today', name: t.localT('community.today') },
    { id: 'yesterday', name: t.localT('community.yesterday') },
    { id: 'week', name: t.localT('community.this_week') },
    { id: 'month', name: t.localT('community.this_month') },
    { id: 'quarter', name: t.localT('community.this_quarter') },
    { id: 'year', name: t.localT('community.this_year') }
  ];
  
  // Применение фильтров
  useEffect(() => {
    onFilterChange({
      category,
      sortBy,
      search,
      modelType,
      timeRange,
      viewMode,
      activeTab
    });
  }, [category, sortBy, search, modelType, timeRange, viewMode, activeTab]);
  
  // Обработчик поиска
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Поиск уже применяется через useEffect
  };
  
  return (
    <div className="space-y-4">
      {/* Поиск и переключатель вида */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t.localT('community.search_placeholder')}
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
            title={t.localT('community.grid_view')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
            title={t.localT('community.list_view')}
          >
            <Rows className="h-4 w-4" />
          </Button>
          <Button
            variant={isFilterOpen ? 'default' : 'outline'}
            size="icon"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            title={t.localT('community.filters')}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Основные вкладки */}
      <Tabs defaultValue="artworks" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="artworks" className="flex items-center justify-center gap-1 text-center">
            <Award className="h-4 w-4" />
            <span className="w-full text-center">{t.localT('community.artworks')}</span>
          </TabsTrigger>
          <TabsTrigger value="tournaments" className="flex items-center justify-center gap-1 text-center">
            <Trophy className="h-4 w-4" />
            <span className="w-full text-center">{t.localT('community.tournaments')}</span>
          </TabsTrigger>
          <TabsTrigger value="collaborations" className="flex items-center justify-center gap-1 text-center">
            <Users className="h-4 w-4" />
            <span className="w-full text-center">{t.localT('community.collaborations')}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="artworks">
          {/* Сортировка для работ */}
          <Tabs defaultValue="newest" value={sortBy} onValueChange={setSortBy} className="w-full mt-4">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="newest" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">{t.localT('community.newest')}</span>
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center gap-1">
                <Flame className="h-4 w-4" />
                <span className="hidden sm:inline">{t.localT('community.trending')}</span>
              </TabsTrigger>
              <TabsTrigger value="popular" className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span className="hidden sm:inline">{t.localT('community.popular')}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="tournaments">
          {/* Компонент Tournaments отображается в page.tsx */}
        </TabsContent>
        
        <TabsContent value="collaborations">
          {/* Компонент Collaborations отображается в page.tsx */}
        </TabsContent>
      </Tabs>
      
      {/* Расширенные фильтры */}
      {isFilterOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t.localT('community.category')}
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t.localT('community.select_category')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t.localT('community.model_type')}
            </label>
            <Select value={modelType} onValueChange={setModelType}>
              <SelectTrigger>
                <SelectValue placeholder={t.localT('community.select_model')} />
              </SelectTrigger>
              <SelectContent>
                {modelTypes.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t.localT('community.time_range')}
            </label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder={t.localT('community.select_time')} />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map((time) => (
                  <SelectItem key={time.id} value={time.id}>
                    {time.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}