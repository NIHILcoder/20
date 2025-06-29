"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, 
  Clock, 
  Play, 
  Star, 
  Users, 
  Video, 
  Search, 
  Heart, 
  BookmarkPlus
} from "lucide-react";
import { useLanguage, useLocalTranslation } from "@/components/language-context";
import Link from "next/link";

// Define interfaces for our data types
interface BaseLearningItem {
  title: string;
  link: string;
  date: string;
  popular?: boolean;
}

interface TutorialItem extends BaseLearningItem {
  image: string;
  duration: string;
  level: string;
  author: string;
}

interface GuideItem extends BaseLearningItem {
  description: string;
  category: string;
  readTime: string;
}

interface CourseItem extends BaseLearningItem {
  description: string;
  lessons: string;
  duration: string;
  level: string;
  rating: string;
}

interface CommunityItem extends BaseLearningItem {
  description: string;
  type: string;
  members?: string;
  participants?: string;
  contributors?: string;
  prompts?: string;
}

// Define interfaces for state
interface LikedItemsState {
  [key: string]: boolean;
}

interface BookmarkedItemsState {
  [key: string]: boolean;
}

// Define type for sorting options
type SortOption = 'newest' | 'popular' | 'rating';

// Define type for level filter
type LevelFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

export default function LearningPage() {
    const { language } = useLanguage();
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedLevel, setSelectedLevel] = useState<LevelFilter>("all");
    const [selectedSort, setSelectedSort] = useState<SortOption>("newest");
    const [likedItems, setLikedItems] = useState<LikedItemsState>({});
    const [bookmarkedItems, setBookmarkedItems] = useState<BookmarkedItemsState>({});
    const [activeTab, setActiveTab] = useState<string>("guides");

    // Page-specific translations
    const pageTranslations = {
        en: {
            'learning.title': 'Learning Resources',
            'learning.subtitle': 'Tutorials, guides, and resources to help you master AI art generation',
            'learning.featured_tutorials': 'Tutorials',
            'learning.tutorial_badge': 'Tutorial',
            'learning.by_author': 'By',
            'learning.watch_tutorial': 'Watch Tutorial',
            'learning.tab.guides': 'Guides',
            'learning.tab.courses': 'Courses',
            'learning.tab.community': 'Community',
            'learning.read_time': 'read',
            'learning.lessons': 'Lessons',
            'learning.duration': 'Duration',
            'learning.level': 'Level',
            'learning.rating': 'Rating',
            'learning.enroll_now': 'Enroll Now',
            'learning.members': 'members',
            'learning.join_community': 'Join Community',
            'learning.explore': 'Explore',
            'learning.search.placeholder': 'Search resources...',
            'learning.filter.all': 'All Levels',
            'learning.filter.beginner': 'Beginner',
            'learning.filter.intermediate': 'Intermediate',
            'learning.filter.advanced': 'Advanced',
            'learning.sort.newest': 'Newest First',
            'learning.sort.popular': 'Most Popular',
            'learning.sort.rating': 'Highest Rated',
            'learning.no_results': 'No results found for your search',
            'learning.bookmark': 'Bookmark',
            'learning.like': 'Like',
        },
        ru: {
            'learning.title': 'Обучающие материалы',
            'learning.subtitle': 'Уроки, руководства и ресурсы, которые помогут освоить генерацию искусства с помощью ИИ',
            'learning.featured_tutorials': 'Уроки',
            'learning.tutorial_badge': 'Урок',
            'learning.by_author': 'Автор',
            'learning.watch_tutorial': 'Смотреть урок',
            'learning.tab.guides': 'Руководства',
            'learning.tab.courses': 'Курсы',
            'learning.tab.community': 'Сообщество',
            'learning.read_time': 'чтения',
            'learning.lessons': 'Уроков',
            'learning.duration': 'Длительность',
            'learning.level': 'Уровень',
            'learning.rating': 'Рейтинг',
            'learning.enroll_now': 'Записаться',
            'learning.members': 'участников',
            'learning.join_community': 'Присоединиться',
            'learning.explore': 'Исследовать',
            'learning.search.placeholder': 'Поиск ресурсов...',
            'learning.filter.all': 'Все уровни',
            'learning.filter.beginner': 'Начинающий',
            'learning.filter.intermediate': 'Средний',
            'learning.filter.advanced': 'Продвинутый',
            'learning.sort.newest': 'Сначала новые',
            'learning.sort.popular': 'Самые популярные',
            'learning.sort.rating': 'Высший рейтинг',
            'learning.no_results': 'По вашему запросу ничего не найдено',
            'learning.bookmark': 'Сохранить',
            'learning.like': 'Нравится',
        }
    };

    const { localT } = useLocalTranslation(pageTranslations);

    // Tutorial data
    const tutorialsData: TutorialItem[] = [
        {
            title: language === 'ru' ? 'Введение в искусство с ИИ' : 'Getting Started with AI Art',
            image: "/placeholder.svg?height=300&width=500&text=Getting+Started",
            duration: language === 'ru' ? '15 мин' : '15 min',
            level: language === 'ru' ? 'Начинающий' : 'Beginner',
            author: language === 'ru' ? 'Профи ИИ' : 'AI Art Pro',
            link: "/tutorials/getting-started",
            date: "2024-05-01",
            popular: true,
        },
        {
            title: language === 'ru' ? 'Основы инженерии промптов' : 'Prompt Engineering Basics',
            image: "/placeholder.svg?height=300&width=500&text=Prompt+Engineering",
            duration: language === 'ru' ? '25 мин' : '25 min',
            level: language === 'ru' ? 'Начинающий' : 'Beginner',
            author: language === 'ru' ? 'Мастер промптов' : 'Prompt Master',
            link: "/tutorials/prompt-engineering",
            date: "2024-04-15",
            popular: true,
        },
        {
            title: language === 'ru' ? 'Работа с моделями LoRA' : 'Working with LoRA Models',
            image: "/placeholder.svg?height=300&width=500&text=LoRA+Models",
            duration: language === 'ru' ? '30 мин' : '30 min',
            level: language === 'ru' ? 'Средний' : 'Intermediate',
            author: language === 'ru' ? 'Эксперт по моделям' : 'Model Expert',
            link: "/tutorials/lora-models",
            date: "2024-03-20",
        },
        {
            title: language === 'ru' ? 'Техники стилизации для стабильных результатов' : 'Styling Techniques for Consistent Results',
            image: "/placeholder.svg?height=300&width=500&text=Styling+Techniques",
            duration: language === 'ru' ? '20 мин' : '20 min',
            level: language === 'ru' ? 'Средний' : 'Intermediate',
            author: language === 'ru' ? 'Мастер стиля' : 'Style Master',
            link: "/tutorials/styling-techniques",
            date: "2024-05-10",
        },
        {
            title: language === 'ru' ? 'Эффективное использование референс-изображений' : 'Using Reference Images Effectively',
            image: "/placeholder.svg?height=300&width=500&text=Reference+Images",
            duration: language === 'ru' ? '18 мин' : '18 min',
            level: language === 'ru' ? 'Начинающий' : 'Beginner',
            author: language === 'ru' ? 'Профи референсов' : 'Reference Pro',
            link: "/tutorials/reference-images",
            date: "2024-05-08",
        },
    ];

    // Guide data
    const guidesData: GuideItem[] = [
        {
            title: language === 'ru' ? 'Понимание параметров моделей' : 'Understanding Model Parameters',
            description: language === 'ru' ? 'Узнайте, как различные параметры влияют на результаты генерации изображений' : 'Learn how different parameters affect your image generation results',
            category: language === 'ru' ? 'Техническое' : 'Technical',
            readTime: language === 'ru' ? '10 мин' : '10 min',
            link: "/guides/model-parameters",
            date: "2024-04-10",
            popular: true,
        },
        {
            title: language === 'ru' ? 'Создание постоянных персонажей' : 'Creating Consistent Characters',
            description: language === 'ru' ? 'Техники генерации одного и того же персонажа на нескольких изображениях' : 'Techniques for generating the same character across multiple images',
            category: language === 'ru' ? 'Персонажи' : 'Characters',
            readTime: language === 'ru' ? '12 мин' : '12 min',
            link: "/guides/consistent-characters",
            date: "2024-03-25",
        },
        {
            title: language === 'ru' ? 'Мастерство негативных промптов' : 'Mastering Negative Prompts',
            description: language === 'ru' ? 'Как использовать негативные промпты для улучшения ваших генераций' : 'How to use negative prompts to improve your generations',
            category: language === 'ru' ? 'Промпты' : 'Prompting',
            readTime: language === 'ru' ? '8 мин' : '8 min',
            link: "/guides/negative-prompts",
            date: "2024-04-05",
            popular: true,
        },
        {
            title: language === 'ru' ? 'Основы композиции для ИИ-искусства' : 'Composition Basics for AI Art',
            description: language === 'ru' ? 'Понимание принципов композиции для лучших ИИ-изображений' : 'Understanding composition principles for better AI images',
            category: language === 'ru' ? 'Теория искусства' : 'Art Theory',
            readTime: language === 'ru' ? '15 мин' : '15 min',
            link: "/guides/composition-basics",
            date: "2024-03-15",
        },
        {
            title: language === 'ru' ? 'ControlNet объяснение' : 'ControlNet Explained',
            description: language === 'ru' ? 'Подробное руководство по эффективному использованию ControlNet' : 'A comprehensive guide to using ControlNet effectively',
            category: language === 'ru' ? 'Продвинутый' : 'Advanced',
            readTime: language === 'ru' ? '20 мин' : '20 min',
            link: "/guides/controlnet",
            date: "2024-02-28",
        },
        {
            title: language === 'ru' ? 'Работа с разными соотношениями сторон' : 'Working with Different Aspect Ratios',
            description: language === 'ru' ? 'Как получить наилучшие результаты при разных размерах изображений' : 'How to get the best results in different image dimensions',
            category: language === 'ru' ? 'Техническое' : 'Technical',
            readTime: language === 'ru' ? '7 мин' : '7 min',
            link: "/guides/aspect-ratios",
            date: "2024-04-22",
        },
    ];

    // Course data
    const coursesData: CourseItem[] = [
        {
            title: language === 'ru' ? 'Основы ИИ-искусства' : 'AI Art Fundamentals',
            description: language === 'ru' ? 'Комплексное введение в создание искусства с помощью ИИ' : 'A comprehensive introduction to creating art with AI',
            lessons: language === 'ru' ? '10' : '10',
            duration: language === 'ru' ? '4 часа' : '4 hours',
            level: language === 'ru' ? 'Начинающий' : 'Beginner',
            rating: '4.8',
            link: "/courses/ai-art-fundamentals",
            date: "2024-03-01",
            popular: true,
        },
        {
            title: language === 'ru' ? 'Профессиональные техники ИИ-искусства' : 'Professional AI Art Techniques',
            description: language === 'ru' ? 'Продвинутые методы создания профессионального ИИ-искусства' : 'Advanced techniques for creating professional quality AI art',
            lessons: language === 'ru' ? '12' : '12',
            duration: language === 'ru' ? '6 часов' : '6 hours',
            level: language === 'ru' ? 'Продвинутый' : 'Advanced',
            rating: '4.9',
            link: "/courses/professional-techniques",
            date: "2024-02-15",
        },
        {
            title: language === 'ru' ? 'Оптимизация рабочего процесса в ИИ-искусстве' : 'Optimizing Your AI Art Workflow',
            description: language === 'ru' ? 'Научитесь создавать лучшее искусство быстрее с оптимальными рабочими процессами' : 'Learn to create better art faster with optimal workflows',
            lessons: language === 'ru' ? '8' : '8',
            duration: language === 'ru' ? '3 часа' : '3 hours',
            level: language === 'ru' ? 'Средний' : 'Intermediate',
            rating: '4.7',
            link: "/courses/workflow-optimization",
            date: "2024-04-01",
        },
        {
            title: language === 'ru' ? 'Мастер-класс по дизайну персонажей' : 'Character Design Masterclass',
            description: language === 'ru' ? 'Комплексный подход к созданию стабильных персонажей с помощью ИИ' : 'A comprehensive approach to designing consistent characters with AI',
            lessons: language === 'ru' ? '15' : '15',
            duration: language === 'ru' ? '6 часов' : '6 hours',
            level: language === 'ru' ? 'Средний' : 'Intermediate',
            rating: '4.9',
            link: "/courses/character-design",
            date: "2024-05-05",
        },
    ];

    // Community resources data
    const communityResourcesData: CommunityItem[] = [
        {
            title: language === 'ru' ? 'Discord-сообщество ИИ-художников' : 'AI Art Discord Community',
            description: language === 'ru' ? 'Присоединяйтесь к нашему дружелюбному сообществу ИИ-художников, делящихся советами и работами' : 'Join our friendly community of AI artists sharing tips and artwork',
            members: language === 'ru' ? '5 000+' : '5,000+',
            type: language === 'ru' ? "Сообщество" : "Community",
            link: "https://discord.gg/visiomera",
            date: "2023-01-15",
            popular: true,
        },
        {
            title: language === 'ru' ? 'Ежемесячный челлендж промптов' : 'Monthly Prompt Challenge',
            description: language === 'ru' ? 'Участвуйте в нашем ежемесячном тематическом челлендже промптов' : 'Participate in our monthly themed prompt challenge',
            participants: language === 'ru' ? '500+' : '500+',
            type: language === 'ru' ? "Мероприятие" : "Event",
            link: "/community/prompt-challenge",
            date: "2023-05-01",
        },
        {
            title: language === 'ru' ? 'Витрина моделей сообщества' : 'Community Model Showcase',
            description: language === 'ru' ? 'Исследуйте и делитесь доработанными моделями, созданными сообществом' : 'Explore and share fine-tuned models created by the community',
            contributors: language === 'ru' ? '120+' : '120+',
            type: language === 'ru' ? "Ресурс" : "Resource",
            link: "/community/model-showcase",
            date: "2023-03-10",
        },
        {
            title: language === 'ru' ? 'Библиотека промптов' : 'Prompt Library',
            description: language === 'ru' ? 'Просматривайте и пополняйте нашу библиотеку эффективных промптов' : 'Browse and contribute to our library of effective prompts',
            prompts: language === 'ru' ? '1 000+' : '1,000+',
            type: language === 'ru' ? "Ресурс" : "Resource",
            link: "/community/prompt-library",
            date: "2023-02-20",
            popular: true,
        },
    ];

    // Filter items based on search query and level
    const filterItems = <T extends BaseLearningItem>(items: T[], query: string, level: string): T[] => {
        return items.filter((item) => {
            const title = item.title || "";
            const description = 'description' in item ? (item as any).description || "" : "";
            const itemLevel = 'level' in item ? (item as any).level || "" : "";
            
            const matchesSearch = !query || 
                title.toLowerCase().includes(query.toLowerCase()) || 
                description.toLowerCase().includes(query.toLowerCase());
                
            const matchesLevel = level === "all" || itemLevel.toLowerCase() === level.toLowerCase();
            
            return matchesSearch && matchesLevel;
        });
    };

    // Sort items based on sort option
    const sortItems = <T extends BaseLearningItem>(items: T[], sortOption: SortOption): T[] => {
        return [...items].sort((a, b) => {
            if (sortOption === "newest") {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            } else if (sortOption === "popular") {
                const aValue = a.popular ? 1 : 0;
                const bValue = b.popular ? 1 : 0;
                return bValue - aValue;
            } else if (sortOption === "rating") {
                const aRating = 'rating' in a ? parseFloat((a as any).rating || '0') : 0;
                const bRating = 'rating' in b ? parseFloat((b as any).rating || '0') : 0;
                return bRating - aRating;
            }
            return 0;
        });
    };

    // Handle like toggle
    const toggleLike = (id: number, type: string): void => {
        setLikedItems((prev) => ({
            ...prev,
            [`${type}-${id}`]: !prev[`${type}-${id}`]
        }));
    };

    // Handle bookmark toggle
    const toggleBookmark = (id: number, type: string): void => {
        setBookmarkedItems((prev) => ({
            ...prev,
            [`${type}-${id}`]: !prev[`${type}-${id}`]
        }));
    };

    // Get filtered and sorted items
    const filteredGuides = sortItems(filterItems(guidesData, searchQuery, selectedLevel), selectedSort);
    const filteredCourses = sortItems(filterItems(coursesData, searchQuery, selectedLevel), selectedSort);
    const filteredTutorials = sortItems(filterItems(tutorialsData, searchQuery, selectedLevel), selectedSort);
    const filteredCommunity = sortItems(filterItems(communityResourcesData, searchQuery, selectedLevel), selectedSort);

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    {localT('learning.title')}
                </h1>
                <p className="text-muted-foreground">
                    {localT('learning.subtitle')}
                </p>
            </div>

            {/* Search and filters section */}
            <div className="mb-8 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={localT('learning.search.placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Select
                            value={selectedLevel}
                            onValueChange={(value) => setSelectedLevel(value as LevelFilter)}
                        >
                            <SelectTrigger className="w-full md:w-40">
                                <SelectValue placeholder={localT('learning.filter.all')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{localT('learning.filter.all')}</SelectItem>
                                <SelectItem value="beginner">{localT('learning.filter.beginner')}</SelectItem>
                                <SelectItem value="intermediate">{localT('learning.filter.intermediate')}</SelectItem>
                                <SelectItem value="advanced">{localT('learning.filter.advanced')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={selectedSort}
                            onValueChange={(value) => setSelectedSort(value as SortOption)}
                        >
                            <SelectTrigger className="w-full md:w-40">
                                <SelectValue placeholder={localT('learning.sort.newest')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">{localT('learning.sort.newest')}</SelectItem>
                                <SelectItem value="popular">{localT('learning.sort.popular')}</SelectItem>
                                <SelectItem value="rating">{localT('learning.sort.rating')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Main content tabs */}
            <div className="mb-8">
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-6 w-full md:w-auto">
                        <TabsTrigger value="guides">{localT('learning.tab.guides')}</TabsTrigger>
                        <TabsTrigger value="courses">{localT('learning.tab.courses')}</TabsTrigger>
                        <TabsTrigger value="tutorials">{localT('learning.featured_tutorials')}</TabsTrigger>
                        <TabsTrigger value="community">{localT('learning.tab.community')}</TabsTrigger>
                    </TabsList>

                    {/* Guides tab */}
                    <TabsContent value="guides" className="mt-0">
                        {filteredGuides.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">{localT('learning.no_results')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {filteredGuides.map((guide, index) => (
                                    <Card key={`guide-${index}`} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                                        <CardHeader className="pb-2">
                                            <Badge className="w-fit mb-1">{guide.category}</Badge>
                                            <CardTitle className="text-lg">{guide.title}</CardTitle>
                                            <CardDescription className="line-clamp-2">
                                                {guide.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Clock className="mr-1 h-4 w-4" />
                                                {guide.readTime} {localT('learning.read_time')}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-between pt-0">
                                            <Link href={guide.link}>
                                                <Button variant="secondary">{localT('learning.explore')}</Button>
                                            </Link>
                                            <div className="flex gap-2">
                                                <button 
                                                    className="text-muted-foreground hover:text-primary p-1"
                                                    onClick={() => toggleLike(index, 'guide')}
                                                    title={localT('learning.like')}
                                                >
                                                    <Heart className={`h-5 w-5 ${likedItems[`guide-${index}`] ? 'fill-red-500 text-red-500' : ''}`} />
                                                </button>
                                                <button 
                                                    className="text-muted-foreground hover:text-primary p-1"
                                                    onClick={() => toggleBookmark(index, 'guide')}
                                                    title={localT('learning.bookmark')}
                                                >
                                                    <BookmarkPlus className={`h-5 w-5 ${bookmarkedItems[`guide-${index}`] ? 'fill-primary text-primary' : ''}`} />
                                                </button>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Courses tab */}
                    <TabsContent value="courses" className="mt-0">
                        {filteredCourses.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">{localT('learning.no_results')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredCourses.map((course, index) => (
                                    <Card key={`course-${index}`} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                                        <CardHeader>
                                            <CardTitle>{course.title}</CardTitle>
                                            <CardDescription className="line-clamp-2">
                                                {course.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">{localT('learning.lessons')}</span>
                                                    <span className="font-medium">{course.lessons}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">{localT('learning.duration')}</span>
                                                    <span className="font-medium">{course.duration}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">{localT('learning.level')}</span>
                                                    <Badge variant="outline">{course.level}</Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">{localT('learning.rating')}</span>
                                                    <div className="flex items-center">
                                                        <Star className="mr-1 h-4 w-4 fill-yellow-500 text-yellow-500" />
                                                        <span className="font-medium">{course.rating}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-between">
                                            <Link href={course.link}>
                                                <Button>{localT('learning.enroll_now')}</Button>
                                            </Link>
                                            <button 
                                                className="text-muted-foreground hover:text-primary"
                                                onClick={() => toggleBookmark(index, 'course')}
                                                title={localT('learning.bookmark')}
                                            >
                                                <BookmarkPlus className={`h-5 w-5 ${bookmarkedItems[`course-${index}`] ? 'fill-primary text-primary' : ''}`} />
                                            </button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Tutorials tab */}
                    <TabsContent value="tutorials" className="mt-0">
                        {filteredTutorials.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">{localT('learning.no_results')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredTutorials.map((tutorial, index) => (
                                    <Card key={`tutorial-${index}`} className="overflow-hidden group hover:shadow-md transition-shadow duration-300">
                                        <div className="relative aspect-video">
                                            <img
                                                src={tutorial.image || "/placeholder.svg"}
                                                alt={tutorial.title}
                                                className="h-full w-full object-cover"
                                            />
                                            <Badge className="absolute left-2 top-2 bg-black/70">
                                                <Video className="mr-1 h-3 w-3" />
                                                {localT('learning.tutorial_badge')}
                                            </Badge>
                                        </div>
                                        <CardContent className="p-4">
                                            <h3 className="font-bold">{tutorial.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {localT('learning.by_author')} {tutorial.author}
                                            </p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <Badge variant="secondary">
                                                    <Clock className="mr-1 h-3 w-3" />
                                                    {tutorial.duration}
                                                </Badge>
                                                <Badge variant="secondary">
                                                    <BookOpen className="mr-1 h-3 w-3" />
                                                    {tutorial.level}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-between p-4 pt-0">
                                            <Link href={tutorial.link}>
                                                <Button>
                                                    <Play className="mr-2 h-4 w-4" />
                                                    {localT('learning.watch_tutorial')}
                                                </Button>
                                            </Link>
                                            <div className="flex gap-2">
                                                <button 
                                                    className="text-muted-foreground hover:text-primary"
                                                    onClick={() => toggleLike(index, 'tutorial')}
                                                    title={localT('learning.like')}
                                                >
                                                    <Heart className={`h-5 w-5 ${likedItems[`tutorial-${index}`] ? 'fill-red-500 text-red-500' : ''}`} />
                                                </button>
                                                <button 
                                                    className="text-muted-foreground hover:text-primary"
                                                    onClick={() => toggleBookmark(index, 'tutorial')}
                                                    title={localT('learning.bookmark')}
                                                >
                                                    <BookmarkPlus className={`h-5 w-5 ${bookmarkedItems[`tutorial-${index}`] ? 'fill-primary text-primary' : ''}`} />
                                                </button>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Community tab */}
                    <TabsContent value="community" className="mt-0">
                        {filteredCommunity.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">{localT('learning.no_results')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredCommunity.map((resource, index) => (
                                    <Card key={`community-${index}`} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                                        <CardHeader>
                                            <Badge className="w-fit mb-2">
                                                {resource.type}
                                            </Badge>
                                            <CardTitle>{resource.title}</CardTitle>
                                            <CardDescription className="line-clamp-2">
                                                {resource.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-5 w-5 text-muted-foreground" />
                                                <span className="text-sm">
                                                    {resource.members || 
                                                     resource.participants || 
                                                     resource.contributors || 
                                                     resource.prompts}{" "}
                                                    {resource.members
                                                        ? localT('learning.members')
                                                        : resource.type === "Event"
                                                            ? "participants"
                                                            : resource.type === "Resource" && resource.contributors
                                                                ? "contributors"
                                                                : "prompts"}
                                                </span>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-between">
                                            <Link href={resource.link}>
                                                <Button>
                                                    {resource.type === "Community"
                                                        ? localT('learning.join_community')
                                                        : localT('learning.explore')}
                                                </Button>
                                            </Link>
                                            <button 
                                                className="text-muted-foreground hover:text-primary"
                                                onClick={() => toggleBookmark(index, 'community')}
                                                title={localT('learning.bookmark')}
                                            >
                                                <BookmarkPlus className={`h-5 w-5 ${bookmarkedItems[`community-${index}`] ? 'fill-primary text-primary' : ''}`} />
                                            </button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}