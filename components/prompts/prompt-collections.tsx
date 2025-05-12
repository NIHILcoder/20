'use client';

import { useState, useRef } from 'react';
import { FolderIcon, Plus, Edit, Trash2, ChevronDown, ChevronUp, Lock, Globe, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Collection {
  id: string;
  name: string;
  description?: string;
  promptIds: string[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

interface PromptCollectionsProps {
  title: string;
  collections: Collection[];
  activeCollection: string | null;
  onCollectionSelect: (collectionId: string | null) => void;
  onCollectionCreate?: (name: string, description: string, isPublic: boolean) => void;
  onCollectionEdit?: (id: string, name: string, description: string, isPublic: boolean) => void;
  onCollectionDelete?: (id: string) => void;
  className?: string;
  maxHeight?: string;
}

export function PromptCollections({
  title,
  collections,
  activeCollection,
  onCollectionSelect,
  onCollectionCreate,
  onCollectionEdit,
  onCollectionDelete,
  className,
  maxHeight = '300px'
}: PromptCollectionsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [newCollectionIsPublic, setNewCollectionIsPublic] = useState(false);
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const handleAddCollection = () => {
    if (!newCollectionName.trim() || !onCollectionCreate) return;
    
    onCollectionCreate(
      newCollectionName.trim(), 
      newCollectionDescription.trim(), 
      newCollectionIsPublic
    );
    
    resetForm();
  };
  
  const handleEditCollection = () => {
    if (!editingCollection || !onCollectionEdit) return;
    
    onCollectionEdit(
      editingCollection.id, 
      editingCollection.name, 
      editingCollection.description || '', 
      editingCollection.isPublic
    );
    
    setEditingCollection(null);
  };
  
  const startAddCollection = () => {
    setShowAddForm(true);
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 100);
  };
  
  const startEditCollection = (collection: Collection) => {
    setEditingCollection(collection);
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 100);
  };
  
  const resetForm = () => {
    setShowAddForm(false);
    setNewCollectionName('');
    setNewCollectionDescription('');
    setNewCollectionIsPublic(false);
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
        <CardContent className="pt-2 pb-2">
          {/* Форма добавления/редактирования коллекции */}
          {(showAddForm || editingCollection) && (
            <div className="mb-3 space-y-2">
              <input
                ref={nameInputRef}
                type="text"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Название коллекции"
                value={editingCollection ? editingCollection.name : newCollectionName}
                onChange={(e) => {
                  if (editingCollection) {
                    setEditingCollection({...editingCollection, name: e.target.value});
                  } else {
                    setNewCollectionName(e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (editingCollection) {
                      handleEditCollection();
                    } else {
                      handleAddCollection();
                    }
                  } else if (e.key === 'Escape') {
                    if (editingCollection) {
                      setEditingCollection(null);
                    } else {
                      resetForm();
                    }
                  }
                }}
              />
              
              <textarea
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Описание (необязательно)"
                value={editingCollection ? editingCollection.description || '' : newCollectionDescription}
                onChange={(e) => {
                  if (editingCollection) {
                    setEditingCollection({...editingCollection, description: e.target.value});
                  } else {
                    setNewCollectionDescription(e.target.value);
                  }
                }}
              />
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="collection-public"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={editingCollection ? editingCollection.isPublic : newCollectionIsPublic}
                  onChange={(e) => {
                    if (editingCollection) {
                      setEditingCollection({...editingCollection, isPublic: e.target.checked});
                    } else {
                      setNewCollectionIsPublic(e.target.checked);
                    }
                  }}
                />
                <label htmlFor="collection-public" className="text-sm font-medium">
                  Публичная коллекция
                </label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (editingCollection) {
                      setEditingCollection(null);
                    } else {
                      resetForm();
                    }
                  }}
                >
                  Отмена
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => {
                    if (editingCollection) {
                      handleEditCollection();
                    } else {
                      handleAddCollection();
                    }
                  }}
                >
                  {editingCollection ? 'Сохранить' : 'Создать'}
                </Button>
              </div>
            </div>
          )}
          
          {/* Кнопка добавления новой коллекции */}
          {!showAddForm && !editingCollection && onCollectionCreate && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mb-3"
              onClick={startAddCollection}
            >
              <Plus className="h-4 w-4 mr-2" /> Создать коллекцию
            </Button>
          )}
          
          {/* Список коллекций */}
          <ScrollArea className={`max-h-[${maxHeight}]`}>
            <div className="space-y-1">
              <Button
                variant={activeCollection === null ? "secondary" : "ghost"}
                className="w-full justify-start text-left font-normal"
                onClick={() => onCollectionSelect(null)}
              >
                <div className="flex items-center w-full">
                  <span className="truncate">Все промпты</span>
                </div>
              </Button>
              
              {collections.map((collection) => (
                <div 
                  key={collection.id} 
                  className="relative group"
                >
                  <Button
                    variant={activeCollection === collection.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-left font-normal"
                    onClick={() => onCollectionSelect(collection.id)}
                  >
                    <div className="flex items-center w-full">
                      <FolderIcon className="h-4 w-4 mr-2" />
                      <span className="truncate">{collection.name}</span>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="ml-2">
                              {collection.isPublic ? (
                                <Globe className="h-3 w-3 text-muted-foreground" />
                              ) : (
                                <Lock className="h-3 w-3 text-muted-foreground" />
                              )}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {collection.isPublic ? 'Публичная коллекция' : 'Приватная коллекция'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <Badge variant="outline" className="ml-auto">
                        {collection.promptIds.length}
                      </Badge>
                      
                      <div className="hidden group-hover:flex items-center ml-1">
                        {onCollectionEdit && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 ml-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditCollection(collection);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {onCollectionDelete && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 ml-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onCollectionDelete) {
                                onCollectionDelete(collection.id);
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}