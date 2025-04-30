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
  const t = useLocalTranslation({en: {}, ru: {}});
  
  // Категории работ
  const categories = [
    { id: 'all', name: t.localT('community.all_categories') },
    { id: 'portrait', name: t.localT('community.portrait') },
    { id: 'landscape', name: t.localT('community.landscape') },
    { id: 'abstract', name: t.localT('community.abstract') },
    { id: 'fantasy', name: t.localT('community.fantasy') },
    { id: 'animals', name: t.localT('community.animals') },
    { id: 'architecture', name: t.localT('community.architecture') },
    { id: 'art', name: t.localT('community.art') },
    { id: 'other', name: t.localT('community.other') }
  ];
  
  // Типы моделей
  const modelTypes = [
    { id: 'all', name: t.localT('community.all_models') },
    { id: 'stable-diffusion', name: 'Stable Diffusion' },
    { id: 'midjourney', name: 'Midjourney' },
    { id: 'dalle', name: 'DALL-E' },
    { id: 'kandinsky', name: 'Kandinsky' },
    { id: 'other', name: t.localT('community.other_models') }
  ];
  
  // Временные диапазоны
  const timeRanges = [
    { id: 'all', name: t.localT('community.all_time') },
    { id: 'today', name: t.localT('community.today') },
    { id: 'week', name: t.localT('community.this_week') },
    { id: 'month', name: t.localT('community.this_month') }
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
            <span className="w-full text-center">{t.localT('community.artworks') || 'Работы'}</span>
          </TabsTrigger>
          <TabsTrigger value="tournaments" className="flex items-center justify-center gap-1 text-center">
            <Trophy className="h-4 w-4" />
            <span className="w-full text-center">{t.localT('community.tournaments') || 'Турниры'}</span>
          </TabsTrigger>
          <TabsTrigger value="collaborations" className="flex items-center justify-center gap-1 text-center">
            <Users className="h-4 w-4" />
            <span className="w-full text-center">{t.localT('community.collaborations') || 'Коллаборации'}</span>
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
          <Tournaments />
        </TabsContent>
        
        <TabsContent value="collaborations">
          <Collaborations />
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