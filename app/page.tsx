"use client";
import { EnhancedParticlesBackground } from "@/components/enhanced-particles-background"
import { ImprovedGenerationForm } from "@/components/improved-generation-form"
import { useLanguage } from "@/components/language-context"
import { motion } from "framer-motion";

export default function EnhancedHomePage() {
    const { language } = useLanguage();
    const pageTranslations = {
        'home.subtitle': {
            en: 'Transform your imagination into stunning visuals with our AI-powered creative platform',
            ru: 'Превратите ваше воображение в потрясающие визуальные образы с нашей креативной платформой на базе ИИ'
        },
        'home.feature.rapid.title': {
            en: 'Rapid Generation',
            ru: 'Быстрая генерация'
        },
        'home.feature.rapid.desc': {
            en: 'Create images in seconds with our optimized models',
            ru: 'Создавайте изображения за секунды с нашими оптимизированными моделями'
        },
        'home.feature.prompts.title': {
            en: 'AI-Enhanced Prompts',
            ru: 'ИИ-улучшенные промпты'
        },
        'home.feature.prompts.desc': {
            en: 'Get better results with our intelligent prompt enhancement',
            ru: 'Получайте лучшие результаты с нашим интеллектуальным улучшением промптов'
        },
        'home.feature.options.title': {
            en: 'Advanced Options',
            ru: 'Расширенные настройки'
        },
        'home.feature.options.desc': {
            en: 'Fine-tune your generation with powerful controls',
            ru: 'Тонко настраивайте генерацию с помощью мощных элементов управления'
        }
    };

    const getPageTranslation = (key: string) => {
        const currentLang = language as keyof typeof pageTranslations[typeof key];
        if (pageTranslations[key] && pageTranslations[key][currentLang]) {
            return pageTranslations[key][currentLang];
        }
        return key;
    };

    return (
        <div className="w-full h-full relative">
            <EnhancedParticlesBackground variant="sparkles" density={40} />
            <div className="w-full mx-auto h-full max-w-full py-4">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 px-3"
                >
                    {getPageTranslation('home.subtitle')}
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex flex-wrap justify-center gap-4 mt-6 px-4"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-6xl">
                        <div className="bg-card/60 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors duration-300 rounded-lg">
                            <div className="p-4 flex flex-col items-center text-center">
                                <div className="rounded-full bg-primary/10 p-3 mb-3">
                                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary">
                                        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                    </svg>
                                </div>
                                <h3 className="font-medium mb-1">{getPageTranslation('home.feature.rapid.title')}</h3>
                                <p className="text-sm text-muted-foreground">{getPageTranslation('home.feature.rapid.desc')}</p>
                            </div>
                        </div>
                        <div className="bg-card/60 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors duration-300 rounded-lg">
                            <div className="p-4 flex flex-col items-center text-center">
                                <div className="rounded-full bg-primary/10 p-3 mb-3">
                                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary">
                                        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                                    </svg>
                                </div>
                                <h3 className="font-medium mb-1">{getPageTranslation('home.feature.prompts.title')}</h3>
                                <p className="text-sm text-muted-foreground">{getPageTranslation('home.feature.prompts.desc')}</p>
                            </div>
                        </div>
                        <div className="bg-card/60 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors duration-300 rounded-lg">
                            <div className="p-4 flex flex-col items-center text-center">
                                <div className="rounded-full bg-primary/10 p-3 mb-3">
                                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary">
                                        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                                <h3 className="font-medium mb-1">{getPageTranslation('home.feature.options.title')}</h3>
                                <p className="text-sm text-muted-foreground">{getPageTranslation('home.feature.options.desc')}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="w-full px-4 py-4">
                    <ImprovedGenerationForm />
                </div>
            </div>
        </div>
    );
}