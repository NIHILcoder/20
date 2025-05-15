"use client";

import { useState, useEffect } from "react";
import { ParticlesBackground } from "@/components/particles-background";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  BookOpen, 
  Clock, 
  Play, 
  Star, 
  Users, 
  Video, 
  Search, 
  SlidersHorizontal, 
  ChevronRight, 
  Info, 
  Heart, 
  BookmarkPlus, 
  Share2 
} from "lucide-react";
import { useLanguage, useLocalTranslation } from "@/components/language-context";
import Link from "next/link";
import { motion } from "framer-motion";

// Import data from separate files (should be created)
import { tutorials, guides, courses, communityResources } from "@/data/learning-resources";

export default function LearningPage() {
    const { language } = useLanguage();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLevel, setSelectedLevel] = useState("all");
    const [selectedSort, setSelectedSort] = useState("newest");
    // Define interface for liked and bookmarked items
    interface ItemsState {
        [key: string]: boolean;
    }
    
    const [likedItems, setLikedItems] = useState<ItemsState>({});
    const [bookmarkedItems, setBookmarkedItems] = useState<ItemsState>({});
    const [activeTab, setActiveTab] = useState("guides");

    // Page-specific translations
    const pageTranslations = {
        en: {
            // Existing translations
            'learning.title': 'Learning Resources',
            'learning.subtitle': 'Tutorials, guides, and resources to help you master AI art generation',
            'learning.featured_tutorials': 'Featured Tutorials',
            'learning.tutorial_badge': 'Tutorial',
            'learning.by_author': 'By',
            'learning.watch_tutorial': 'Watch Tutorial',
            'learning.tab.guides': 'Guides',
            'learning.tab.courses': 'Courses',
            'learning.tab.community': 'Community Resources',
            'learning.read_time': 'read',
            'learning.lessons': 'Lessons',
            'learning.duration': 'Duration',
            'learning.level': 'Level',
            'learning.rating': 'Rating',
            'learning.enroll_now': 'Enroll Now',
            'learning.members': 'members',
            'learning.participants': 'participants',
            'learning.contributors': 'contributors',
            'learning.prompts': 'prompts',
            'learning.join_community': 'Join Community',
            'learning.participate': 'Participate',
            'learning.explore': 'Explore',
            
            // New translations
            'learning.search.placeholder': 'Search resources...',
            'learning.filter.all': 'All Levels',
            'learning.filter.beginner': 'Beginner',
            'learning.filter.intermediate': 'Intermediate',
            'learning.filter.advanced': 'Advanced',
            'learning.sort.newest': 'Newest First',
            'learning.sort.popular': 'Most Popular',
            'learning.sort.rating': 'Highest Rated',
            'learning.recommendations': 'Recommended for You',
            'learning.recently_added': 'Recently Added',
            'learning.popular_now': 'Popular Now',
            'learning.no_results': 'No results found for your search',
            'learning.share': 'Share',
            'learning.bookmark': 'Bookmark',
            'learning.bookmarked': 'Bookmarked',
            'learning.like': 'Like',
            'learning.liked': 'Liked',
            'learning.continue': 'Continue Learning',
            'learning.view_resources': 'View All Resources',
            'learning.filters': 'Filters',
            'learning.sort_by': 'Sort By',
            'learning.saved_items': 'Saved Items',
            'learning.see_more': 'See More',
            'learning.trending': 'Trending',
            'learning.new': 'New',
            'learning.back_to_all': 'Back to All Resources',
            'learning.related': 'Related Resources',
            'learning.prerequisites': 'Prerequisites',
            'learning.what_you_learn': 'What You\'ll Learn',
            'learning.series': 'Part of Series',
        },
        ru: {
            // Existing translations
            'learning.title': 'Обучающие материалы',
            'learning.subtitle': 'Уроки, руководства и ресурсы, которые помогут освоить генерацию искусства с помощью ИИ',
            'learning.featured_tutorials': 'Рекомендуемые уроки',
            'learning.tutorial_badge': 'Урок',
            'learning.by_author': 'Автор',
            'learning.watch_tutorial': 'Смотреть урок',
            'learning.tab.guides': 'Руководства',
            'learning.tab.courses': 'Курсы',
            'learning.tab.community': 'Ресурсы сообщества',
            'learning.read_time': 'чтения',
            'learning.lessons': 'Уроков',
            'learning.duration': 'Длительность',
            'learning.level': 'Уровень',
            'learning.rating': 'Рейтинг',
            'learning.enroll_now': 'Записаться',
            'learning.members': 'участников',
            'learning.participants': 'участников',
            'learning.contributors': 'авторов',
            'learning.prompts': 'промптов',
            'learning.join_community': 'Присоединиться',
            'learning.participate': 'Участвовать',
            'learning.explore': 'Исследовать',
            
            // New translations
            'learning.search.placeholder': 'Поиск ресурсов...',
            'learning.filter.all': 'Все уровни',
            'learning.filter.beginner': 'Начинающий',
            'learning.filter.intermediate': 'Средний',
            'learning.filter.advanced': 'Продвинутый',
            'learning.sort.newest': 'Сначала новые',
            'learning.sort.popular': 'Самые популярные',
            'learning.sort.rating': 'Высший рейтинг',
            'learning.recommendations': 'Рекомендовано для вас',
            'learning.recently_added': 'Недавно добавленные',
            'learning.popular_now': 'Популярно сейчас',
            'learning.no_results': 'По вашему запросу ничего не найдено',
            'learning.share': 'Поделиться',
            'learning.bookmark': 'Сохранить',
            'learning.bookmarked': 'Сохранено',
            'learning.like': 'Нравится',
            'learning.liked': 'Понравилось',
            'learning.continue': 'Продолжить обучение',
            'learning.view_resources': 'Все ресурсы',
            'learning.filters': 'Фильтры',
            'learning.sort_by': 'Сортировать по',
            'learning.saved_items': 'Сохраненные',
            'learning.see_more': 'Показать еще',
            'learning.trending': 'В тренде',
            'learning.new': 'Новое',
            'learning.back_to_all': 'Назад ко всем ресурсам',
            'learning.related': 'Похожие ресурсы',
            'learning.prerequisites': 'Предварительные требования',
            'learning.what_you_learn': 'Чему вы научитесь',
            'learning.series': 'Часть серии',
        }
    };

    const { localT } = useLocalTranslation(pageTranslations);

    // Tutorial data with translation keys and links
    const tutorialsData: LearningItem[] = [
        {
            titleKey: 'tutorial.1.title',
            image: "/placeholder.svg?height=300&width=500&text=Getting+Started",
            durationKey: 'tutorial.1.duration',
            levelKey: 'tutorial.1.level',
            authorKey: 'tutorial.1.author',
            link: "/tutorials/getting-started",
            date: "2024-05-01",
            popular: true,
            trending: true,
        },
        {
            titleKey: 'tutorial.2.title',
            image: "/placeholder.svg?height=300&width=500&text=Prompt+Engineering",
            durationKey: 'tutorial.2.duration',
            levelKey: 'tutorial.2.level',
            authorKey: 'tutorial.2.author',
            link: "/tutorials/prompt-engineering",
            date: "2024-04-15",
            popular: true,
        },
        {
            titleKey: 'tutorial.3.title',
            image: "/placeholder.svg?height=300&width=500&text=LoRA+Models",
            durationKey: 'tutorial.3.duration',
            levelKey: 'tutorial.3.level',
            authorKey: 'tutorial.3.author',
            link: "/tutorials/lora-models",
            date: "2024-03-20",
            trending: true,
        },
        // New tutorials
        {
            titleKey: 'tutorial.4.title',
            title: 'Styling Techniques for Consistent Results',
            image: "/placeholder.svg?height=300&width=500&text=Styling+Techniques",
            duration: '20 min',
            level: 'Intermediate',
            author: 'Style Master',
            link: "/tutorials/styling-techniques",
            date: "2024-05-10",
            trending: true,
            new: true,
        },
        {
            titleKey: 'tutorial.5.title',
            title: 'Using Reference Images Effectively',
            image: "/placeholder.svg?height=300&width=500&text=Reference+Images",
            duration: '18 min',
            level: 'Beginner',
            author: 'Reference Pro',
            link: "/tutorials/reference-images",
            date: "2024-05-08",
            new: true,
        },
    ];

    // Guide data with translation keys and links
    const guidesData: LearningItem[] = [
        {
            titleKey: 'guide.1.title',
            descriptionKey: 'guide.1.description',
            categoryKey: 'guide.1.category',
            readTimeKey: 'guide.1.readTime',
            link: "/guides/model-parameters",
            date: "2024-04-10",
            popular: true,
        },
        {
            titleKey: 'guide.2.title',
            descriptionKey: 'guide.2.description',
            categoryKey: 'guide.2.category',
            readTimeKey: 'guide.2.readTime',
            link: "/guides/consistent-characters",
            date: "2024-03-25",
            trending: true,
        },
        {
            titleKey: 'guide.3.title',
            descriptionKey: 'guide.3.description',
            categoryKey: 'guide.3.category',
            readTimeKey: 'guide.3.readTime',
            link: "/guides/negative-prompts",
            date: "2024-04-05",
            popular: true,
            trending: true,
        },
        {
            titleKey: 'guide.4.title',
            descriptionKey: 'guide.4.description',
            categoryKey: 'guide.4.category',
            readTimeKey: 'guide.4.readTime',
            link: "/guides/composition-basics",
            date: "2024-03-15",
        },
        {
            titleKey: 'guide.5.title',
            descriptionKey: 'guide.5.description',
            categoryKey: 'guide.5.category',
            readTimeKey: 'guide.5.readTime',
            link: "/guides/controlnet",
            date: "2024-02-28",
        },
        {
            titleKey: 'guide.6.title',
            descriptionKey: 'guide.6.description',
            categoryKey: 'guide.6.category',
            readTimeKey: 'guide.6.readTime',
            link: "/guides/aspect-ratios",
            date: "2024-04-22",
            new: true,
        },
        // New guides
        {
            title: 'Texture Manipulation Techniques',
            description: 'Learn to generate and control specific textures in your images',
            category: 'Advanced',
            readTime: '15 min',
            link: "/guides/texture-manipulation",
            date: "2024-05-14",
            new: true,
        },
        {
            title: 'Color Theory for AI Art',
            description: 'Understanding how to use color theory to improve your generations',
            category: 'Art Theory',
            readTime: '12 min',
            link: "/guides/color-theory",
            date: "2024-05-07",
            new: true,
        },
    ];

    // Course data with translation keys and links
    const coursesData: LearningItem[] = [
        {
            titleKey: 'course.1.title',
            descriptionKey: 'course.1.description',
            lessonsKey: 'course.1.lessons',
            durationKey: 'course.1.duration',
            levelKey: 'course.1.level',
            ratingKey: 'course.1.rating',
            link: "/courses/ai-art-fundamentals",
            date: "2024-03-01",
            popular: true,
        },
        {
            titleKey: 'course.2.title',
            descriptionKey: 'course.2.description',
            lessonsKey: 'course.2.lessons',
            durationKey: 'course.2.duration',
            levelKey: 'course.2.level',
            ratingKey: 'course.2.rating',
            link: "/courses/professional-techniques",
            date: "2024-02-15",
            trending: true,
        },
        {
            titleKey: 'course.3.title',
            descriptionKey: 'course.3.description',
            lessonsKey: 'course.3.lessons',
            durationKey: 'course.3.duration',
            levelKey: 'course.3.level',
            ratingKey: 'course.3.rating',
            link: "/courses/workflow-optimization",
            date: "2024-04-01",
            new: true,
        },
        // New courses
        {
            title: 'Character Design Masterclass',
            description: 'A comprehensive approach to designing consistent characters with AI',
            lessons: '15',
            duration: '6 hours',
            level: 'Intermediate',
            rating: '4.9',
            link: "/courses/character-design",
            date: "2024-05-05",
            new: true,
        },
        {
            title: 'From Concept to Final Art',
            description: 'Complete end-to-end workflow for creating polished AI artwork',
            lessons: '10',
            duration: '4 hours',
            level: 'All Levels',
            rating: '4.8',
            link: "/courses/concept-to-final",
            date: "2024-04-20",
            popular: true,
        },
    ];

    // Community resources data with translation keys and links
    const communityResourcesData: LearningItem[] = [
        {
            titleKey: 'community.1.title',
            descriptionKey: 'community.1.description',
            membersKey: 'community.1.members',
            typeKey: 'community.1.type',
            type: "Community",
            link: "https://discord.gg/visiomera",
            date: "2023-01-15",
            popular: true,
        },
        {
            titleKey: 'community.2.title',
            descriptionKey: 'community.2.description',
            participantsKey: 'community.2.participants',
            typeKey: 'community.2.type',
            type: "Event",
            link: "/community/prompt-challenge",
            date: "2023-05-01",
            trending: true,
        },
        {
            titleKey: 'community.3.title',
            descriptionKey: 'community.3.description',
            contributorsKey: 'community.3.contributors',
            typeKey: 'community.3.type',
            type: "Resource",
            link: "/community/model-showcase",
            date: "2023-03-10",
        },
        {
            titleKey: 'community.4.title',
            descriptionKey: 'community.4.description',
            promptsKey: 'community.4.prompts',
            typeKey: 'community.4.type',
            type: "Resource",
            link: "/community/prompt-library",
            date: "2023-02-20",
            popular: true,
        },
        // New community resources
        {
            title: 'Bi-Weekly AI Art Critique Sessions',
            description: 'Join our community critique sessions to get feedback on your AI art',
            participants: '150+ per session',
            type: "Event",
            link: "/community/critique-sessions",
            date: "2024-04-15",
            new: true,
        },
        {
            title: 'AI Artists Directory',
            description: 'Connect with AI artists in our community directory',
            contributors: '300+',
            type: "Resource",
            link: "/community/artists-directory",
            date: "2024-05-01",
            new: true,
        },
    ];

    // Define interfaces for learning items
    interface LearningItem {
        titleKey?: string;
        title?: string;
        descriptionKey?: string;
        description?: string;
        levelKey?: string;
        level?: string;
        ratingKey?: string;
        rating?: string;
        date: string;
        popular?: boolean;
        trending?: boolean;
        new?: boolean;
        image?: string;
        durationKey?: string;
        duration?: string;
        authorKey?: string;
        author?: string;
        categoryKey?: string;
        category?: string;
        readTimeKey?: string;
        readTime?: string;
        lessonsKey?: string;
        lessons?: string;
        membersKey?: string;
        members?: string;
        participantsKey?: string;
        participants?: string;
        contributorsKey?: string;
        contributors?: string;
        promptsKey?: string;
        prompts?: string;
        type?: string;
        typeKey?: string;
        link: string;
    }

    // Filter items based on search query and level
    const filterItems = (items: LearningItem[], query: string, level: string) => {
        return items.filter((item) => {
            const title = item.titleKey ? localT(item.titleKey) : (item.title ?? "");
            const description = item.descriptionKey ? localT(item.descriptionKey) : (item.description ?? "");
            const itemLevel = item.levelKey ? localT(item.levelKey) : (item.level ?? "");
            
            const matchesSearch = !query || 
                (title && title.toLowerCase().includes(query.toLowerCase())) || 
                (description && description.toLowerCase().includes(query.toLowerCase()));
                
            const matchesLevel = level === "all" || (itemLevel && itemLevel.toLowerCase() === level.toLowerCase());
            
            return matchesSearch && matchesLevel;
        });
    };

    // Sort items based on sort option
    const sortItems = (items: LearningItem[], sortOption: string) => {
        return [...items].sort((a, b) => {
            if (sortOption === "newest") {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            } else if (sortOption === "popular") {
                const aValue = a.popular ? 1 : 0;
                const bValue = b.popular ? 1 : 0;
                return bValue - aValue;
            } else if (sortOption === "rating") {
                // Safely parse rating values with proper type handling
                const aRatingStr = a.ratingKey ? localT(a.ratingKey) : (a.rating ?? '0');
                const bRatingStr = b.ratingKey ? localT(b.ratingKey) : (b.rating ?? '0');
                const aRating = parseFloat(aRatingStr) || 0; // Use || 0 to handle NaN
                const bRating = parseFloat(bRatingStr) || 0;
                return bRating - aRating;
            }
            return 0;
        });
    };

    // Handle like toggle
    const toggleLike = (id: string | number, type: string) => {
        setLikedItems((prev) => ({
            ...prev,
            [`${type}-${id}`]: !prev[`${type}-${id}`]
        }));
    };

    // Handle bookmark toggle
    const toggleBookmark = (id: string | number, type: string) => {
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

    // Get recommended items (for this example, just taking some popular items)
    const recommendedItems = [
        ...guidesData.filter(item => item.popular).slice(0, 2),
        ...coursesData.filter(item => item.popular).slice(0, 1),
        ...tutorialsData.filter(item => item.popular).slice(0, 1)
    ];

    // Get trending items
    const trendingItems = [
        ...guidesData.filter(item => item.trending).slice(0, 1),
        ...coursesData.filter(item => item.trending).slice(0, 1),
        ...tutorialsData.filter(item => item.trending).slice(0, 2)
    ];

    // Get new items
    const newItems = [
        ...guidesData.filter(item => item.new).slice(0, 2),
        ...coursesData.filter(item => item.new).slice(0, 1),
        ...tutorialsData.filter(item => item.new).slice(0, 1),
        ...communityResourcesData.filter(item => item.new).slice(0, 1)
    ];

    return (
        <div className="container relative mx-auto py-8">
            <ParticlesBackground />

            <div className="mb-8 space-y-4">
                <motion.h1 
                    className="text-3xl font-bold"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {localT('learning.title')}
                </motion.h1>
                <motion.p 
                    className="text-muted-foreground"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {localT('learning.subtitle')}
                </motion.p>
            </div>

            {/* Recommendations section */}
            <motion.div 
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">{localT('learning.recommendations')}</h2>
                    <Button variant="ghost" size="sm" className="text-sm">
                        {localT('learning.see_more')}
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {recommendedItems.map((item, index) => (
                        <motion.div
                            key={`recommended-${index}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                            <Link href={item.link} className="block h-full">
                                <Card className="h-full overflow-hidden group hover:shadow-md transition-shadow duration-300">
                                    <div className="relative aspect-video bg-muted">
                                        <img
                                            src={item.image ?? "/placeholder.svg"}
                                            alt={item.titleKey ? localT(item.titleKey) : (item.title ?? "")}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <Badge className="absolute left-2 top-2 bg-primary/80">
                                            {localT('learning.recommendations')}
                                        </Badge>
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-bold line-clamp-1">
                                            {item.titleKey ? localT(item.titleKey) : (item.title ?? "")}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                            {item.descriptionKey ? localT(item.descriptionKey) : (item.description ?? "")}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Search and filters section */}
            <motion.div 
                className="mb-8 space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            >
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
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full md:w-auto">
                                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                                    {localT('learning.filters')}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-2">{localT('learning.level')}</h4>
                                        <Select
                                            value={selectedLevel}
                                            onValueChange={setSelectedLevel}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={localT('learning.filter.all')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{localT('learning.filter.all')}</SelectItem>
                                                <SelectItem value="beginner">{localT('learning.filter.beginner')}</SelectItem>
                                                <SelectItem value="intermediate">{localT('learning.filter.intermediate')}</SelectItem>
                                                <SelectItem value="advanced">{localT('learning.filter.advanced')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">{localT('learning.sort_by')}</h4>
                                        <Select
                                            value={selectedSort}
                                            onValueChange={setSelectedSort}
                                        >
                                            <SelectTrigger>
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
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </motion.div>

            {/* Featured and trending sections */}
            <motion.div 
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                {/* Trending section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold flex items-center">
                            <Badge variant="outline" className="mr-2 bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                {localT('learning.trending')}
                            </Badge>
                            {localT('learning.popular_now')}
                        </h2>
                        <Button variant="ghost" size="sm" className="text-sm">
                            {localT('learning.see_more')}
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {trendingItems.map((item, index) => (
                            <motion.div
                                key={`trending-${index}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <Link href={item.link} className="block h-full">
                                    <Card className="h-full overflow-hidden group hover:shadow-md transition-shadow duration-300">
                                        <div className="relative aspect-video bg-muted">
                                            <img
                                                src={item.image ?? "/placeholder.svg"}
                                                alt={item.titleKey ? localT(item.titleKey) : (item.title ?? "")}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <Badge className="absolute left-2 top-2 bg-yellow-500/80 text-white">
                                                {localT('learning.trending')}
                                            </Badge>
                                        </div>
                                        <CardContent className="p-4">
                                            <h3 className="font-bold line-clamp-1">
                                                {item.titleKey ? localT(item.titleKey) : (item.title ?? "")}
                                            </h3>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center">
                                                    <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                                                    <span className="text-xs text-muted-foreground">
                                                        {item.durationKey ? localT(item.durationKey) : 
                                                         item.readTimeKey ? localT(item.readTimeKey) : 
                                                         (item.duration ?? '')}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button 
                                                        className="text-muted-foreground hover:text-primary"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            toggleLike(index, 'trending');
                                                        }}
                                                    >
                                                        <Heart className={`h-4 w-4 ${likedItems[`trending-${index}`] ? 'fill-red-500 text-red-500' : ''}`} />
                                                    </button>
                                                    <button 
                                                        className="text-muted-foreground hover:text-primary"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            toggleBookmark(index, 'trending');
                                                        }}
                                                    >
                                                        <BookmarkPlus className={`h-4 w-4 ${bookmarkedItems[`trending-${index}`] ? 'fill-primary text-primary' : ''}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* New content section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold flex items-center">
                            <Badge variant="outline" className="mr-2 bg-green-500/10 text-green-500 border-green-500/20">
                                {localT('learning.new')}
                            </Badge>
                            {localT('learning.recently_added')}
                        </h2>
                        <Button variant="ghost" size="sm" className="text-sm">
                            {localT('learning.see_more')}
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {newItems.map((item, index) => (
                            <motion.div
                                key={`new-${index}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <Link href={item.link} className="block h-full">
                                    <Card className="h-full overflow-hidden group hover:shadow-md transition-shadow duration-300">
                                        <div className="relative aspect-video bg-muted">
                                            <img
                                                src={item.image ?? "/placeholder.svg"}
                                                alt={item.titleKey ? localT(item.titleKey) : (item.title ?? "")}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <Badge className="absolute left-2 top-2 bg-green-500/80 text-white">
                                                {localT('learning.new')}
                                            </Badge>
                                        </div>
                                        <CardContent className="p-4">
                                            <h3 className="font-bold line-clamp-1">
                                                {item.titleKey ? localT(item.titleKey) : (item.title ?? "")}
                                            </h3>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center">
                                                    <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                                                    <span className="text-xs text-muted-foreground">
                                                        {item.durationKey ? localT(item.durationKey) : 
                                                         item.readTimeKey ? localT(item.readTimeKey) : 
                                                         (item.duration ?? '')}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button 
                                                        className="text-muted-foreground hover:text-primary"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            toggleLike(index, 'new');
                                                        }}
                                                    >
                                                        <Heart className={`h-4 w-4 ${likedItems[`new-${index}`] ? 'fill-red-500 text-red-500' : ''}`} />
                                                    </button>
                                                    <button 
                                                        className="text-muted-foreground hover:text-primary"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            toggleBookmark(index, 'new');
                                                        }}
                                                    >
                                                        <BookmarkPlus className={`h-4 w-4 ${bookmarkedItems[`new-${index}`] ? 'fill-primary text-primary' : ''}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Main content tabs */}
            <motion.div 
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
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
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {filteredGuides.map((guide, index) => (
                                    <motion.div
                                        key={`guide-${index}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <Link href={guide.link} className="block">
                                            <Card className="flex overflow-hidden hover:shadow-md transition-shadow duration-300">
                                                <CardContent className="flex-1 p-4">
                                                    <Badge className="mb-2">{guide.categoryKey ? localT(guide.categoryKey) : guide.category}</Badge>
                                                    <h3 className="font-bold">{guide.titleKey ? localT(guide.titleKey) : guide.title}</h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {guide.descriptionKey ? localT(guide.descriptionKey) : guide.description}
                                                    </p>
                                                    <div className="mt-2 flex items-center justify-between">
                                                        <div className="flex items-center text-xs text-muted-foreground">
                                                            <Clock className="mr-1 h-3 w-3" />
                                                            {guide.readTimeKey ? localT(guide.readTimeKey) : guide.readTime} {localT('learning.read_time')}
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button 
                                                                className="text-muted-foreground hover:text-primary"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    toggleLike(index, 'guide');
                                                                }}
                                                            >
                                                                <Heart className={`h-4 w-4 ${likedItems[`guide-${index}`] ? 'fill-red-500 text-red-500' : ''}`} />
                                                            </button>
                                                            <button 
                                                                className="text-muted-foreground hover:text-primary"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    toggleBookmark(index, 'guide');
                                                                }}
                                                            >
                                                                <BookmarkPlus className={`h-4 w-4 ${bookmarkedItems[`guide-${index}`] ? 'fill-primary text-primary' : ''}`} />
                                                            </button>
                                                            <button 
                                                                className="text-muted-foreground hover:text-primary"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    // Share functionality could be added here
                                                                }}
                                                            >
                                                                <Share2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                                <div className="flex w-24 items-center justify-center bg-muted group-hover:bg-muted/80 transition-colors duration-300">
                                                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                            </Card>
                                        </Link>
                                    </motion.div>
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
                                    <motion.div
                                        key={`course-${index}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <Link href={course.link} className="block h-full">
                                            <Card className="h-full overflow-hidden hover:shadow-md transition-shadow duration-300">
                                                <CardHeader className="pb-2">
                                                    <div className="flex justify-between items-start">
                                                        <CardTitle className="mr-2">{course.titleKey ? localT(course.titleKey) : course.title}</CardTitle>
                                                        <div className="flex">
                                                            <button 
                                                                className="text-muted-foreground hover:text-primary"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    toggleBookmark(index, 'course');
                                                                }}
                                                            >
                                                                <BookmarkPlus className={`h-4 w-4 ${bookmarkedItems[`course-${index}`] ? 'fill-primary text-primary' : ''}`} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <CardDescription className="line-clamp-2">
                                                        {course.descriptionKey ? localT(course.descriptionKey) : course.description}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm">{localT('learning.lessons')}</span>
                                                            <span className="font-medium">{course.lessonsKey ? localT(course.lessonsKey) : course.lessons}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm">{localT('learning.duration')}</span>
                                                            <span className="font-medium">{course.durationKey ? localT(course.durationKey) : course.duration}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm">{localT('learning.level')}</span>
                                                            <Badge variant="outline">{course.levelKey ? localT(course.levelKey) : course.level}</Badge>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm">{localT('learning.rating')}</span>
                                                            <div className="flex items-center">
                                                                <Star className="mr-1 h-4 w-4 fill-yellow-500 text-yellow-500" />
                                                                <span className="font-medium">{course.ratingKey ? localT(course.ratingKey) : course.rating}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                                <CardFooter>
                                                    <Button className="w-full">{localT('learning.enroll_now')}</Button>
                                                </CardFooter>
                                            </Card>
                                        </Link>
                                    </motion.div>
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
                                    <motion.div
                                        key={`tutorial-${index}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <Link href={tutorial.link} className="block h-full">
                                            <Card className="h-full overflow-hidden group hover:shadow-md transition-shadow duration-300">
                                                <div className="relative aspect-video">
                                                    <img
                                                        src={tutorial.image || "/placeholder.svg"}
                                                        alt={tutorial.titleKey ? localT(tutorial.titleKey) : tutorial.title}
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 duration-300">
                                                        <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full">
                                                            <Play className="h-6 w-6" />
                                                        </Button>
                                                    </div>
                                                    <Badge className="absolute left-2 top-2 bg-black/70">
                                                        <Video className="mr-1 h-3 w-3" />
                                                        {localT('learning.tutorial_badge')}
                                                    </Badge>
                                                </div>
                                                <CardContent className="p-4">
                                                    <h3 className="font-bold">{tutorial.titleKey ? localT(tutorial.titleKey) : tutorial.title}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {localT('learning.by_author')} {tutorial.authorKey ? localT(tutorial.authorKey) : tutorial.author}
                                                    </p>
                                                    <div className="mt-2 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="secondary">
                                                                <Clock className="mr-1 h-3 w-3" />
                                                                {tutorial.durationKey ? localT(tutorial.durationKey) : tutorial.duration}
                                                            </Badge>
                                                            <Badge variant="secondary">
                                                                <BookOpen className="mr-1 h-3 w-3" />
                                                                {tutorial.levelKey ? localT(tutorial.levelKey) : tutorial.level}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button 
                                                                className="text-muted-foreground hover:text-primary"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    toggleLike(index, 'tutorial');
                                                                }}
                                                            >
                                                                <Heart className={`h-4 w-4 ${likedItems[`tutorial-${index}`] ? 'fill-red-500 text-red-500' : ''}`} />
                                                            </button>
                                                            <button 
                                                                className="text-muted-foreground hover:text-primary"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    toggleBookmark(index, 'tutorial');
                                                                }}
                                                            >
                                                                <BookmarkPlus className={`h-4 w-4 ${bookmarkedItems[`tutorial-${index}`] ? 'fill-primary text-primary' : ''}`} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                                <CardFooter className="p-4 pt-0">
                                                    <Button className="w-full">
                                                        <Play className="mr-2 h-4 w-4" />
                                                        {localT('learning.watch_tutorial')}
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        </Link>
                                    </motion.div>
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
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {filteredCommunity.map((resource, index) => (
                                    <motion.div
                                        key={`community-${index}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <Link href={resource.link} className="block h-full">
                                            <Card className="h-full overflow-hidden hover:shadow-md transition-shadow duration-300">
                                                <CardHeader>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <Badge className="w-fit mb-2">
                                                                {resource.typeKey ? localT(resource.typeKey) : resource.type}
                                                            </Badge>
                                                            <CardTitle>{resource.titleKey ? localT(resource.titleKey) : resource.title}</CardTitle>
                                                        </div>
                                                        <div className="flex">
                                                            <button 
                                                                className="text-muted-foreground hover:text-primary"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    toggleBookmark(index, 'community');
                                                                }}
                                                            >
                                                                <BookmarkPlus className={`h-4 w-4 ${bookmarkedItems[`community-${index}`] ? 'fill-primary text-primary' : ''}`} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <CardDescription className="line-clamp-2">
                                                        {resource.descriptionKey ? localT(resource.descriptionKey) : resource.description}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-5 w-5 text-muted-foreground" />
                                                        <span className="text-sm">
                                                            {resource.membersKey ? localT(resource.membersKey) :
                                                            resource.participantsKey ? localT(resource.participantsKey) :
                                                                resource.contributorsKey ? localT(resource.contributorsKey) :
                                                                localT(resource.promptsKey || '')}{" "}
                                                            {resource.membersKey
                                                                ? localT('learning.members')
                                                                : resource.participantsKey
                                                                    ? localT('learning.participants')
                                                                    : resource.contributorsKey
                                                                        ? localT('learning.contributors')
                                                                        : localT('learning.prompts')}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                                <CardFooter>
                                                    <Button className="w-full">
                                                        {resource.type === "Community"
                                                            ? localT('learning.join_community')
                                                            : resource.type === "Event"
                                                                ? localT('learning.participate')
                                                                : localT('learning.explore')}
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </motion.div>

            {/* Continue learning section - for logged in users */}
            <motion.div 
                className="mb-8 border rounded-lg p-6 bg-muted/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">{localT('learning.continue')}</h2>
                    <Button variant="ghost" size="sm" className="text-sm">
                        {localT('learning.view_resources')}
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                </div>
                <div className="relative h-24 md:h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4 flex items-center">
                    <div className="flex-1">
                        <h3 className="font-medium mb-1">{localT('tutorial.2.title')}</h3>
                        <div className="flex items-center">
                            <div className="w-full max-w-xs bg-muted rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full w-2/3"></div>
                            </div>
                            <span className="text-xs ml-2 text-muted-foreground">65%</span>
                        </div>
                    </div>
                    <Button className="ml-4">
                        {localT('learning.continue')}
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}