"use client";

import { useState, useCallback } from "react";
import { EnhancedParticlesBackground } from "@/components/enhanced-particles-background";
import { ArtworkGrid } from "@/components/community/artwork-grid";
import { CommunityFilters } from "@/components/community/community-filters";
import { Tournaments } from "@/components/community/tournaments";
import { Collaborations } from "@/components/community/collaborations";
import { useLanguage, useLocalTranslation } from "@/components/language-context";

export default function CommunityPage() {
  const [filters, setFilters] = useState({
    category: 'all',
    sortBy: 'newest',
    search: '',
    modelType: 'all',
    timeRange: 'all',
    viewMode: 'grid' as 'grid' | 'list',
    activeTab: 'artworks'
  });
  
  const { language } = useLanguage();
  const t = useLocalTranslation({en: {}, ru: {}});
  
  // Обработчик изменения фильтров
  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);
  
  return (
    <div className="container mx-auto py-8 px-4 relative min-h-screen">
      <EnhancedParticlesBackground />
      
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            {t.localT('community.title')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.localT('community.subtitle')}
          </p>
        </div>
        
        {/* Фильтры */}
        <CommunityFilters onFilterChange={handleFilterChange} />
        
        {/* Отображение контента в зависимости от активной вкладки */}
        {filters.activeTab === 'artworks' && (
          <ArtworkGrid 
            category={filters.category}
            sortBy={filters.sortBy}
            search={filters.search}
            modelType={filters.modelType}
            timeRange={filters.timeRange}
            viewMode={filters.viewMode}
          />
        )}
        
        {filters.activeTab === 'tournaments' && (
          <Tournaments />
        )}
        
        {filters.activeTab === 'collaborations' && (
          <Collaborations />
        )}
      </div>
    </div>
  );
}