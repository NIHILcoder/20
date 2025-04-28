"use client";

import { ParticlesBackground } from "@/components/particles-background"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Play, Star, Users, Video } from "lucide-react"
import { useLanguage, useLocalTranslation } from "@/components/language-context"

export default function LearningPage() {
    const { language } = useLanguage();

    // Page-specific translations
    const pageTranslations = {
        en: {
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

            // Tutorial items
            'tutorial.1.title': 'Getting Started with VisioMera',
            'tutorial.1.level': 'Beginner',
            'tutorial.1.author': 'VisioMera Team',
            'tutorial.1.duration': '15 min',

            'tutorial.2.title': 'Advanced Prompt Engineering',
            'tutorial.2.level': 'Intermediate',
            'tutorial.2.author': 'Prompt Expert',
            'tutorial.2.duration': '25 min',

            'tutorial.3.title': 'Mastering LoRA Models',
            'tutorial.3.level': 'Advanced',
            'tutorial.3.author': 'AI Artist Pro',
            'tutorial.3.duration': '35 min',

            // Guide items
            'guide.1.title': 'Understanding Model Parameters',
            'guide.1.description': 'Learn how different parameters affect your generations',
            'guide.1.category': 'Technical',
            'guide.1.readTime': '8 min',

            'guide.2.title': 'Creating Consistent Characters',
            'guide.2.description': 'Techniques for generating the same character across multiple images',
            'guide.2.category': 'Character Design',
            'guide.2.readTime': '12 min',

            'guide.3.title': 'Effective Negative Prompts',
            'guide.3.description': 'How to use negative prompts to improve your results',
            'guide.3.category': 'Prompting',
            'guide.3.readTime': '10 min',

            'guide.4.title': 'Composition Basics for AI Art',
            'guide.4.description': 'Apply traditional art composition rules to AI generation',
            'guide.4.category': 'Art Theory',
            'guide.4.readTime': '15 min',

            'guide.5.title': 'Working with ControlNet',
            'guide.5.description': 'Guide to using ControlNet for precise control over generations',
            'guide.5.category': 'Advanced',
            'guide.5.readTime': '20 min',

            'guide.6.title': 'Optimizing for Different Aspect Ratios',
            'guide.6.description': 'Tips for getting good results at various aspect ratios',
            'guide.6.category': 'Technical',
            'guide.6.readTime': '7 min',

            // Course items
            'course.1.title': 'AI Art Fundamentals',
            'course.1.description': 'A comprehensive introduction to AI art generation',
            'course.1.lessons': '12',
            'course.1.duration': '3 hours',
            'course.1.level': 'Beginner',
            'course.1.rating': '4.8',

            'course.2.title': 'Professional AI Art Techniques',
            'course.2.description': 'Advanced techniques for creating professional quality AI art',
            'course.2.lessons': '18',
            'course.2.duration': '5 hours',
            'course.2.level': 'Intermediate',
            'course.2.rating': '4.9',

            'course.3.title': 'Workflow Optimization',
            'course.3.description': 'Streamline your AI art generation workflow',
            'course.3.lessons': '8',
            'course.3.duration': '2 hours',
            'course.3.level': 'All Levels',
            'course.3.rating': '4.7',

            // Community resources
            'community.1.title': 'VisioMera Discord Community',
            'community.1.description': 'Join our Discord server to connect with other AI artists, share your work, and get help',
            'community.1.members': '5,200+',
            'community.1.type': 'Community',

            'community.2.title': 'Weekly Prompt Challenge',
            'community.2.description': 'Participate in our weekly prompt challenge to practice your skills and win prizes',
            'community.2.participants': '350+ weekly',
            'community.2.type': 'Event',

            'community.3.title': 'Model Showcase & Reviews',
            'community.3.description': 'Community-driven reviews and showcases of the latest AI models',
            'community.3.contributors': '120+',
            'community.3.type': 'Resource',

            'community.4.title': 'Prompt Library',
            'community.4.description': 'Browse and contribute to our community prompt library',
            'community.4.prompts': '2,500+',
            'community.4.type': 'Resource',
        },
        ru: {
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

            // Tutorial items
            'tutorial.1.title': 'Начало работы с VisioMera',
            'tutorial.1.level': 'Начинающий',
            'tutorial.1.author': 'Команда VisioMera',
            'tutorial.1.duration': '15 мин',

            'tutorial.2.title': 'Продвинутая инженерия промптов',
            'tutorial.2.level': 'Средний',
            'tutorial.2.author': 'Эксперт по промптам',
            'tutorial.2.duration': '25 мин',

            'tutorial.3.title': 'Мастерство работы с моделями LoRA',
            'tutorial.3.level': 'Продвинутый',
            'tutorial.3.author': 'ИИ-художник Pro',
            'tutorial.3.duration': '35 мин',

            // Guide items
            'guide.1.title': 'Понимание параметров модели',
            'guide.1.description': 'Узнайте, как различные параметры влияют на ваши генерации',
            'guide.1.category': 'Техническое',
            'guide.1.readTime': '8 мин',

            'guide.2.title': 'Создание стабильных персонажей',
            'guide.2.description': 'Техники для генерации одного и того же персонажа на разных изображениях',
            'guide.2.category': 'Дизайн персонажей',
            'guide.2.readTime': '12 мин',

            'guide.3.title': 'Эффективные негативные промпты',
            'guide.3.description': 'Как использовать негативные промпты для улучшения результатов',
            'guide.3.category': 'Промпты',
            'guide.3.readTime': '10 мин',

            'guide.4.title': 'Основы композиции для ИИ-искусства',
            'guide.4.description': 'Применение правил традиционной композиции к генерации ИИ',
            'guide.4.category': 'Теория искусства',
            'guide.4.readTime': '15 мин',

            'guide.5.title': 'Работа с ControlNet',
            'guide.5.description': 'Руководство по использованию ControlNet для точного контроля над генерациями',
            'guide.5.category': 'Продвинутое',
            'guide.5.readTime': '20 мин',

            'guide.6.title': 'Оптимизация для различных соотношений сторон',
            'guide.6.description': 'Советы для получения хороших результатов при различных соотношениях сторон',
            'guide.6.category': 'Техническое',
            'guide.6.readTime': '7 мин',

            // Course items
            'course.1.title': 'Основы ИИ-искусства',
            'course.1.description': 'Комплексное введение в генерацию искусства с помощью ИИ',
            'course.1.lessons': '12',
            'course.1.duration': '3 часа',
            'course.1.level': 'Начинающий',
            'course.1.rating': '4.8',

            'course.2.title': 'Профессиональные техники ИИ-искусства',
            'course.2.description': 'Продвинутые техники для создания профессионального ИИ-искусства',
            'course.2.lessons': '18',
            'course.2.duration': '5 часов',
            'course.2.level': 'Средний',
            'course.2.rating': '4.9',

            'course.3.title': 'Оптимизация рабочего процесса',
            'course.3.description': 'Оптимизируйте ваш процесс создания ИИ-искусства',
            'course.3.lessons': '8',
            'course.3.duration': '2 часа',
            'course.3.level': 'Все уровни',
            'course.3.rating': '4.7',

            // Community resources
            'community.1.title': 'Сообщество VisioMera в Discord',
            'community.1.description': 'Присоединяйтесь к нашему серверу Discord, чтобы общаться с другими ИИ-художниками, делиться работами и получать помощь',
            'community.1.members': '5,200+',
            'community.1.type': 'Сообщество',

            'community.2.title': 'Еженедельный конкурс промптов',
            'community.2.description': 'Участвуйте в нашем еженедельном конкурсе промптов, чтобы практиковаться и выигрывать призы',
            'community.2.participants': '350+ еженедельно',
            'community.2.type': 'Событие',

            'community.3.title': 'Обзоры и демонстрация моделей',
            'community.3.description': 'Обзоры и демонстрации новейших ИИ-моделей от сообщества',
            'community.3.contributors': '120+',
            'community.3.type': 'Ресурс',

            'community.4.title': 'Библиотека промптов',
            'community.4.description': 'Просматривайте и пополняйте нашу общую библиотеку промптов',
            'community.4.prompts': '2,500+',
            'community.4.type': 'Ресурс',
        }
    };

    const { localT } = useLocalTranslation(pageTranslations);

    // Tutorial data with translation keys
    const tutorials = [
        {
            titleKey: 'tutorial.1.title',
            image: "/placeholder.svg?height=300&width=500&text=Getting+Started",
            durationKey: 'tutorial.1.duration',
            levelKey: 'tutorial.1.level',
            authorKey: 'tutorial.1.author',
        },
        {
            titleKey: 'tutorial.2.title',
            image: "/placeholder.svg?height=300&width=500&text=Prompt+Engineering",
            durationKey: 'tutorial.2.duration',
            levelKey: 'tutorial.2.level',
            authorKey: 'tutorial.2.author',
        },
        {
            titleKey: 'tutorial.3.title',
            image: "/placeholder.svg?height=300&width=500&text=LoRA+Models",
            durationKey: 'tutorial.3.duration',
            levelKey: 'tutorial.3.level',
            authorKey: 'tutorial.3.author',
        },
    ];

    // Guide data with translation keys
    const guides = [
        {
            titleKey: 'guide.1.title',
            descriptionKey: 'guide.1.description',
            categoryKey: 'guide.1.category',
            readTimeKey: 'guide.1.readTime',
        },
        {
            titleKey: 'guide.2.title',
            descriptionKey: 'guide.2.description',
            categoryKey: 'guide.2.category',
            readTimeKey: 'guide.2.readTime',
        },
        {
            titleKey: 'guide.3.title',
            descriptionKey: 'guide.3.description',
            categoryKey: 'guide.3.category',
            readTimeKey: 'guide.3.readTime',
        },
        {
            titleKey: 'guide.4.title',
            descriptionKey: 'guide.4.description',
            categoryKey: 'guide.4.category',
            readTimeKey: 'guide.4.readTime',
        },
        {
            titleKey: 'guide.5.title',
            descriptionKey: 'guide.5.description',
            categoryKey: 'guide.5.category',
            readTimeKey: 'guide.5.readTime',
        },
        {
            titleKey: 'guide.6.title',
            descriptionKey: 'guide.6.description',
            categoryKey: 'guide.6.category',
            readTimeKey: 'guide.6.readTime',
        },
    ];

    // Course data with translation keys
    const courses = [
        {
            titleKey: 'course.1.title',
            descriptionKey: 'course.1.description',
            lessonsKey: 'course.1.lessons',
            durationKey: 'course.1.duration',
            levelKey: 'course.1.level',
            ratingKey: 'course.1.rating',
        },
        {
            titleKey: 'course.2.title',
            descriptionKey: 'course.2.description',
            lessonsKey: 'course.2.lessons',
            durationKey: 'course.2.duration',
            levelKey: 'course.2.level',
            ratingKey: 'course.2.rating',
        },
        {
            titleKey: 'course.3.title',
            descriptionKey: 'course.3.description',
            lessonsKey: 'course.3.lessons',
            durationKey: 'course.3.duration',
            levelKey: 'course.3.level',
            ratingKey: 'course.3.rating',
        },
    ];

    // Community resources data with translation keys
    const communityResources = [
        {
            titleKey: 'community.1.title',
            descriptionKey: 'community.1.description',
            membersKey: 'community.1.members',
            typeKey: 'community.1.type',
            type: "Community",
        },
        {
            titleKey: 'community.2.title',
            descriptionKey: 'community.2.description',
            participantsKey: 'community.2.participants',
            typeKey: 'community.2.type',
            type: "Event",
        },
        {
            titleKey: 'community.3.title',
            descriptionKey: 'community.3.description',
            contributorsKey: 'community.3.contributors',
            typeKey: 'community.3.type',
            type: "Resource",
        },
        {
            titleKey: 'community.4.title',
            descriptionKey: 'community.4.description',
            promptsKey: 'community.4.prompts',
            typeKey: 'community.4.type',
            type: "Resource",
        },
    ];

    return (
        <div className="container relative mx-auto py-8">
            <ParticlesBackground />

            <div className="mb-8 space-y-4">
                <h1 className="text-3xl font-bold">{localT('learning.title')}</h1>
                <p className="text-muted-foreground">{localT('learning.subtitle')}</p>
            </div>

            <div className="mb-8">
                <h2 className="mb-4 text-2xl font-bold">{localT('learning.featured_tutorials')}</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tutorials.map((tutorial, index) => (
                        <Card key={index} className="overflow-hidden group">
                            <div className="relative aspect-video">
                                <img
                                    src={tutorial.image || "/placeholder.svg"}
                                    alt={localT(tutorial.titleKey || '')}
                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
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
                                <h3 className="font-bold">{localT(tutorial.titleKey || '')}</h3>
                                <p className="text-sm text-muted-foreground">{localT('learning.by_author')} {localT(tutorial.authorKey || '')}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <Badge variant="secondary">
                                        <Clock className="mr-1 h-3 w-3" />
                                        {localT(tutorial.durationKey || '')}
                                    </Badge>
                                    <Badge variant="secondary">
                                        <BookOpen className="mr-1 h-3 w-3" />
                                        {localT(tutorial.levelKey || '')}
                                    </Badge>
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                                <Button className="w-full">
                                    <Play className="mr-2 h-4 w-4" />
                                    {localT('learning.watch_tutorial')}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="mb-8">
                <Tabs defaultValue="guides">
                    <TabsList className="mb-4">
                        <TabsTrigger value="guides">{localT('learning.tab.guides')}</TabsTrigger>
                        <TabsTrigger value="courses">{localT('learning.tab.courses')}</TabsTrigger>
                        <TabsTrigger value="community">{localT('learning.tab.community')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="guides" className="mt-0">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {guides.map((guide, index) => (
                                <Card key={index} className="flex overflow-hidden">
                                    <CardContent className="flex-1 p-4">
                                        <Badge className="mb-2">{localT(guide.categoryKey || '')}</Badge>
                                        <h3 className="font-bold">{localT(guide.titleKey || '')}</h3>
                                        <p className="text-sm text-muted-foreground">{localT(guide.descriptionKey || '')}</p>
                                        <div className="mt-2 flex items-center text-xs text-muted-foreground">
                                            <Clock className="mr-1 h-3 w-3" />
                                            {localT(guide.readTimeKey || '')} {localT('learning.read_time')}
                                        </div>
                                    </CardContent>
                                    <div className="flex w-24 items-center justify-center bg-muted">
                                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="courses" className="mt-0">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {courses.map((course, index) => (
                                <Card key={index} className="overflow-hidden">
                                    <CardHeader className="pb-2">
                                        <CardTitle>{localT(course.titleKey || '')}</CardTitle>
                                        <CardDescription>{localT(course.descriptionKey || '')}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">{localT('learning.lessons')}</span>
                                                <span className="font-medium">{localT(course.lessonsKey || '')}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">{localT('learning.duration')}</span>
                                                <span className="font-medium">{localT(course.durationKey || '')}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">{localT('learning.level')}</span>
                                                <Badge variant="outline">{localT(course.levelKey || '')}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">{localT('learning.rating')}</span>
                                                <div className="flex items-center">
                                                    <Star className="mr-1 h-4 w-4 fill-yellow-500 text-yellow-500" />
                                                    <span className="font-medium">{localT(course.ratingKey || '')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full">{localT('learning.enroll_now')}</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="community" className="mt-0">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {communityResources.map((resource, index) => (
                                <Card key={index} className="overflow-hidden">
                                    <CardHeader>
                                        <Badge className="w-fit">{localT(resource.typeKey || '')}</Badge>
                                        <CardTitle>{localT(resource.titleKey || '')}</CardTitle>
                                        <CardDescription>{localT(resource.descriptionKey || '')}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-muted-foreground" />
                                            <span className="text-sm">
                        {resource.membersKey ? localT(resource.membersKey || '') :
                            resource.participantsKey ? localT(resource.participantsKey || '') :
                                resource.contributorsKey ? localT(resource.contributorsKey || '') :
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
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}