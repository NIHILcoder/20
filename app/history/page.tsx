"use client";

import { useState } from "react";
import { ParticlesBackground } from "@/components/particles-background";
import { GenerationStatistics } from "@/components/generation-statistics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Grid, Rows } from "lucide-react";
import { useLanguage, useLocalTranslation } from "@/components/language-context";
import { HistoryList } from "@/components/history/history-list";

export default function HistoryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { language } = useLanguage();
  const t = useLocalTranslation({en: {}, ru: {}});
  
  // Временная заглушка для ID пользователя
  // В реальном приложении должно быть получено из контекста авторизации
  const userId = 1;
  
  // Обработчик поиска
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Поиск уже применяется через передачу параметра в компонент
  };
  
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
        
        {/* Статистика генераций */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GenerationStatistics />
        </div>
        
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
          userId={userId}
          filter={selectedFilter}
          search={searchQuery}
          viewMode={viewMode}
        />
      </div>
    </div>
  );
}