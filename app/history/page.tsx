"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ParticlesBackground } from "@/components/particles-background";
import { GenerationStatistics } from "@/components/generation-statistics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Grid, Rows, Calendar, Clock } from "lucide-react";
import { useLanguage, useLocalTranslation } from "@/components/language-context";
import { HistoryList } from "@/components/history/history-list";
import { useAuth } from "@/components/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function HistoryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "statistics">("all");
  const { language } = useLanguage();
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Локализация
  const t = useLocalTranslation({
    en: {
      'history.page_title': 'My Generation History',
      'history.page_subtitle': 'View and manage your previous image generations',
      'history.search_placeholder': 'Search by prompt or title...',
      'history.filter_by': 'Filter by',
      'history.all_images': 'All Images',
      'history.saved_only': 'Saved Only',
      'history.shared_only': 'Shared Only',
      'history.grid_view': 'Grid View',
      'history.list_view': 'List View',
      'history.tab_all': 'All Generations',
      'history.tab_statistics': 'Statistics',
      'history.no_auth': 'Please log in to view your generation history',
      'history.login': 'Log In',
      'history.today': 'Today',
      'history.yesterday': 'Yesterday',
      'history.this_week': 'This Week',
      'history.this_month': 'This Month',
      'history.older': 'Older',
    },
    ru: {
      'history.page_title': 'Моя история генераций',
      'history.page_subtitle': 'Просмотр и управление вашими предыдущими генерациями изображений',
      'history.search_placeholder': 'Поиск по промпту или названию...',
      'history.filter_by': 'Фильтровать по',
      'history.all_images': 'Все изображения',
      'history.saved_only': 'Только сохраненные',
      'history.shared_only': 'Только опубликованные',
      'history.grid_view': 'Вид сеткой',
      'history.list_view': 'Вид списком',
      'history.tab_all': 'Все генерации',
      'history.tab_statistics': 'Статистика',
      'history.no_auth': 'Пожалуйста, войдите в систему, чтобы просмотреть историю генераций',
      'history.login': 'Войти',
      'history.today': 'Сегодня',
      'history.yesterday': 'Вчера',
      'history.this_week': 'На этой неделе',
      'history.this_month': 'В этом месяце',
      'history.older': 'Ранее',
    }
  });
  
  // Перенаправление на страницу входа, если пользователь не авторизован
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);
  
  // Обработчик поиска
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Поиск уже применяется через передачу параметра в компонент
  };
  
  // Если идет загрузка, показываем скелетон
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 relative min-h-screen">
        <ParticlesBackground />
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }
  
  // Если пользователь не авторизован, показываем сообщение
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4 relative min-h-screen flex items-center justify-center">
        <ParticlesBackground />
        <Card className="w-full max-w-md mx-auto bg-card/90 backdrop-blur-sm">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">{t.localT('history.no_auth')}</p>
            <Button onClick={() => router.push('/login')}>
              {t.localT('history.login')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 relative min-h-screen">
      <ParticlesBackground />
      
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            {t.localT('history.page_title')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.localT('history.page_subtitle')}
          </p>
        </div>
        
        {/* Табы для переключения между всеми генерациями и статистикой */}
        <Tabs defaultValue="all" className="mt-6" onValueChange={(value) => setActiveTab(value as "all" | "statistics")}>
          <div className="flex justify-center mb-6">
            <TabsList className="bg-muted/50 backdrop-blur-sm">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t.localT('history.tab_all')}
              </TabsTrigger>
              <TabsTrigger value="statistics" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t.localT('history.tab_statistics')}
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="space-y-6 mt-0">
            {/* Фильтры и поиск */}
            <div className="flex flex-col sm:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t.localT('history.search_placeholder')}
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
              
              <div className="flex items-center gap-2">
                <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder={t.localT('history.filter_by')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.localT('history.all_images')}</SelectItem>
                    <SelectItem value="saved">{t.localT('history.saved_only')}</SelectItem>
                    <SelectItem value="shared">{t.localT('history.shared_only')}</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  title={t.localT('history.grid_view')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  title={t.localT('history.list_view')}
                >
                  <Rows className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Список истории */}
            <HistoryList 
              userId={user?.id || 0}
              filter={selectedFilter}
              search={searchQuery}
              viewMode={viewMode}
            />
          </TabsContent>
          
          <TabsContent value="statistics" className="space-y-6 mt-0">
            {/* Статистика генераций */}
            <div className="grid grid-cols-1 gap-6">
              <GenerationStatistics />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}