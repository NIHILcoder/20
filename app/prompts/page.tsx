"use client";
import { useScrollLock } from "@/components/hooks/useScrollLock";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/auth-context";
import { 
    getPrompts, 
    getPromptCategories, 
    getPopularTags, 
    createPrompt, 
    updatePrompt, 
    deletePrompt, 
    toggleFavoritePrompt,
    getUserCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    addPromptToCollection,
    removePromptFromCollection,
    ratePrompt,
    addComment,
    getPromptComments,
    Prompt,
    PromptFilters,
    PaginationData,
    Comment as CommentType,
    Collection as CollectionType
} from "@/services/prompts-service";
import { CollapsibleCategories } from "@/components/sidebar/collapsible-categories";
import { HierarchicalCategories } from "@/components/prompts/hierarchical-categories";
import { TagsSelector } from "@/components/prompts/tags-selector";
import { PromptCollections } from "@/components/prompts/prompt-collections";
import { PromptComments } from "@/components/prompts/prompt-comments";
import { InfiniteScroll } from "@/components/prompts/infinite-scroll";

import {
    BookOpen,
    Plus,
    Pencil,
    FileText,
    Upload,
    Trash2,
    Search,
    Tag,
    Star,
    StarHalf,
    Copy,
    Filter,
    SortAsc,
    SortDesc,
    Edit,
    CheckCircle2,
    FolderPlus,
    Bookmark,
    Share2,
    ThumbsUp,
    Download,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Lightbulb,
    Info,
    X,
    ChevronsUpDown,
    MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnhancedParticlesBackground } from "@/components/enhanced-particles-background";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import {
    AnimatedCard,
    AnimatedButton,
    SparkleButton,
    AnimatedCollapsible,
    AnimatedBadge,
    StaggeredContainer
} from "@/components/animated-components";
import { cn } from "@/lib/utils";
import { useLanguage, useLocalTranslation } from "@/components/language-context";

interface Category {
    id: string;
    name: string;
    count: number;
    color?: string;
    icon?: string;
    parentId?: string; // Для иерархической структуры категорий
    children?: Category[]; // Подкатегории
    isCustom?: boolean; // Флаг пользовательской категории
}

interface Tag {
    id: string;
    name: string;
    count: number;
    color?: string;
    isCustom?: boolean; // Флаг пользовательского тега
}

interface Collection {
    id: string;
    name: string;
    description?: string;
    promptIds: string[];
    createdAt: string;
    updatedAt: string;
    isPublic: boolean;
}

interface Comment {
    id: string;
    userId: number;
    username: string;
    text: string;
    createdAt: string;
    rating?: number;
}

export default function PromptLibrary() {
    const { user } = useAuth();
    const userId = user?.id || 0;
    
    const [searchQuery, setSearchQuery] = useState("");
    const [searchHistory, setSearchHistory] = useState<string[]>([]); // История поисковых запросов
    const [popularSearches, setPopularSearches] = useState<string[]>([]); // Популярные запросы
    
    const [activeCategory, setActiveCategory] = useState("all");
    const [activeTab, setActiveTab] = useState("my-prompts");
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [sortBy, setSortBy] = useState<string>("updatedAt");
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
    const [promptDialogOpen, setPromptDialogOpen] = useState<boolean>(false);
    const [createPromptOpen, setCreatePromptOpen] = useState<boolean>(false);
    const [editMode, setEditMode] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // Улучшенная пагинация
    const [pagination, setPagination] = useState<PaginationData>({ 
        total: 0, 
        limit: 20, 
        offset: 0, 
        hasMore: false 
    });
    const [infiniteScrollEnabled, setInfiniteScrollEnabled] = useState(true); // Включение бесконечной прокрутки
    const [isLoadingMore, setIsLoadingMore] = useState(false); // Состояние загрузки дополнительных промптов
    
    // Функция для загрузки дополнительных промптов при прокрутке
    const loadMorePrompts = async () => {
        if (!userId || !pagination.hasMore || isLoadingMore) return;
        
        setIsLoadingMore(true);
        try {
            const filters: PromptFilters = {
                userId: Number(userId),
                category: activeCategory !== 'all' ? activeCategory : undefined,
                search: searchQuery || undefined,
                sortBy: sortBy,
                sortDirection: sortDirection,
                limit: pagination.limit,
                offset: pagination.offset + pagination.limit,
                favorites: showOnlyFavorites,
                tab: activeTab as 'my-prompts' | 'community',
                collectionId: activeCollection || undefined
            };
            
            const response = await getPrompts(filters);
            setPrompts([...prompts, ...response.prompts]);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Ошибка при загрузке дополнительных промптов:', error);
        } finally {
            setIsLoadingMore(false);
        }
    };
    
    // Функции для массового редактирования промптов
    const toggleBulkEditMode = () => {
        setBulkEditMode(!bulkEditMode);
        if (!bulkEditMode) {
            // При включении режима массового редактирования очищаем выбранные промпты
            setSelectedPrompts([]);
        }
    };
    
    const togglePromptSelection = (promptId: string) => {
        if (selectedPrompts.includes(promptId)) {
            setSelectedPrompts(selectedPrompts.filter(id => id !== promptId));
        } else {
            setSelectedPrompts([...selectedPrompts, promptId]);
        }
    };
    
    const selectAllPrompts = () => {
        if (selectedPrompts.length === filteredPrompts.length) {
            // Если все промпты уже выбраны, снимаем выделение
            setSelectedPrompts([]);
        } else {
            // Иначе выбираем все промпты
            setSelectedPrompts(filteredPrompts.map(prompt => prompt.id));
        }
    };
    
    const openBulkEditDialog = () => {
        if (selectedPrompts.length === 0) return;
        setBulkEditData({
            category: '',
            tags: [],
            isPublic: false
        });
        setBulkEditDialogOpen(true);
    };
    
    const handleBulkEdit = async () => {
        if (selectedPrompts.length === 0 || !userId) return;
        
        try {
            // Обновляем каждый выбранный промпт
            const updatedPrompts: Prompt[] = [];
            for (const promptId of selectedPrompts) {
                const prompt = prompts.find(p => p.id === promptId);
                if (prompt) {
                    const updatedPrompt = await updatePrompt({
                        promptId: prompt.id,
                        userId: Number(userId),
                        title: prompt.title,
                        text: prompt.text,
                        category: bulkEditData.category || prompt.category,
                        tags: bulkEditData.tags?.length ? bulkEditData.tags : prompt.tags,
                        negative: prompt.negative,
                        notes: prompt.notes,
                        isPublic: bulkEditData.isPublic !== undefined ? bulkEditData.isPublic : prompt.isPublic,
                        parameters: prompt.parameters
                    });
                    updatedPrompts.push(updatedPrompt);
                }
            }
            
            // Обновляем список промптов
            setPrompts(prev => {
                const newPrompts = [...prev];
                for (const updatedPrompt of updatedPrompts) {
                    const index = newPrompts.findIndex(p => p.id === updatedPrompt.id);
                    if (index !== -1) {
                        newPrompts[index] = updatedPrompt;
                    }
                }
                return newPrompts;
            });
            
            // Закрываем диалог и выходим из режима массового редактирования
            setBulkEditDialogOpen(false);
            setBulkEditMode(false);
            setSelectedPrompts([]);
            setFormSuccess(`Успешно обновлено ${updatedPrompts.length} промптов`);
        } catch (error) {
            console.error('Ошибка при массовом редактировании промптов:', error);
            setFormError('Ошибка при массовом редактировании промптов');
        }
    };
    
    // Функции для экспорта/импорта промптов
    const exportPrompts = () => {
        // Экспортируем все промпты или только выбранные
        const promptsToExport = bulkEditMode && selectedPrompts.length > 0 
            ? prompts.filter(p => selectedPrompts.includes(p.id))
            : prompts;
        
        // Создаем объект для экспорта
        const exportData = {
            prompts: promptsToExport,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        // Конвертируем в JSON и создаем файл для скачивания
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `prompts-export-${new Date().toISOString().slice(0, 10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };
    // Добавьте эти функции для работы с коллекциями:

// Функция для обновления коллекции
const handleUpdateCollection = async (collectionId: string, name: string, description?: string, isPublic: boolean = false) => {
    if (!userId || !name.trim()) return;
    
    try {
        const p0Argument = {
            userId: Number(userId),
            name: name.trim(),
            description: description?.trim(),
            isPublic: isPublic
        };
        const collectionDataArgument = {
            collectionId: collectionId,
            userId: Number(userId),
            name: name.trim(),
            description: description?.trim(),
            isPublic: isPublic
        };
        const updatedCollection = await updateCollection(collectionId, p0Argument, collectionDataArgument);
        
        // Обновляем список коллекций
        setCollections(prev => 
            prev.map(collection => 
                collection.id === collectionId ? updatedCollection : collection
            )
        );
        
        setFormSuccess('Коллекция успешно обновлена');
        
        // Сбрасываем сообщение об успехе через 3 секунды
        setTimeout(() => setFormSuccess(null), 3000);
    } catch (error) {
        console.error('Ошибка при обновлении коллекции:', error);
        setFormError('Ошибка при обновлении коллекции');
        setTimeout(() => setFormError(null), 3000);
    }
};

// Функция для удаления коллекции
const handleDeleteCollection = async (collectionId: string) => {
    if (!userId || !collectionId) return;
    
    try {
        await deleteCollection(collectionId, Number(userId));
        
        // Удаляем коллекцию из списка
        setCollections(prev => prev.filter(collection => collection.id !== collectionId));
        
        // Если удаляемая коллекция была активной, сбрасываем активную коллекцию
        if (activeCollection === collectionId) {
            setActiveCollection(null);
        }
        
        setFormSuccess('Коллекция успешно удалена');
        
        // Сбрасываем сообщение об успехе через 3 секунды
        setTimeout(() => setFormSuccess(null), 3000);
    } catch (error) {
        console.error('Ошибка при удалении коллекции:', error);
        setFormError('Ошибка при удалении коллекции');
        setTimeout(() => setFormError(null), 3000);
    }
};
    const importPrompts = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || !event.target.files[0] || !userId) return;
        
        try {
            const file = event.target.files[0];
            const fileContent = await file.text();
            const importData = JSON.parse(fileContent);
            
            if (!importData.prompts || !Array.isArray(importData.prompts)) {
                setFormError('Неверный формат файла импорта');
                return;
            }
            
            // Импортируем каждый промпт
            const importedPrompts: Prompt[] = [];
            for (const promptData of importData.prompts) {
                // Создаем новый промпт на основе импортированных данных
                const newPrompt = await createPrompt({
                    userId: Number(userId),
                    title: promptData.title,
                    text: promptData.text,
                    category: promptData.category,
                    tags: promptData.tags,
                    negative: promptData.negative,
                    notes: promptData.notes,
                    isPublic: promptData.isPublic,
                    parameters: promptData.parameters
                });
                importedPrompts.push(newPrompt);
            }
            
            // Обновляем список промптов
            setPrompts(prev => [...importedPrompts, ...prev]);
            setFormSuccess(`Успешно импортировано ${importedPrompts.length} промптов`);
            
            // Сбрасываем значение input file
            event.target.value = '';
        } catch (error) {
            console.error('Ошибка при импорте промптов:', error);
            setFormError('Ошибка при импорте промптов');
        }
    };
    
    // Состояния для форм и уведомлений
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    const [tagsCollapsed, setTagsCollapsed] = useState(false);
    
    // Новые состояния для расширенных функций
    const [selectedTags, setSelectedTags] = useState<string[]>([]); // Выбранные теги для фильтрации
    const [collections, setCollections] = useState<Collection[]>([]); // Коллекции промптов
    const [activeCollection, setActiveCollection] = useState<string | null>(null); // Активная коллекция
    const [collectionDialogOpen, setCollectionDialogOpen] = useState(false); // Диалог создания/редактирования коллекции
    
    // Состояния для комментариев и рейтингов
    const [commentInput, setCommentInput] = useState(""); // Ввод комментария
    const [userRating, setUserRating] = useState<number | null>(null); // Рейтинг пользователя
    const [comments, setComments] = useState<Comment[]>([]); // Комментарии к выбранному промпту
    
    // Состояния для пользовательских категорий
    const [popularTags, setPopularTags] = useState<Tag[]>([]); // Популярные теги
    const [commentDialogOpen, setCommentDialogOpen] = useState(false); // Диалог комментариев
    
    // Состояния для массового редактирования
    const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]); // Выбранные промпты для массового редактирования
    const [bulkEditMode, setBulkEditMode] = useState(false); // Режим массового редактирования
    const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false); // Диалог массового редактирования
    const [bulkEditData, setBulkEditData] = useState<{
        category?: string;
        tags?: string[];
        isPublic?: boolean;
    }>({});
    
    // Состояния для предпросмотра и статистики
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false); // Диалог предпросмотра
    const [promptStats, setPromptStats] = useState<{[key: string]: any}>({}); // Статистика использования промпта

    const { language } = useLanguage();

    // Define page-specific translations
    const pageTranslations = {
        en: {
            'prompts.title': 'Prompt Library',
            'prompts.subtitle': 'Manage, organize, and share your AI image generation prompts',
            'prompts.search': 'Search prompts...',
            'prompts.category': 'Category',
            'prompts.new_prompt': 'New Prompt',
            'prompts.categories.all': 'All Prompts',
            'prompts.categories.title': 'Categories',
            'prompts.tags.title': 'Popular Tags',
            'prompts.templates.title': 'Prompt Templates',
            'prompts.tips.title': 'AI Art Creation Tips',
            'prompts.tips.description': 'Be specific about details, lighting, camera angles, and styles. Include keywords like "high resolution" and "detailed".',
            'prompts.tips.learn_more': 'Learn More',
            'prompts.my_prompts': 'My Prompts',
            'prompts.community': 'Community',
            'prompts.favorites_only': 'Favorites Only',
            'prompts.sort': 'Sort',
            'prompts.sort_by': 'Sort by',
            'prompts.sort_direction': 'Direction',
            'prompts.ascending': 'Ascending',
            'prompts.descending': 'Descending',
            'prompts.no_prompts': 'No prompts found',
            'prompts.try_changing': 'Try changing your search or filters',
            'prompts.clear_filters': 'Clear Filters',
            'prompts.create_prompt': 'Create Prompt',
            'prompts.edit_prompt': 'Edit Prompt',
            'prompts.save_changes': 'Save Changes',
            'prompts.save_prompt': 'Save Prompt',
            'prompts.cancel': 'Cancel',
            'prompts.delete': 'Delete',
            'prompts.use_prompt': 'Use Prompt',
            'prompts.copy': 'Copy',
            'prompts.copy_prompt': 'Copy Prompt',
            'prompts.edit': 'Edit',
            'prompts.share': 'Share Publicly',
            'prompts.make_private': 'Make Private',
            'prompts.details': 'Prompt Details',
            'prompts.form.title': 'Title',
            'prompts.form.title_placeholder': 'Give your prompt a descriptive title',
            'prompts.form.text': 'Prompt Text',
            'prompts.form.text_placeholder': 'Enter your detailed prompt here...',
            'prompts.form.negative': 'Negative Prompt (Optional)',
            'prompts.form.negative_placeholder': 'Elements to avoid in your generation...',
            'prompts.form.category': 'Category',
            'prompts.form.tags': 'Tags',
            'prompts.form.add_tag': 'Add tag',
            'prompts.form.add': 'Add',
            'prompts.form.notes': 'Notes (Optional)',
            'prompts.form.notes_placeholder': 'Add any notes about this prompt...',
            'prompts.form.public': 'Share with community',
            'prompts.details.prompt': 'Prompt',
            'prompts.details.negative': 'Negative Prompt',
            'prompts.details.tags': 'Tags',
            'prompts.details.category': 'Category',
            'prompts.details.created': 'Created',
            'prompts.details.updated': 'Updated',
            'prompts.validation_error': 'Please fill in all required fields',
            'prompts.save_error': 'Error saving prompt. Please try again.',
            'prompts.update_success': 'Prompt updated successfully!',
            'prompts.create_success': 'Prompt created successfully!',
            'prompts.load_more': 'Load More',
            'prompts.loading_more': 'Loading...',
            'prompts.no_results.title': 'No prompts found',
            'prompts.no_results.description': 'Try changing your search or filters',
            'prompts.shared_publicly': 'This prompt is shared publicly',
            'prompts.details.parameters': 'Parameters',
            'prompts.template.use': 'Use Template',
            'prompts.favorite': 'Favorite',
            'prompts.unfavorite': 'Unfavorite',
            // Новые переводы для коллекций
            'prompts.collections.title': 'Collections',
            'prompts.collections.new': 'New Collection',
            'prompts.collections.create': 'Create Collection',
            'prompts.collections.edit': 'Edit Collection',
            'prompts.collections.delete': 'Delete Collection',
            'prompts.collections.name': 'Collection Name',
            'prompts.collections.description': 'Description',
            'prompts.collections.public': 'Public Collection',
            'prompts.collections.add_to': 'Add to Collection',
            'prompts.collections.remove_from': 'Remove from Collection',
            'prompts.collections.select': 'Select Collection',
            'prompts.collections.empty': 'No collections found',
            'prompts.collections.create_first': 'Create your first collection',
            'prompts.added_to_collection': 'Added to collection successfully',
            'prompts.removed_from_collection': 'Removed from collection successfully',
            'prompts.collection_created': 'Collection created successfully',
            'prompts.collection_error': 'Error with collection operation',
            // Новые переводы для комментариев и рейтингов
            'prompts.comments.title': 'Comments',
            'prompts.comments.add': 'Add Comment',
            'prompts.comments.placeholder': 'Write your comment here...',
            'prompts.comments.empty': 'No comments yet',
            'prompts.comments.be_first': 'Be the first to comment',
            'prompts.rating.title': 'Rating',
            'prompts.rating.your': 'Your Rating',
            'prompts.rating.average': 'Average Rating',
            'prompts.rating.success': 'Rating submitted successfully',
            'prompts.rating.error': 'Error submitting rating',
            'prompts.comment_added': 'Comment added successfully',
            'prompts.comment_error': 'Error adding comment',
            // Новые переводы для тегов
            'prompts.tags.selected': 'Selected Tags',
            'prompts.tags.clear': 'Clear Tags',
            'prompts.tags.filter': 'Filter by Tags',
            'prompts.tags.add_new': 'Add New Tag',
            'prompts.tags.popular': 'Popular Tags',
            'prompts.tags.custom': 'Custom Tags',
            'prompts.tags.search': 'Search Tags',
            // Новые переводы для массового редактирования
            'prompts.bulk.title': 'Bulk Edit',
            'prompts.bulk.select_all': 'Select All',
            'prompts.bulk.deselect_all': 'Deselect All',
            'prompts.bulk.selected': 'Selected',
            'prompts.bulk.add_to_collection': 'Add to Collection',
            'prompts.bulk.delete': 'Delete Selected',
            'prompts.bulk.share': 'Share Selected',
            'prompts.bulk.make_private': 'Make Selected Private',
            'prompts.bulk.change_category': 'Change Category',
            'prompts.bulk.add_tags': 'Add Tags',
            'prompts.bulk.remove_tags': 'Remove Tags',
            'prompts.bulk.confirm': 'Confirm',
            'prompts.bulk.cancel': 'Cancel',
            'prompts.bulk.success': 'Bulk operation completed successfully',
            'prompts.bulk.error': 'Error during bulk operation'
        },
        ru: {
            'prompts.favorite': 'В избранное',
            'prompts.unfavorite': 'Из избранного',
            'prompts.title': 'Библиотека промптов',
            'prompts.subtitle': 'Управляйте, организуйте и делитесь вашими промптами для генерации изображений',
            'prompts.search': 'Поиск промптов...',
            'prompts.category': 'Категория',
            'prompts.new_prompt': 'Новый промпт',
            'prompts.categories.all': 'Все промпты',
            'prompts.categories.title': 'Категории',
            'prompts.tags.title': 'Популярные теги',
            'prompts.templates.title': 'Шаблоны промптов',
            'prompts.tips.title': 'Советы по созданию промптов',
            'prompts.tips.description': 'Будьте конкретны в деталях, освещении, ракурсах и стилях. Включайте ключевые слова вроде "высокое разрешение" и "детализированный".',
            'prompts.tips.learn_more': 'Подробнее',
            'prompts.my_prompts': 'Мои промпты',
            'prompts.community': 'Сообщество',
            'prompts.favorites_only': 'Только избранное',
            'prompts.sort': 'Сортировка',
            'prompts.sort_by': 'Сортировать по',
            'prompts.sort_direction': 'Направление',
            'prompts.ascending': 'По возрастанию',
            'prompts.descending': 'По убыванию',
            'prompts.no_prompts': 'Промпты не найдены',
            'prompts.try_changing': 'Измените параметры поиска или фильтры',
            'prompts.clear_filters': 'Сбросить фильтры',
            'prompts.create_prompt': 'Создать промпт',
            'prompts.edit_prompt': 'Редактировать промпт',
            'prompts.save_changes': 'Сохранить изменения',
            'prompts.save_prompt': 'Сохранить промпт',
            'prompts.cancel': 'Отмена',
            'prompts.delete': 'Удалить',
            'prompts.use_prompt': 'Использовать промпт',
            'prompts.copy': 'Копировать',
            'prompts.copy_prompt': 'Копировать промпт',
            'prompts.edit': 'Редактировать',
            'prompts.share': 'Опубликовать',
            'prompts.make_private': 'Сделать приватным',
            'prompts.details': 'Детали промпта',
            'prompts.form.title': 'Заголовок',
            'prompts.form.title_placeholder': 'Дайте вашему промпту описательное название',
            'prompts.form.text': 'Текст промпта',
            'prompts.form.text_placeholder': 'Введите ваш детальный промпт здесь...',
            'prompts.form.negative': 'Негативный промпт (Опционально)',
            'prompts.form.negative_placeholder': 'Элементы, которых следует избегать...',
            'prompts.form.category': 'Категория',
            'prompts.form.tags': 'Теги',
            'prompts.form.add_tag': 'Добавить тег',
            'prompts.form.add': 'Добавить',
            'prompts.form.notes': 'Заметки (Опционально)',
            'prompts.form.notes_placeholder': 'Добавьте любые заметки об этом промпте...',
            'prompts.form.public': 'Поделиться с сообществом',
            'prompts.details.prompt': 'Промпт',
            'prompts.details.negative': 'Негативный промпт',
            'prompts.details.tags': 'Теги',
            'prompts.details.category': 'Категория',
            'prompts.details.created': 'Создан',
            'prompts.details.updated': 'Обновлен',
            'prompts.details.parameters': 'Параметры',
            'prompts.template.use': 'Использовать шаблон',
            'prompts.no_results.title': 'Промпты не найдены',
            'prompts.no_results.description': 'Попробуйте изменить поисковый запрос или фильтры',
            'prompts.validation_error': 'Пожалуйста, заполните все обязательные поля',
            'prompts.save_error': 'Ошибка при сохранении промпта. Пожалуйста, попробуйте снова.',
            'prompts.update_success': 'Промпт успешно обновлен!',
            'prompts.create_success': 'Промпт успешно создан!',
            'prompts.load_more': 'Загрузить еще',
            'prompts.loading_more': 'Загрузка...',
            'prompts.shared_publicly': 'Этот промпт опубликован публично',
            // Новые переводы для коллекций
            'prompts.collections.title': 'Коллекции',
            'prompts.collections.new': 'Новая коллекция',
            'prompts.collections.create': 'Создать коллекцию',
            'prompts.collections.edit': 'Редактировать коллекцию',
            'prompts.collections.delete': 'Удалить коллекцию',
            'prompts.collections.name': 'Название коллекции',
            'prompts.collections.description': 'Описание',
            'prompts.collections.public': 'Публичная коллекция',
            'prompts.collections.add_to': 'Добавить в коллекцию',
            'prompts.collections.remove_from': 'Удалить из коллекции',
            'prompts.collections.select': 'Выбрать коллекцию',
            'prompts.collections.empty': 'Коллекции не найдены',
            'prompts.collections.create_first': 'Создайте вашу первую коллекцию',
            'prompts.added_to_collection': 'Успешно добавлено в коллекцию',
            'prompts.removed_from_collection': 'Успешно удалено из коллекции',
            'prompts.collection_created': 'Коллекция успешно создана',
            'prompts.collection_error': 'Ошибка при работе с коллекцией',
            // Новые переводы для комментариев и рейтингов
            'prompts.comments.title': 'Комментарии',
            'prompts.comments.add': 'Добавить комментарий',
            'prompts.comments.placeholder': 'Напишите ваш комментарий здесь...',
            'prompts.comments.empty': 'Комментариев пока нет',
            'prompts.comments.be_first': 'Будьте первым, кто оставит комментарий',
            'prompts.rating.title': 'Рейтинг',
            'prompts.rating.your': 'Ваша оценка',
            'prompts.rating.average': 'Средняя оценка',
            'prompts.rating.success': 'Оценка успешно отправлена',
            'prompts.rating.error': 'Ошибка при отправке оценки',
            'prompts.comment_added': 'Комментарий успешно добавлен',
            'prompts.comment_error': 'Ошибка при добавлении комментария',
            // Новые переводы для тегов
            'prompts.tags.selected': 'Выбранные теги',
            'prompts.tags.clear': 'Очистить теги',
            'prompts.tags.filter': 'Фильтровать по тегам',
            'prompts.tags.add_new': 'Добавить новый тег',
            'prompts.tags.popular': 'Популярные теги',
            'prompts.tags.custom': 'Пользовательские теги',
            'prompts.tags.search': 'Поиск тегов',
            // Новые переводы для массового редактирования
            'prompts.bulk.title': 'Массовое редактирование',
            'prompts.bulk.select_all': 'Выбрать все',
            'prompts.bulk.deselect_all': 'Снять выбор',
            'prompts.bulk.selected': 'Выбрано',
            'prompts.bulk.add_to_collection': 'Добавить в коллекцию',
            'prompts.bulk.delete': 'Удалить выбранные',
            'prompts.bulk.share': 'Опубликовать выбранные',
            'prompts.bulk.make_private': 'Сделать выбранные приватными',
            'prompts.bulk.change_category': 'Изменить категорию',
            'prompts.bulk.add_tags': 'Добавить теги',
            'prompts.bulk.remove_tags': 'Удалить теги',
            'prompts.bulk.confirm': 'Подтвердить',
            'prompts.bulk.cancel': 'Отмена',
            'prompts.bulk.success': 'Массовая операция успешно завершена',
            'prompts.bulk.error': 'Ошибка при выполнении массовой операции'
        }
    };

    const { localT } = useLocalTranslation(pageTranslations);

    useScrollLock(promptDialogOpen);
    useScrollLock(createPromptOpen);

    const [formState, setFormState] = useState({
        title: "",
        text: "",
        category: "",
        tags: [] as string[],
        negative: "",
        notes: "",
        isPublic: false
    });

    const [tagInput, setTagInput] = useState("");

    // Store references for DOM elements
    const tagInputRef = useRef<HTMLInputElement>(null);

    // Состояния для категорий и тегов
    const [categories, setCategories] = useState<Category[]>([
        { id: "all", name: localT('prompts.categories.all'), count: 0 }
    ]);
    
    const [tags, setTags] = useState<Tag[]>([]);
    
    // Загрузка данных при монтировании компонента
    useEffect(() => {
        if (userId) {
            loadPrompts();
            loadCategories();
            loadTags();
            loadCollections();
        }
    }, [userId]);
    
    // Загрузка коллекций пользователя
    const loadCollections = async () => {
        if (!userId) return;
        
        try {
            const collectionsData = await getUserCollections(Number(userId));
            setCollections(collectionsData);
        } catch (error) {
            console.error('Ошибка при загрузке коллекций:', error);
        }
    };
    
    // Загрузка промптов с учетом фильтров
    const loadPrompts = async () => {
        if (!userId) return;
        
        setIsLoading(true);
        try {
            const filters: PromptFilters = {
                userId: Number(userId),
                category: activeCategory !== 'all' ? activeCategory : undefined,
                search: searchQuery || undefined,
                sortBy: sortBy,
                sortDirection: sortDirection,
                limit: pagination.limit,
                offset: pagination.offset,
                favorites: showOnlyFavorites,
                tab: activeTab as 'my-prompts' | 'community',
                tags: selectedTags.length > 0 ? selectedTags : undefined,
                collectionId: activeCollection || undefined
            };
            
            const response = await getPrompts(filters);
            setPrompts(response.prompts);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Ошибка при загрузке промптов:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Загрузка категорий
    const loadCategories = async () => {
        try {
            const categoriesData = await getPromptCategories();
            // Не добавляем дополнительную категорию "Все промпты", так как она уже добавлена в API
            setCategories(categoriesData.map(cat => {
                // Заменяем имя категории "Все промпты" на локализованное
                if (cat.id === "all") {
                    return { ...cat, name: localT('prompts.categories.all') };
                }
                return cat;
            }));
        } catch (error) {
            console.error('Ошибка при загрузке категорий:', error);
        }
    };
    
    // Загрузка тегов
    const loadTags = async () => {
        try {
            const tagsData = await getPopularTags();
            setTags(tagsData);
        } catch (error) {
            console.error('Ошибка при загрузке тегов:', error);
        }
    };

    // Обновление фильтров и загрузка промптов при изменении параметров
    useEffect(() => {
        if (userId) {
            // Сбрасываем пагинацию при изменении фильтров
            setPagination(prev => ({ ...prev, offset: 0 }));
            loadPrompts();
        }
    }, [activeCategory, searchQuery, sortBy, sortDirection, showOnlyFavorites, activeTab, selectedTags, activeCollection, userId]);
    
    // Функция для добавления промпта в коллекцию
    const handleAddToCollection = async (promptId: string, collectionId: string) => {
        if (!userId || !promptId || !collectionId) return;
        
        try {
            await addPromptToCollection(collectionId, promptId, Number(userId));
            setFormSuccess(localT('prompts.added_to_collection'));
            
            // Обновляем список коллекций
            loadCollections();
            
            // Если промпт выбран, обновляем его данные
            if (selectedPrompt && selectedPrompt.id === promptId) {
                const updatedPrompt = { ...selectedPrompt };
                if (!updatedPrompt.collections) {
                    updatedPrompt.collections = [];
                }
                if (!updatedPrompt.collections.includes(collectionId)) {
                    updatedPrompt.collections.push(collectionId);
                }
                setSelectedPrompt(updatedPrompt);
            }
            
            // Сбрасываем сообщение об успехе через 3 секунды
            setTimeout(() => setFormSuccess(null), 3000);
        } catch (error) {
            console.error('Ошибка при добавлении промпта в коллекцию:', error);
            setFormError(localT('prompts.collection_error'));
            setTimeout(() => setFormError(null), 3000);
        }
    };
    
    // Функция для удаления промпта из коллекции
    const handleRemoveFromCollection = async (promptId: string, collectionId: string) => {
        if (!userId || !promptId || !collectionId) return;
        
        try {
            await removePromptFromCollection(collectionId, promptId, Number(userId));
            setFormSuccess(localT('prompts.removed_from_collection'));
            
            // Обновляем список коллекций
            loadCollections();
            
            // Если промпт выбран, обновляем его данные
            if (selectedPrompt && selectedPrompt.id === promptId) {
                const updatedPrompt = { ...selectedPrompt };
                if (updatedPrompt.collections) {
                    updatedPrompt.collections = updatedPrompt.collections.filter(id => id !== collectionId);
                }
                setSelectedPrompt(updatedPrompt);
            }
            
            // Сбрасываем сообщение об успехе через 3 секунды
            setTimeout(() => setFormSuccess(null), 3000);
        } catch (error) {
            console.error('Ошибка при удалении промпта из коллекции:', error);
            setFormError(localT('prompts.collection_error'));
            setTimeout(() => setFormError(null), 3000);
        }
    };
    
    // Функция для создания новой коллекции
    const handleCreateCollection = async (name: string, description?: string, isPublic: boolean = false) => {
        if (!userId || !name.trim()) return;
        
        try {
            const newCollection = await createCollection({
                userId: Number(userId),
                name: name.trim(),
                description: description?.trim(),
                isPublic
            });
            
            setCollections([...collections, newCollection]);
            setFormSuccess(localT('prompts.collection_created'));
            setCollectionDialogOpen(false);
            
            // Сбрасываем сообщение об успехе через 3 секунды
            setTimeout(() => setFormSuccess(null), 3000);
        } catch (error) {
            console.error('Ошибка при создании коллекции:', error);
            setFormError(localT('prompts.collection_error'));
            setTimeout(() => setFormError(null), 3000);
        }
    };
    
    // Функция для оценки промпта
    const handleRatePrompt = async (promptId: string, rating: number) => {
        if (!userId || !promptId) return;
        
        try {
            const result = await ratePrompt(promptId, Number(userId), rating);
            
            // Обновляем рейтинг промпта в списке
            const updatedPrompts = prompts.map(prompt => {
                if (prompt.id === promptId) {
                    return { ...prompt, rating: result.newRating, userRating: rating };
                }
                return prompt;
            });
            
            setPrompts(updatedPrompts);
            
            // Если промпт выбран, обновляем его данные
            if (selectedPrompt && selectedPrompt.id === promptId) {
                setSelectedPrompt({ ...selectedPrompt, rating: result.newRating, userRating: rating });
            }
            
            setUserRating(rating);
            setFormSuccess(localT('prompts.rating_success'));
            
            // Сбрасываем сообщение об успехе через 3 секунды
            setTimeout(() => setFormSuccess(null), 3000);
        } catch (error) {
            console.error('Ошибка при оценке промпта:', error);
            setFormError(localT('prompts.rating_error'));
            setTimeout(() => setFormError(null), 3000);
        }
    };
    
    // Функция для добавления комментария
    const handleAddComment = async (promptId: string, text: string, rating?: number) => {
        if (!userId || !promptId || !text.trim()) return;
        
        try {
            const newComment = await addComment(promptId, Number(userId), text.trim(), rating);
            
            // Если промпт выбран, обновляем его комментарии
            if (selectedPrompt && selectedPrompt.id === promptId) {
                const updatedPrompt = { ...selectedPrompt };
                if (!updatedPrompt.comments) {
                    updatedPrompt.comments = [];
                }
                updatedPrompt.comments.push(newComment);
                setSelectedPrompt(updatedPrompt);
            }
            
            setCommentInput("");
            setFormSuccess(localT('prompts.comment_added'));
            
            // Сбрасываем сообщение об успехе через 3 секунды
            setTimeout(() => setFormSuccess(null), 3000);
        } catch (error) {
            console.error('Ошибка при добавлении комментария:', error);
            setFormError(localT('prompts.comment_error'));
            setTimeout(() => setFormError(null), 3000);
        }
    };
    
    // Функция для загрузки комментариев к промпту
    const loadPromptComments = async (promptId: string) => {
        if (!promptId) return;
        
        try {
            const comments = await getPromptComments(promptId);
            
            // Если промпт выбран, обновляем его комментарии
            if (selectedPrompt && selectedPrompt.id === promptId) {
                setSelectedPrompt({ ...selectedPrompt, comments });
            }
        } catch (error) {
            console.error('Ошибка при загрузке комментариев:', error);
        }
    };
    
    // Функция для переключения тега в фильтрации
    const toggleTagFilter = (tagId: string) => {
        if (selectedTags.includes(tagId)) {
            setSelectedTags(selectedTags.filter(id => id !== tagId));
        } else {
            setSelectedTags([...selectedTags, tagId]);
        }
    };
    
    // Функция для выбора коллекции
    const handleCollectionSelect = (collectionId: string | null) => {
        setActiveCollection(collectionId);
        // При выборе коллекции сбрасываем категорию на "все"
        if (collectionId) {
            setActiveCategory("all");
        }
    };
    
    // Установка отфильтрованных промптов
    useEffect(() => {
        // Фильтрация по выбранным тегам и активной коллекции
        let filtered = prompts;
        
        // Фильтрация по тегам
        if (selectedTags.length > 0) {
            filtered = filtered.filter(prompt => 
                selectedTags.every(tagId => prompt.tags.includes(tagId))
            );
        }
        
        // Фильтрация по коллекции
        if (activeCollection) {
            const collection = collections.find(c => c.id === activeCollection);
            if (collection && collection.promptIds) {
                filtered = filtered.filter(prompt => collection.promptIds.includes(prompt.id));
            }
        }
        
        setFilteredPrompts(filtered);
    }, [prompts, selectedTags, activeCollection, collections]);
    
    // Компонент для отображения тегов с возможностью фильтрации
    const TagsFilter = () => {
        return (
            <Card className="mb-4">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{localT('prompts.tags.filter')}</CardTitle>
                        {selectedTags.length > 0 && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setSelectedTags([])}
                                className="h-8 px-2"
                            >
                                <X className="h-4 w-4 mr-1" />
                                {localT('prompts.tags.clear')}
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {selectedTags.length > 0 && (
                        <div className="mb-3">
                            <p className="text-sm text-muted-foreground mb-2">{localT('prompts.tags.selected')}:</p>
                            <div className="flex flex-wrap gap-1">
                                {selectedTags.map(tagId => {
                                    const tag = tags.find(t => t.id === tagId);
                                    return (
                                        <Badge 
                                            key={tagId} 
                                            variant="secondary"
                                            className="cursor-pointer"
                                            onClick={() => toggleTagFilter(tagId)}
                                        >
                                            {tag?.name || tagId}
                                            <X className="h-3 w-3 ml-1" />
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    <ScrollArea className="max-h-[200px]">
                        <div className="flex flex-wrap gap-1">
                            {tags.map(tag => (
                                <Badge 
                                    key={tag.id} 
                                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => toggleTagFilter(tag.id)}
                                >
                                    {tag.name}
                                    <span className="ml-1 text-xs opacity-70">({tag.count})</span>
                                </Badge>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        );
    };
    
    // Компонент для отображения коллекций
    const CollectionsSelector = ({ promptId }: { promptId: string }) => {
        const prompt = prompts.find(p => p.id === promptId);
        const promptCollections = prompt?.collections || [];
        
        return (
            <Card className="mb-4">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{localT('prompts.collections.title')}</CardTitle>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setCollectionDialogOpen(true)}
                            className="h-8 px-2"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            {localT('prompts.collections.new')}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {collections.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-muted-foreground mb-2">{localT('prompts.collections.empty')}</p>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setCollectionDialogOpen(true)}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                {localT('prompts.collections.create_first')}
                            </Button>
                        </div>
                    ) : (
                        <ScrollArea className="max-h-[200px]">
                            <div className="space-y-1">
                                {collections.map(collection => {
                                    const isInCollection = promptCollections.includes(collection.id);
                                    return (
                                        <div key={collection.id} className="flex items-center justify-between py-1">
                                            <span className="text-sm truncate">{collection.name}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => isInCollection 
                                                    ? handleRemoveFromCollection(promptId, collection.id)
                                                    : handleAddToCollection(promptId, collection.id)
                                                }
                                                className="h-7 px-2"
                                            >
                                                {isInCollection ? (
                                                    <>
                                                        <X className="h-3.5 w-3.5 mr-1" />
                                                        {localT('prompts.collections.remove_from')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="h-3.5 w-3.5 mr-1" />
                                                        {localT('prompts.collections.add_to')}
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        );
    };
    
    // Компонент для отображения комментариев
    const CommentsSection = ({ promptId }: { promptId: string }) => {
        const prompt = prompts.find(p => p.id === promptId);
        const comments = prompt?.comments || [];
        
        // Загружаем комментарии при открытии секции
        useEffect(() => {
            if (promptId) {
                loadPromptComments(promptId);
            }
        }, [promptId]);
        
        return (
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle className="text-lg">{localT('prompts.comments.title')}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    {comments.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-muted-foreground mb-2">{localT('prompts.comments.empty')}</p>
                            <p className="text-sm text-muted-foreground">{localT('prompts.comments.be_first')}</p>
                        </div>
                    ) : (
                        <ScrollArea className="max-h-[300px]">
                            <div className="space-y-4">
                                {comments.map(comment => (
                                    <div key={comment.id} className="border-b border-border/50 pb-3 last:border-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="font-medium">{comment.username}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        {comment.rating && (
                                            <div className="flex items-center mb-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        className={`h-3.5 w-3.5 ${i < comment.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} 
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        <p className="text-sm">{comment.text}</p>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                    
                    <div className="mt-4 pt-3 border-t border-border/50">
                        <Textarea
                            placeholder={localT('prompts.comments.placeholder')}
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            className="mb-2"
                        />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star 
                                        key={i} 
                                        className={`h-5 w-5 cursor-pointer ${i < (userRating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} 
                                        onClick={() => setUserRating(i + 1)}
                                    />
                                ))}
                                {userRating && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setUserRating(null)}
                                        className="h-7 px-2 ml-2"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                            <Button 
                                disabled={!commentInput.trim()}
                                onClick={() => handleAddComment(promptId, commentInput, userRating || undefined)}
                            >
                                {localT('prompts.comments.add')}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };
    
    // Компонент для создания коллекции
    const CollectionDialog = () => {
        const [name, setName] = useState("");
        const [description, setDescription] = useState("");
        const [isPublic, setIsPublic] = useState(false);
        
        const handleSubmit = () => {
            if (name.trim()) {
                handleCreateCollection(name, description, isPublic);
            }
        };
        
        return (
            <Dialog open={collectionDialogOpen} onOpenChange={setCollectionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{localT('prompts.collections.create')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="collection-name">{localT('prompts.collections.name')}</Label>
                            <Input 
                                id="collection-name" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                placeholder={localT('prompts.collections.name')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="collection-description">{localT('prompts.collections.description')}</Label>
                            <Textarea 
                                id="collection-description" 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                placeholder={localT('prompts.collections.description')}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch 
                                id="collection-public" 
                                checked={isPublic} 
                                onCheckedChange={setIsPublic} 
                            />
                            <Label htmlFor="collection-public">{localT('prompts.collections.public')}</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCollectionDialogOpen(false)}>
                            {localT('prompts.cancel')}
                        </Button>
                        <Button onClick={handleSubmit} disabled={!name.trim()}>
                            {localT('prompts.collections.create')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };
    

    const promptTemplates = [
        {
            title: "Character Portrait",
            text: "[gender] with [hair color] hair and [eye color] eyes, [clothing], [expression], photorealistic, detailed features, professional photography, 8k",
            category: "portraits",
            description: "A template for creating portrait images of characters"
        },
        {
            title: "Fantasy Landscape",
            text: "A [adjective] fantasy landscape with [feature], [time of day] atmosphere, [weather condition], [style] style, detailed, 8k",
            category: "landscapes",
            description: "Create magical and fantastical landscape scenes"
        },
        {
            title: "Sci-Fi Environment",
            text: "A [adjective] sci-fi [environment type], futuristic technology, [lighting condition], highly detailed, [perspective], cinematic, 8k",
            category: "scifi",
            description: "Generate futuristic sci-fi environments"
        }
    ];

    // Обработчик изменения фильтров
    const handleFilterChange = (type: string, value: any) => {
        switch (type) {
            case 'category':
                setActiveCategory(value);
                break;
            case 'search':
                setSearchQuery(value);
                break;
            case 'sort':
                setSortBy(value);
                break;
            case 'direction':
                setSortDirection(value as 'asc' | 'desc');
                break;
            case 'favorites':
                setShowOnlyFavorites(value);
                break;
            case 'tab':
                setActiveTab(value);
                break;
            default:
                break;
        }
    };    

    const handleSelectPrompt = (prompt: Prompt) => {
        setSelectedPrompt(prompt);
        setPromptDialogOpen(true);
        setEditMode(false);
    };

    const handleToggleFavorite = async (e: React.MouseEvent, promptId: string) => {
        e.stopPropagation();
        if (!userId) return;
        
        try {
            const result = await toggleFavoritePrompt(promptId, userId);
            setPrompts(prev =>
                prev.map(p => p.id === promptId ? { ...p, favorite: result.favorite } : p)
            );
        } catch (error) {
            console.error('Ошибка при изменении статуса избранного:', error);
        }
    };

    const toggleFavorite = async (promptId: string) => {
        if (!userId) return;
        
        try {
            const result = await toggleFavoritePrompt(promptId, userId);
            setPrompts(prev =>
                prev.map(p => p.id === promptId ? { ...p, favorite: result.favorite } : p)
            );
        } catch (error) {
            console.error('Ошибка при изменении статуса избранного:', error);
        }
    };

    const handleDeletePrompt = async (promptId: string) => {
        if (!userId) return;
        
        try {
            await deletePrompt(promptId, userId);
            setPrompts(prev => prev.filter(p => p.id !== promptId));
            setPromptDialogOpen(false);
        } catch (error) {
            console.error('Ошибка при удалении промпта:', error);
        }
    };

    const handleCopyPrompt = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formState.tags.includes(tagInput.trim())) {
            setFormState(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput("");
            tagInputRef.current?.focus();
        }
    };

    // Handle tag removal in form
    const handleRemoveTag = (tag: string) => {
        setFormState(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };

    // Reset form for new prompt
    const resetForm = () => {
        setFormState({
            title: "",
            text: "",
            category: "",
            tags: [],
            negative: "",
            notes: "",
            isPublic: false
        });
        setTagInput("");
        setEditMode(false);
    };

    // Start editing prompt
    const startEditPrompt = () => {
        if (selectedPrompt) {
            setFormState({
                title: selectedPrompt.title,
                text: selectedPrompt.text,
                category: selectedPrompt.category,
                tags: [...selectedPrompt.tags],
                negative: selectedPrompt.negative || "",
                notes: selectedPrompt.notes || "",
                isPublic: selectedPrompt.isPublic
            });
            setEditMode(true);
        }
    };

    // Save prompt (new or edited)
    const handleSavePrompt = async () => {
        setFormError(null);
        setFormSuccess(null);
        
        if (formState.title.trim() === "" || formState.text.trim() === "" || !userId) {
            setFormError(localT('prompts.validation_error'));
            return;
        }

        try {
            if (editMode && selectedPrompt) {
                // Update existing prompt
                const updatedPrompt = await updatePrompt({
                    promptId: selectedPrompt.id,
                    userId: Number(userId),
                    title: formState.title,
                    text: formState.text,
                    category: formState.category,
                    tags: formState.tags,
                    negative: formState.negative,
                    notes: formState.notes,
                    isPublic: formState.isPublic,
                    parameters: selectedPrompt.parameters
                });
                
                setPrompts(prev =>
                    prev.map(p => p.id === selectedPrompt.id ? updatedPrompt : p)
                );
                setFormSuccess(localT('prompts.update_success'));
                
                // Закрываем диалог редактирования через небольшую задержку
                setTimeout(() => {
                    resetForm();
                    setPromptDialogOpen(false);
                    setCreatePromptOpen(false);
                }, 1500);
            } else {
                // Create new prompt
                const newPrompt = await createPrompt({
                    userId: Number(userId),
                    title: formState.title,
                    text: formState.text,
                    category: formState.category,
                    tags: formState.tags,
                    negative: formState.negative,
                    notes: formState.notes,
                    isPublic: formState.isPublic
                });
                
                setPrompts(prev => [newPrompt, ...prev]);
                setFormSuccess(localT('prompts.create_success'));
                
                // Закрываем диалог создания через небольшую задержку
                setTimeout(() => {
                    resetForm();
                    setCreatePromptOpen(false);
                }, 1500);
            }
        } catch (error) {
            console.error('Ошибка при сохранении промпта:', error);
            setFormError(localT('prompts.save_error'));
        }
    };
    
    // Рендеринг списка промптов
    const renderPromptsList = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Card key={index} className="overflow-hidden animate-pulse">
                            <CardHeader className="pb-2">
                                <div className="h-6 bg-muted rounded w-3/4"></div>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="h-20 bg-muted rounded w-full mb-2"></div>
                                <div className="flex gap-2">
                                    <div className="h-5 bg-muted rounded w-16"></div>
                                    <div className="h-5 bg-muted rounded w-16"></div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <div className="h-4 bg-muted rounded w-24"></div>
                                <div className="h-8 bg-muted rounded w-8"></div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            );
        }
        
        if (filteredPrompts.length === 0) {
            return (
                <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">{localT('prompts.no_results.title')}</h3>
                    <p className="text-muted-foreground mb-6">{localT('prompts.no_results.description')}</p>
                    <Button variant="outline" onClick={() => {
                        setSearchQuery("");
                        setActiveCategory("all");
                        setShowOnlyFavorites(false);
                    }}>
                        {localT('prompts.clear_filters')}
                    </Button>
                </div>
            );
        }
        
        return (
            <InfiniteScroll
                loadMore={loadMorePrompts}
                hasMore={pagination.hasMore}
                isLoading={isLoadingMore}
                loadingText={localT('prompts.loading_more')}
                endMessage={localT('prompts.no_prompts')}
                className="w-full"
            >
                <div className={cn(
                    viewMode === "grid" 
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                        : "flex flex-col space-y-4"
                )}>
                    {filteredPrompts.map((prompt) => (
                        <AnimatedCard key={prompt.id} className="overflow-hidden group cursor-pointer" onClick={() => handleSelectPrompt(prompt)}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{prompt.title}</CardTitle>
                                    <p className="text-sm text-muted-foreground">Автор: {prompt.author}</p>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                        onClick={(e) => handleToggleFavorite(e, prompt.id)}
                                    >
                                        {prompt.favorite ? (
                                            <Star className="h-5 w-5 fill-primary text-primary" />
                                        ) : (
                                            <Star className="h-5 w-5" />
                                        )}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <p className="text-sm text-muted-foreground line-clamp-3">{prompt.text}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {prompt.tags.slice(0, 3).map((tag, index) => (
                                        <AnimatedBadge key={index} className="text-xs">
                                            {tag}
                                        </AnimatedBadge>
                                    ))}
                                    {prompt.tags.length > 3 && (
                                        <Badge variant="outline" className="text-xs">+{prompt.tags.length - 3}</Badge>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between pt-2">
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {prompt.category}
                                </div>
                                <div className="flex items-center gap-2">
                                    {prompt.isPublic && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="text-xs flex items-center text-muted-foreground">
                                                        <Share2 className="h-3 w-3 mr-1" />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{localT('prompts.shared_publicly')}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                    <div className="text-xs flex items-center text-muted-foreground">
                                        <MessageSquare className="h-3 w-3 mr-1" />
                                        {prompt.usageCount}
                                    </div>
                                </div>
                            </CardFooter>
                        </AnimatedCard>
                    ))}
                </div>
                
            </InfiniteScroll>
        );
    };
    

    // Format date for display
    const formatDate = (dateString?: string) => {
    if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    // Get active prompt list based on tab
    const getActivePromptList = () => {
        return filteredPrompts;
    };
    
    // Загрузка следующей страницы промптов
    const handleLoadMorePrompts = async () => {
        if (pagination.hasMore && !isLoadingMore) {
            setIsLoadingMore(true);
            try {
                const newOffset = pagination.offset + pagination.limit;
                const filters: PromptFilters = {
                    userId: Number(userId),
                    category: activeCategory !== 'all' ? activeCategory : undefined,
                    search: searchQuery || undefined,
                    sortBy: sortBy,
                    sortDirection: sortDirection,
                    limit: pagination.limit,
                    offset: newOffset,
                    favorites: showOnlyFavorites,
                    tab: activeTab as 'my-prompts' | 'community'
                };
                
                const response = await getPrompts(filters);
                setPrompts(prev => [...prev, ...response.prompts]);
                setPagination(response.pagination);
            } catch (error) {
                console.error('Ошибка при загрузке дополнительных промптов:', error);
            } finally {
                setIsLoadingMore(false);
            }
        }
    };

    const renderStarRating = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
    
        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={`full-${i}`} className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />);
        }
    
        if (hasHalfStar) {
            stars.push(<StarHalf key="half" className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />);
        }
    
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-${i}`} className="h-3.5 w-3.5 text-muted-foreground" />);
        }
        
        return <div className="flex">{stars}</div>;
    }; 

    return (
        <><div className="container relative mx-auto py-8">
            <EnhancedParticlesBackground variant="bubbles" density={50} />
            <EnhancedParticlesBackground variant="bubbles" density={50} />

            <div className="mb-8 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <BookOpen className="h-8 w-8 text-primary" />
                            {localT('prompts.title')}
                        </h1>
                        <p className="text-muted-foreground">{localT('prompts.subtitle')}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex-1 md:flex-none">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={localT('prompts.search')}
                                className="pl-8 w-full md:w-[200px]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <div className="flex border rounded-md overflow-hidden">
                            <Button
                                variant={viewMode === "grid" ? "secondary" : "ghost"}
                                size="icon"
                                className="h-9 w-9 rounded-none"
                                onClick={() => setViewMode("grid")}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect x="3" y="3" width="7" height="7" />
                                    <rect x="14" y="3" width="7" height="7" />
                                    <rect x="3" y="14" width="7" height="7" />
                                    <rect x="14" y="14" width="7" height="7" />
                                </svg>
                            </Button>
                            <Button
                                variant={viewMode === "list" ? "secondary" : "ghost"}
                                size="icon"
                                className="h-9 w-9 rounded-none"
                                onClick={() => setViewMode("list")}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="8" y1="6" x2="21" y2="6" />
                                    <line x1="8" y1="12" x2="21" y2="12" />
                                    <line x1="8" y1="18" x2="21" y2="18" />
                                    <line x1="3" y1="6" x2="3.01" y2="6" />
                                    <line x1="3" y1="12" x2="3.01" y2="12" />
                                    <line x1="3" y1="18" x2="3.01" y2="18" />
                                </svg>
                            </Button>
                        </div>

                        {/* Кнопки для массового редактирования и экспорта/импорта */}
                        <div className="flex items-center gap-2 ml-2">
                            <Button
                                variant={bulkEditMode ? "secondary" : "outline"}
                                size="sm"
                                onClick={toggleBulkEditMode}
                                className="flex items-center gap-1"
                            >
                                <Edit className="h-4 w-4" />
                                {bulkEditMode ? "Отменить" : "Массовое редактирование"}
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <FileText className="h-4 w-4 mr-1" />
                                        Экспорт/Импорт
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={exportPrompts}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Экспортировать промпты
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <label className="flex items-center cursor-pointer w-full">
                                            <Upload className="h-4 w-4 mr-2" />
                                            Импортировать промпты
                                            <input
                                                type="file"
                                                accept=".json"
                                                onChange={importPrompts}
                                                className="hidden" />
                                        </label>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {bulkEditMode && selectedPrompts.length > 0 && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={openBulkEditDialog}
                                    className="flex items-center gap-1"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Редактировать выбранные ({selectedPrompts.length})
                                </Button>
                            )}
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <SparkleButton>
                                    <Plus className="h-4 w-4" />
                                    {localT('prompts.new_prompt')}
                                </SparkleButton>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>{localT('prompts.create_prompt')}</DialogTitle>
                                    <DialogDescription>
                                        {localT('prompts.subtitle')}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">{localT('prompts.form.title')}</Label>
                                        <Input
                                            id="title"
                                            placeholder={localT('prompts.form.title_placeholder')}
                                            value={formState.title}
                                            onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="prompt-text">{localT('prompts.form.text')}</Label>
                                        <Textarea
                                            id="prompt-text"
                                            placeholder={localT('prompts.form.text_placeholder')}
                                            className="min-h-[120px] resize-none"
                                            value={formState.text}
                                            onChange={(e) => setFormState(prev => ({ ...prev, text: e.target.value }))} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="negative-prompt">{localT('prompts.form.negative')}</Label>
                                        <Textarea
                                            id="negative-prompt"
                                            placeholder={localT('prompts.form.negative_placeholder')}
                                            value={formState.negative}
                                            onChange={(e) => setFormState(prev => ({ ...prev, negative: e.target.value }))} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="category">{localT('prompts.form.category')}</Label>
                                            <Select
                                                value={formState.category}
                                                onValueChange={(value) => setFormState(prev => ({ ...prev, category: value }))}
                                            >
                                                <SelectTrigger id="category">
                                                    <SelectValue placeholder={localT('prompts.category')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.filter(c => c.id !== "all").map(category => (
                                                        <SelectItem key={category.id} value={category.id}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="add-tag">{localT('prompts.form.tags')}</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="add-tag"
                                                    ref={tagInputRef}
                                                    placeholder={localT('prompts.form.add_tag')}
                                                    value={tagInput}
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()} />
                                                <Button type="button" size="sm" onClick={handleAddTag}>
                                                    {localT('prompts.form.add')}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    {formState.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {formState.tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                                    {tag}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                                                        onClick={() => handleRemoveTag(tag)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                    <div className="grid gap-2">
                                        <Label htmlFor="notes">{localT('prompts.form.notes')}</Label>
                                        <Textarea
                                            id="notes"
                                            placeholder={localT('prompts.form.notes_placeholder')}
                                            value={formState.notes}
                                            onChange={(e) => setFormState(prev => ({ ...prev, notes: e.target.value }))} />
                                    </div>
                                    <div className="flex items-center space-x-2 pt-2">
                                        <Switch
                                            id="public-prompt"
                                            checked={formState.isPublic}
                                            onCheckedChange={(checked) => setFormState(prev => ({ ...prev, isPublic: checked }))} />
                                        <Label htmlFor="public-prompt">{localT('prompts.form.public')}</Label>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => resetForm()}>{localT('prompts.cancel')}</Button>
                                    <Button onClick={handleSavePrompt}>{localT('prompts.save_prompt')}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">

                <div className="md:col-span-1 space-y-6">
                    <CollapsibleCategories
                        title={localT('prompts.categories.title')}
                        categories={categories.map(category => ({
                            ...category,
                            name: category.id !== "all" ? (
                                <div className="flex items-center">
                                    <div
                                        className="mr-2 h-2 w-2 rounded-full"
                                        style={{ backgroundColor: category.color || "#888" }} />
                                    {category.name}
                                </div>
                            ) : category.name
                        }))}
                        activeCategory={activeCategory}
                        onCategorySelect={setActiveCategory} />
                    <Card>
                        <div className="flex items-center justify-between p-4">
                            <CardTitle className="text-lg">{localT('prompts.tags.title')}</CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setTagsCollapsed(!tagsCollapsed)}
                                className="h-8 w-8 p-0"
                            >
                                {tagsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                            </Button>
                        </div>

                        {!tagsCollapsed && (
                            <CardContent className="pt-0">
                                <div className="flex flex-wrap gap-1">
                                    {tags.map(tag => (
                                        <Badge
                                            key={tag.id}
                                            variant="outline"
                                            className="cursor-pointer hover:bg-secondary"
                                            onClick={() => setSearchQuery(tag.name)}
                                        >
                                            {tag.name} ({tag.count})
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        )}
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">{localT('prompts.templates.title')}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Accordion type="single" collapsible className="w-full">
                                {promptTemplates.map((template, index) => (
                                    <AccordionItem key={index} value={`template-${index}`}>
                                        <AccordionTrigger className="px-4">{template.title}</AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4">
                                            <div className="space-y-2">
                                                <p className="text-sm text-muted-foreground">{template.description}</p>
                                                <div className="rounded-md bg-muted p-2 text-sm">
                                                    <code>{template.text}</code>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => {
                                                        setFormState({
                                                            ...formState,
                                                            title: template.title,
                                                            text: template.text,
                                                            category: template.category
                                                        });
                                                        setPromptDialogOpen(true);
                                                    } }
                                                >
                                                    {localT('prompts.template.use')}
                                                </Button>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                        <CardContent className="p-4">
                            <div className="flex flex-col items-center text-center space-y-2">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <Lightbulb className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-medium">{localT('prompts.tips.title')}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {localT('prompts.tips.description')}
                                </p>
                                <Button variant="link" size="sm">{localT('prompts.tips.learn_more')}</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-3 space-y-6">
                    <Tabs defaultValue="my-prompts" value={activeTab} onValueChange={setActiveTab}>
                        <div className="flex items-center justify-between">
                            <TabsList>
                                <TabsTrigger value="my-prompts">{localT('prompts.my_prompts')}</TabsTrigger>
                                <TabsTrigger value="community">{localT('prompts.community')}</TabsTrigger>
                            </TabsList>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="favorites-only"
                                        checked={showOnlyFavorites}
                                        onCheckedChange={setShowOnlyFavorites} />
                                    <Label htmlFor="favorites-only" className="text-xs">{localT('prompts.favorites_only')}</Label>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-1">
                                            <span>{localT('prompts.sort')}</span>
                                            <ChevronsUpDown className="h-3.5 w-3.5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>{localT('prompts.sort_by')}</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => setSortBy("title")}
                                            className={sortBy === "title" ? "bg-muted" : ""}
                                        >
                                            {localT('prompts.form.title')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setSortBy("createdAt")}
                                            className={sortBy === "createdAt" ? "bg-muted" : ""}
                                        >
                                            {localT('prompts.details.created')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setSortBy("updatedAt")}
                                            className={sortBy === "updatedAt" ? "bg-muted" : ""}
                                        >
                                            {localT('prompts.details.updated')}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}>
                                            {sortDirection === "asc" ? (
                                                <div className="flex items-center">
                                                    <SortAsc className="mr-2 h-4 w-4" />
                                                    {localT('prompts.ascending')}
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <SortDesc className="mr-2 h-4 w-4" />
                                                    {localT('prompts.descending')}
                                                </div>
                                            )}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <TabsContent value="my-prompts" className="mt-6">
                            {renderPromptsList()}
                        </TabsContent>
                        <TabsContent value="community" className="mt-6">
                            {renderPromptsList()}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {selectedPrompt && (
                <Dialog open={promptDialogOpen} onOpenChange={setPromptDialogOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center justify-between">
                                <span>{editMode ? localT('prompts.edit_prompt') : selectedPrompt?.title}</span>
                                {!editMode && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 rounded-full"
                                        onClick={() => startEditPrompt()}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                )}
                            </DialogTitle>
                        </DialogHeader>
                        {editMode ? (
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-title">{localT('prompts.form.title')}</Label>
                                    <Input
                                        id="edit-title"
                                        value={formState.title}
                                        onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-prompt-text">{localT('prompts.form.text')}</Label>
                                    <Textarea
                                        id="edit-prompt-text"
                                        className="min-h-[120px]"
                                        value={formState.text}
                                        onChange={(e) => setFormState(prev => ({ ...prev, text: e.target.value }))} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-negative-prompt">{localT('prompts.form.negative')}</Label>
                                    <Textarea
                                        id="edit-negative-prompt"
                                        value={formState.negative}
                                        onChange={(e) => setFormState(prev => ({ ...prev, negative: e.target.value }))} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-category">{localT('prompts.category')}</Label>
                                        <Select
                                            value={formState.category}
                                            onValueChange={(value) => setFormState(prev => ({ ...prev, category: value }))}
                                        >
                                            <SelectTrigger id="edit-category">
                                                <SelectValue placeholder={localT('prompts.category')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.filter(c => c.id !== "all").map(category => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-add-tag">{localT('prompts.form.tags')}</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="edit-add-tag"
                                                ref={tagInputRef}
                                                placeholder={localT('prompts.form.add_tag')}
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()} />
                                            <Button type="button" size="sm" onClick={handleAddTag}>
                                                {localT('prompts.form.add')}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                {formState.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {formState.tags.map(tag => (
                                            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                                {tag}
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                                                    onClick={() => handleRemoveTag(tag)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-notes">{localT('prompts.form.notes')}</Label>
                                    <Textarea
                                        id="edit-notes"
                                        value={formState.notes}
                                        onChange={(e) => setFormState(prev => ({ ...prev, notes: e.target.value }))} />
                                </div>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Switch
                                        id="edit-public-prompt"
                                        checked={formState.isPublic}
                                        onCheckedChange={(checked) => setFormState(prev => ({ ...prev, isPublic: checked }))} />
                                    <Label htmlFor="edit-public-prompt">{localT('prompts.form.public')}</Label>
                                </div>
                                <DialogFooter className="mt-4">
                                    <Button variant="outline" onClick={() => setEditMode(false)}>{localT('prompts.cancel')}</Button>
                                    <Button onClick={handleSavePrompt}>{localT('prompts.save_changes')}</Button>
                                </DialogFooter>
                            </div>
                        ) : (
                            <div className="py-4">

                                <div className="space-y-4">
                                    <div className="rounded-md border bg-muted/20 p-4">
                                        <ScrollArea className="h-[150px]">
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-xs text-muted-foreground mb-1 block">{localT('prompts.details.prompt')}</Label>
                                                    <p className="text-sm">{selectedPrompt?.text}</p>
                                                </div>
                                                {selectedPrompt?.negative && (
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground mb-1 block">{localT('prompts.details.negative')}</Label>
                                                        <p className="text-sm">{selectedPrompt?.negative}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs text-muted-foreground mb-1 block">{localT('prompts.details.category')}</Label>
                                            <Badge variant="outline">
                                                {categories.find(c => c.id === selectedPrompt?.category)?.name || selectedPrompt?.category || ''}
                                            </Badge>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground mb-1 block">{localT('prompts.details.created')}</Label>
                                            <p className="text-sm">{formatDate(selectedPrompt?.createdAt)}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-xs text-muted-foreground mb-1 block">{localT('prompts.details.tags')}</Label>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedPrompt?.tags?.map(tag => (
                                                <Badge key={tag} variant="secondary" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedPrompt?.notes && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground mb-1 block">{localT('prompts.form.notes')}</Label>
                                            <p className="text-sm bg-muted/20 p-2 rounded">{selectedPrompt?.notes}</p>
                                        </div>
                                    )}

                                    {selectedPrompt?.parameters && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground mb-1 block">{localT('prompts.details.parameters')}</Label>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                {Object.entries(selectedPrompt?.parameters || {}).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between">
                                                        <span className="font-medium">{key}:</span>
                                                        <span>{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center mt-6">
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCopyPrompt(selectedPrompt?.text || '')}
                                        >
                                            <Copy className="mr-2 h-4 w-4" />
                                            {localT('prompts.copy_prompt')}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={cn(
                                                selectedPrompt?.favorite ? "bg-primary/5 border-primary/20" : ""
                                            )}
                                            onClick={() => toggleFavorite(selectedPrompt?.id || '')}
                                        >
                                            <Star
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedPrompt?.favorite ? "fill-yellow-500 text-yellow-500" : ""
                                                )} />
                                            {selectedPrompt?.favorite ? localT('prompts.unfavorite') : localT('prompts.favorite')}
                                        </Button>
                                    </div>
                                    <Button
                                        variant="default"
                                        onClick={() => {
                                            setPrompts(prev => prev.map(p => p.id === selectedPrompt?.id ?
                                                { ...p, usageCount: p.usageCount + 1 } : p
                                            )
                                            );
                                            setPromptDialogOpen(false);
                                        } }
                                    >
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        {localT('prompts.use_prompt')}
                                    </Button>
                                </div>

                                {/* Интеграция компонента коллекций */}
                                <div className="mt-6 pt-4 border-t border-border/50">
                                    <h3 className="text-sm font-medium mb-3">{localT('prompts.collections.title')}</h3>
                                    <PromptCollections
                                        title={localT('prompts.collections.title')}
                                        collections={collections}
                                        activeCollection={activeCollection}
                                        onCollectionSelect={setActiveCollection}
                                        onCollectionCreate={(name, description, isPublic) => {
                                            handleCreateCollection(name, description, isPublic);
                                        } }
                                        onCollectionEdit={(id, name, description, isPublic) => {
                                            handleUpdateCollection(id, name, description, isPublic);
                                        } }
                                        onCollectionDelete={(id) => {
                                            handleDeleteCollection(id);
                                        } }
                                        maxHeight="200px" />
                                </div>

                                {/* Интеграция компонента комментариев */}
                                <div className="mt-6 pt-4 border-t border-border/50">
                                    <h3 className="text-sm font-medium mb-3">{localT('prompts.comments.title')}</h3>
                                    <PromptComments
                                        promptId={selectedPrompt?.id || ''}
                                        comments={selectedPrompt?.comments || []}
                                        userRating={userRating}
                                        onAddComment={(text) => {
                                            handleAddComment(selectedPrompt?.id || '', text, userRating || undefined);
                                        } }
                                        onEditComment={(id, text) => {
                                            // Реализация редактирования комментария
                                            console.log('Edit comment', id, text);
                                        } }
                                        onDeleteComment={(id) => {
                                            // Реализация удаления комментария
                                            console.log('Delete comment', id);
                                        } }
                                        onRatePrompt={(rating) => {
                                            setUserRating(rating);
                                            // Вызов API для сохранения рейтинга
                                            if (selectedPrompt) {
                                                ratePrompt(selectedPrompt.id, Number(userId), rating);
                                            }
                                        } }
                                        isLoggedIn={!!user}
                                        maxHeight="300px" />
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            )}
        </div>
            <Dialog open={bulkEditDialogOpen} onOpenChange={setBulkEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Массовое редактирование промптов</DialogTitle>
                        <DialogDescription>
                            Редактирование {selectedPrompts.length} выбранных промптов
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="bulk-category">Категория</Label>
                            <Select
                                value={bulkEditData.category || ''}
                                onValueChange={(value) => setBulkEditData(prev => ({ ...prev, category: value }))}
                            >
                                <SelectTrigger id="bulk-category">
                                    <SelectValue placeholder="Выберите категорию" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Не изменять</SelectItem>
                                    {categories.filter(c => c.id !== "all").map(category => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="bulk-tags">Теги</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="bulk-tags"
                                    placeholder="Добавить тег"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && tagInput.trim()) {
                                            setBulkEditData(prev => ({
                                                ...prev,
                                                tags: [...(prev.tags || []), tagInput.trim()]
                                            }));
                                            setTagInput('');
                                        }
                                    } } />
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                        if (tagInput.trim()) {
                                            setBulkEditData(prev => ({
                                                ...prev,
                                                tags: [...(prev.tags || []), tagInput.trim()]
                                            }));
                                            setTagInput('');
                                        }
                                    } }
                                >
                                    Добавить
                                </Button>
                            </div>
                        </div>

                        {bulkEditData.tags && bulkEditData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {bulkEditData.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                        {tag}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                                            onClick={() => {
                                                setBulkEditData(prev => ({
                                                    ...prev,
                                                    tags: prev.tags?.filter(t => t !== tag) || []
                                                }));
                                            } }
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center space-x-2 pt-2">
                            <Switch
                                id="bulk-public"
                                checked={bulkEditData.isPublic || false}
                                onCheckedChange={(checked) => setBulkEditData(prev => ({ ...prev, isPublic: checked }))} />
                            <Label htmlFor="bulk-public">Поделиться с сообществом</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkEditDialogOpen(false)}>Отмена</Button>
                        <Button onClick={handleBulkEdit}>Применить изменения</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog></>
    );
}