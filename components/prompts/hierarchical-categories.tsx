'use client';

import { useState, useRef } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, FolderIcon, FolderOpen, Plus, Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  count: number;
  color?: string;
  icon?: string;
  parentId?: string;
  children?: Category[];
  isCustom?: boolean;
}

interface HierarchicalCategoriesProps {
  title: string;
  categories: Category[];
  activeCategory: string;
  onCategorySelect: (categoryId: string) => void;
  onCategoryCreate?: (name: string, parentId?: string) => void;
  onCategoryEdit?: (id: string, name: string) => void;
  onCategoryDelete?: (id: string) => void;
  allowCustomCategories?: boolean;
  className?: string;
  maxHeight?: string;
}

// Компонент для отображения одной категории с возможными подкатегориями
function CategoryItem({
  category,
  activeCategory,
  onCategorySelect,
  onEdit,
  onDelete,
  onAddChild,
  allowCustomCategories = false,
  level = 0
}: {
  category: Category;
  activeCategory: string;
  onCategorySelect: (categoryId: string) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (id: string) => void;
  onAddChild?: (parentId: string) => void;
  allowCustomCategories?: boolean;
  level?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showActions, setShowActions] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div 
      className="space-y-1"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Button
        variant={activeCategory === category.id ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start text-left font-normal",
          level > 0 && `pl-${level * 2 + 4}`
        )}
        onClick={() => onCategorySelect(category.id)}
      >
        <div className="flex items-center w-full">
          {hasChildren ? (
            <span 
              className="mr-1 cursor-pointer"
              onClick={toggleExpand}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          ) : (
            <span className="w-4 mr-1"></span>
          )}
          
          {category.icon ? (
            <span className="mr-2" style={{ color: category.color }}>
              {isExpanded ? <FolderOpen className="h-4 w-4" /> : <FolderIcon className="h-4 w-4" />}
            </span>
          ) : null}
          
          <span 
            className="truncate"
            style={category.color ? { color: category.color } : undefined}
          >
            {category.name}
            {category.isCustom && <span className="text-xs ml-1 text-muted-foreground">(Своя)</span>}
          </span>
          
          <Badge variant="outline" className="ml-auto">
            {category.count}
          </Badge>
          
          {allowCustomCategories && showActions && (
            <div className="flex items-center ml-1">
              {category.isCustom && onEdit && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 ml-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(category);
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              
              {category.isCustom && onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 ml-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(category.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              
              {onAddChild && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 ml-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChild(category.id);
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </Button>
      
      {hasChildren && isExpanded && (
        <div className="pl-2">
          {category.children!.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              activeCategory={activeCategory}
              onCategorySelect={onCategorySelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              allowCustomCategories={allowCustomCategories}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function HierarchicalCategories({
  title,
  categories,
  activeCategory,
  onCategorySelect,
  onCategoryCreate,
  onCategoryEdit,
  onCategoryDelete,
  allowCustomCategories = false,
  className,
  maxHeight = '300px'
}: HierarchicalCategoriesProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{id: string, name: string} | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [parentCategoryId, setParentCategoryId] = useState<string | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const handleAddCategory = () => {
    if (!newCategoryName.trim() || !onCategoryCreate) return;
    
    onCategoryCreate(newCategoryName.trim(), parentCategoryId);
    setNewCategoryName('');
    setShowAddForm(false);
    setParentCategoryId(undefined);
  };
  
  const handleEditCategory = () => {
    if (!editingCategory || !onCategoryEdit) return;
    
    onCategoryEdit(editingCategory.id, editingCategory.name);
    setEditingCategory(null);
  };
  
  const handleDeleteCategory = (id: string) => {
    if (!onCategoryDelete) return;
    
    onCategoryDelete(id);
  };
  
  const startAddCategory = (parentId?: string) => {
    setParentCategoryId(parentId);
    setShowAddForm(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };
  
  const startEditCategory = (category: Category) => {
    setEditingCategory({ id: category.id, name: category.name });
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };
  
  // Фильтруем только корневые категории (без parentId)
  const rootCategories = categories.filter(cat => !cat.parentId);
  
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
        <CardContent className="pt-2 pb-2">
          {allowCustomCategories && (
            <div className="mb-3">
              {showAddForm ? (
                <div className="flex items-center mb-2">
                  <input
                    ref={inputRef}
                    type="text"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Название категории"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCategory();
                      } else if (e.key === 'Escape') {
                        setShowAddForm(false);
                        setNewCategoryName('');
                      }
                    }}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2"
                    onClick={handleAddCategory}
                  >
                    Добавить
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-1"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewCategoryName('');
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              ) : editingCategory ? (
                <div className="flex items-center mb-2">
                  <input
                    ref={inputRef}
                    type="text"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Название категории"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleEditCategory();
                      } else if (e.key === 'Escape') {
                        setEditingCategory(null);
                      }
                    }}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2"
                    onClick={handleEditCategory}
                  >
                    Сохранить
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-1"
                    onClick={() => setEditingCategory(null)}
                  >
                    Отмена
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mb-2"
                  onClick={() => startAddCategory()}
                >
                  <Plus className="h-4 w-4 mr-2" /> Добавить категорию
                </Button>
              )}
              
              {parentCategoryId && (
                <div className="text-xs text-muted-foreground mb-2">
                  Добавление подкатегории в: {categories.find(c => c.id === parentCategoryId)?.name}
                </div>
              )}
            </div>
          )}
          
          <ScrollArea className={`max-h-[${maxHeight}]`}>
            <div className="space-y-1">
              {rootCategories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  activeCategory={activeCategory}
                  onCategorySelect={onCategorySelect}
                  onEdit={allowCustomCategories && onCategoryEdit ? startEditCategory : undefined}
                  onDelete={allowCustomCategories && onCategoryDelete ? handleDeleteCategory : undefined}
                  onAddChild={allowCustomCategories && onCategoryCreate ? startAddCategory : undefined}
                  allowCustomCategories={allowCustomCategories}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}