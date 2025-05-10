'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Category {
  id: string;
  name: string | React.ReactNode;
  count: number;
  color?: string;
}

interface CollapsibleCategoriesProps {
  title: string;
  categories: Category[];
  activeCategory: string;
  onCategorySelect: (categoryId: string) => void;
  className?: string;
}

export function CollapsibleCategories({
  title,
  categories,
  activeCategory,
  onCategorySelect,
  className
}: CollapsibleCategoriesProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Card className={cn("mb-4", className)}>
      <div className="flex items-center justify-between p-4">
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
      
      {!isCollapsed && (
        <CardContent className="pt-0 pb-2">
          <ScrollArea className="max-h-[300px] pr-2">
            <div className="space-y-1">
              {categories.map((category, index) => (
                <Button
                  key={index}
                  variant={activeCategory === category.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left font-normal"
                  onClick={() => onCategorySelect(category.id)}
                >
                  <span className="truncate">{category.name}</span>
                  <Badge variant="outline" className="ml-auto">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}