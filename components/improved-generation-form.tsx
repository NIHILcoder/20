import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Save,
    Share2,
    Download,
    Upload,
    Copy,
    RefreshCw,
    Wand2,
    Plus,
    RotateCw,
    ZoomIn,
    ZoomOut,
    Image,
    Lightbulb,
    X,
    Check,
    Info,
    HelpCircle,
    Palette,
    FileCode,
    Eye,
    Grid,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-context";

const fadeInOut = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
};

const slideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const scale = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
};

const pulse = {
    hidden: { scale: 1 },
    visible: {
        scale: [1, 1.05, 1],
        transition: {
            repeat: Infinity,
            repeatType: "loop" as const,
            duration: 2
        }
    }
};

interface Model {
    id: string;
    name: string;
    image: string;
}

interface Sampler {
    id: string;
    name: string;
}

interface Tag {
    id: string;
    text: string;
}

interface AspectRatio {
    id: string;
    name: string;
}

interface StylePreset {
    id: string;
    name: string;
    image: string;
}

interface SizeOption {
    id: string;
    name: string;
    description: string;
}

interface Upscaler {
    id: string;
    name: string;
}

interface Notification {
    message: string;
    visible: boolean;
}

export const ImprovedGenerationForm: React.FC = () => {
    const { language } = useLanguage();
    const [generating, setGenerating] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>("");
    const [negativePrompt, setNegativePrompt] = useState<string>("");

    // UI settings
    const [showTagSuggestions, setShowTagSuggestions] = useState<boolean>(false);
    const [zoomLevel, setZoomLevel] = useState<number>(100);
    const [activeTab, setActiveTab] = useState<string>("basic");
    const [aspectRatio, setAspectRatio] = useState<string>("1:1");
    const [selectedSize, setSelectedSize] = useState<string>("1024");
    const [showVisualization, setShowVisualization] = useState<boolean>(false);
    const [enhancePrompt, setEnhancePrompt] = useState<boolean>(false);
    const [selectedModel, setSelectedModel] = useState<string>("flux");
    const [steps, setSteps] = useState<number>(30);
    const [cfgScale, setCfgScale] = useState<number>(7);
    const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 1000000000));
    const [useRandomSeed, setUseRandomSeed] = useState<boolean>(true);
    const [sampler, setSampler] = useState<string>("euler_a");
    const [batchCount, setBatchCount] = useState<number>(1);
    const [strength, setStrength] = useState<number>(0.75);
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const [showTips, setShowTips] = useState<boolean>(false);
    const [selectedUpscaler, setSelectedUpscaler] = useState<string>("esrgan");
    const [hiresFixEnabled, setHiresFixEnabled] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [notification, setNotification] = useState<Notification>({message: '', visible: false});
    const [lastCopiedPrompt, setLastCopiedPrompt] = useState<string>("");
    const [processingStage, setProcessingStage] = useState<string>("");
    const [promptFocused, setPromptFocused] = useState<boolean>(false);
    const [showComplexityVisualization, setShowComplexityVisualization] = useState<boolean>(false);
    const [recentGenerations, setRecentGenerations] = useState<string[]>([]);

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const promptInputRef = useRef<HTMLTextAreaElement>(null);
    const generationContainerRef = useRef<HTMLDivElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    // Translation resources
    const formTranslations = {
        'form.title': {
            en: 'Image Settings',
            ru: 'Настройки изображения'
        },
        'form.configure_parameters': {
            en: 'Configure your generation parameters',
            ru: 'Настройка параметров генерации'
        },
        'form.basic': {
            en: 'Basic',
            ru: 'Основные'
        },
        'form.advanced': {
            en: 'Advanced',
            ru: 'Расширенные'
        },
        'form.prompt': {
            en: 'Prompt',
            ru: 'Промпт'
        },
        'form.ai_enhance': {
            en: 'AI Enhance',
            ru: 'ИИ-улучшение'
        },
        'form.prompt_placeholder': {
            en: 'Describe your image in detail... (e.g., A serene landscape with mountains, a calm lake under twilight sky with stars beginning to appear)',
            ru: 'Опишите ваше изображение подробно... (например, Спокойный пейзаж с горами, тихое озеро в сумерках с появляющимися звездами)'
        },
        'form.suggestions': {
            en: 'Suggestions',
            ru: 'Подсказки'
        },
        'form.save_prompt': {
            en: 'Save Prompt',
            ru: 'Сохранить промпт'
        },
        'form.negative_prompt': {
            en: 'Negative Prompt',
            ru: 'Негативный промпт'
        },
        'form.negative_prompt_placeholder': {
            en: 'Elements to avoid in the image... (e.g., blurry, bad anatomy, distorted, watermark, signature)',
            ru: 'Элементы, которых следует избегать в изображении... (например, размытость, плохая анатомия, искажения, водяной знак, подпись)'
        },
        'form.style_presets': {
            en: 'Style Presets',
            ru: 'Стилевые пресеты'
        },
        'form.reset': {
            en: 'Reset',
            ru: 'Сбросить'
        },
        'form.model_selection': {
            en: 'Model Selection',
            ru: 'Выбор модели'
        },
        'form.size': {
            en: 'Image Size',
            ru: 'Размер изображения'
        },
        'form.seed': {
            en: 'Seed',
            ru: 'Сид'
        },
        'form.random': {
            en: 'Random',
            ru: 'Случайный'
        },
        'form.steps': {
            en: 'Sampling Steps',
            ru: 'Шаги сэмплирования'
        },
        'form.cfg': {
            en: 'CFG Scale',
            ru: 'CFG Scale'
        },
        'form.sampler': {
            en: 'Sampler',
            ru: 'Сэмплер'
        },
        'form.batch': {
            en: 'Batch Size',
            ru: 'Количество изображений'
        },
        'form.img2img': {
            en: 'Image to Image',
            ru: 'Изображение в изображение'
        },
        'form.drop_image': {
            en: 'Drop your image here',
            ru: 'Перетащите изображение сюда'
        },
        'form.strength': {
            en: 'Transformation Strength',
            ru: 'Сила преобразования'
        },
        'form.mild': {
            en: 'Mild',
            ru: 'Мягкое'
        },
        'form.complete': {
            en: 'Complete',
            ru: 'Полное'
        },
        'form.additional': {
            en: 'Additional Parameters',
            ru: 'Дополнительные параметры'
        },
        'form.hires': {
            en: 'Hires.fix (improves details)',
            ru: 'Hires.fix (улучшает детали)'
        },
        'form.upscaler': {
            en: 'Upscaler',
            ru: 'Апскейлер'
        },
        'form.complexity': {
            en: 'Generation Complexity',
            ru: 'Сложность генерации'
        },
        'form.fast': {
            en: 'Fast',
            ru: 'Быстрая'
        },
        'form.medium': {
            en: 'Medium',
            ru: 'Средняя'
        },
        'form.complex': {
            en: 'Complex',
            ru: 'Сложная'
        },
        'form.generate': {
            en: 'Generate',
            ru: 'Сгенерировать'
        },
        'form.generating': {
            en: 'Generating...',
            ru: 'Генерация...'
        },
        'form.preview': {
            en: 'Preview',
            ru: 'Предпросмотр'
        },
        'form.image_will_appear': {
            en: 'Your generated image will appear here',
            ru: 'Ваше сгенерированное изображение появится здесь'
        },
        'form.start_with_prompt': {
            en: 'Start by entering a detailed prompt',
            ru: 'Начните с ввода подробного промпта'
        },
        'form.creating': {
            en: 'Creating your masterpiece...',
            ru: 'Создаем ваш шедевр...'
        },
        'form.stage.analyzing': {
            en: 'Analyzing your prompt...',
            ru: 'Анализируем ваш промпт...'
        },
        'form.stage.elements': {
            en: 'Gathering visual elements...',
            ru: 'Собираем визуальные элементы...'
        },
        'form.stage.composition': {
            en: 'Creating composition...',
            ru: 'Создаём композицию...'
        },
        'form.stage.details': {
            en: 'Adding details and refinements...',
            ru: 'Добавляем детали и улучшения...'
        },
        'form.stage.final': {
            en: 'Applying final touches...',
            ru: 'Применяем финальные штрихи...'
        },
        'form.save': {
            en: 'Save',
            ru: 'Сохранить'
        },
        'form.download': {
            en: 'Download',
            ru: 'Скачать'
        },
        'form.variations': {
            en: 'Variations',
            ru: 'Вариации'
        },
        'form.share': {
            en: 'Share',
            ru: 'Поделиться'
        },
        'form.previous': {
            en: 'Previous Generations',
            ru: 'Предыдущие генерации'
        },
        'form.show_all': {
            en: 'Show all',
            ru: 'Показать все'
        },
        'form.prompt_viz': {
            en: 'Prompt Visualization',
            ru: 'Визуализация промпта'
        },
        'form.viz_desc': {
            en: 'View active keywords in your prompt',
            ru: 'Просмотр активных ключевых слов в промпте'
        },
        'form.style_pred': {
            en: 'Style Prediction',
            ru: 'Предсказание стиля'
        },
        'form.pred_desc': {
            en: 'Automatic style analysis based on your prompt',
            ru: 'Автоматический анализ стиля на основе вашего промпта'
        },
        'form.tips.title': {
            en: 'Prompt Writing Tips',
            ru: 'Советы по написанию промптов'
        },
        'form.tips.specific': {
            en: 'Be specific about details: "portrait of a young woman with blue eyes"',
            ru: 'Будьте конкретны в деталях: "портрет молодой женщины с голубыми глазами"'
        },
        'form.tips.style': {
            en: 'Specify style: "photorealistic", "anime", "oil painting"',
            ru: 'Указывайте стиль: "фотореалистичный", "аниме", "масляная живопись"'
        },
        'form.tips.lighting': {
            en: 'Describe lighting: "soft evening light", "dramatic shadows"',
            ru: 'Описывайте освещение: "мягкое вечернее освещение", "контрастные тени"'
        },
        'form.tips.quality': {
            en: 'Add quality tags: "detailed", "high resolution"',
            ru: 'Добавляйте теги качества: "детализированный", "высокое разрешение"'
        }
    };

    const getTranslation = (key: string) => {
        // @ts-ignore
        const currentLang = language as keyof typeof formTranslations[typeof key];
        // @ts-ignore
        if (formTranslations[key] && formTranslations[key][currentLang]) {
            // @ts-ignore
            return formTranslations[key][currentLang];
        }
        return key;
    };

    // Available models, samplers, tags, etc.
    const availableModels: Model[] = [
        { id: "flux", name: "Flux Realistic", image: "/placeholder.svg?height=80&width=80&text=Flux" },
        { id: "anime", name: "Anime Diffusion", image: "/placeholder.svg?height=80&width=80&text=Anime" },
        { id: "dreamshaper", name: "Dreamshaper", image: "/placeholder.svg?height=80&width=80&text=Dream" },
        { id: "realistic", name: "Realistic Vision", image: "/placeholder.svg?height=80&width=80&text=Real" }
    ];

    const availableSamplers: Sampler[] = [
        { id: "euler_a", name: "Euler Ancestral" },
        { id: "euler", name: "Euler" },
        { id: "ddim", name: "DDIM" },
        { id: "dpm_2", name: "DPM++ 2M" },
        { id: "dpm_2_a", name: "DPM++ 2M Ancestral" },
        { id: "lcm", name: "LCM" }
    ];

    const commonTags: Tag[] = [
        { id: "detailed", text: "детализированный" },
        { id: "high_quality", text: "высокое качество" },
        { id: "photorealistic", text: "фотореалистичный" },
        { id: "8k", text: "8k" },
        { id: "cinematic", text: "кинематографическое освещение" },
        { id: "sharp_focus", text: "резкий фокус" },
        { id: "studio_quality", text: "студийное качество" },
        { id: "professional", text: "профессиональный" }
    ];

    const aspectRatios: AspectRatio[] = [
        { id: "1:1", name: "1:1 Квадрат" },
        { id: "4:3", name: "4:3 Стандарт" },
        { id: "16:9", name: "16:9 Широкоэкранный" },
        { id: "9:16", name: "9:16 Портрет" },
        { id: "2:3", name: "2:3 Портрет" },
        { id: "3:2", name: "3:2 Пейзаж" }
    ];

    const stylePresets: StylePreset[] = [
        { id: "realistic", name: "Реалистичный", image: "/placeholder.svg?height=60&width=60&text=Реал" },
        { id: "anime", name: "Аниме", image: "/placeholder.svg?height=60&width=60&text=Аниме" },
        { id: "oil_painting", name: "Масло", image: "/placeholder.svg?height=60&width=60&text=Масло" },
        { id: "watercolor", name: "Акварель", image: "/placeholder.svg?height=60&width=60&text=Аква" },
        { id: "3d", name: "3D Рендер", image: "/placeholder.svg?height=60&width=60&text=3D" },
        { id: "sketch", name: "Скетч", image: "/placeholder.svg?height=60&width=60&text=Скетч" },
        { id: "pixel", name: "Пиксель-арт", image: "/placeholder.svg?height=60&width=60&text=Пиксель" },
        { id: "fantasy", name: "Фэнтези", image: "/placeholder.svg?height=60&width=60&text=Фэнтези" }
    ];

    const sizeOptions: SizeOption[] = [
        { id: "512", name: "512×512", description: "Малый" },
        { id: "768", name: "768×768", description: "Средний" },
        { id: "1024", name: "1024×1024", description: "Высокий" },
        { id: "1536", name: "1536×1536", description: "Ультра" },
    ];

    const upscalers: Upscaler[] = [
        { id: "esrgan", name: "ESRGAN" },
        { id: "latent", name: "Latent Upscaler" },
        { id: "gfpgan", name: "GFPGAN Face Restoration" }
    ];

    // Update processing stage based on progress
    useEffect(() => {
        if (generating) {
            if (progress < 25) {
                setProcessingStage(getTranslation('form.stage.analyzing'));
            } else if (progress < 50) {
                setProcessingStage(getTranslation('form.stage.elements'));
            } else if (progress < 75) {
                setProcessingStage(getTranslation('form.stage.composition'));
            } else if (progress < 95) {
                setProcessingStage(getTranslation('form.stage.details'));
            } else {
                setProcessingStage(getTranslation('form.stage.final'));
            }
        }
    }, [progress, generating, language]);

    // Calculate generation complexity based on parameters
    const calculateComplexity = (): number => {
        let complexity = steps;
        complexity += Math.round(cfgScale * 3);
        complexity += selectedSize === "1536" ? 60 : selectedSize === "1024" ? 30 : selectedSize === "768" ? 15 : 0;
        complexity += hiresFixEnabled ? 20 : 0;
        return Math.min(100, Math.max(10, complexity / 2));
    };

    // Event handlers
    const handleGenerate = (): void => {
        if (!prompt.trim()) return;
        setGenerating(true);
        setProgress(0);
        let currentProgress = 0;

        // Save previous image if exists
        if (generatedImage) {
            setRecentGenerations(prev =>
                [generatedImage, ...(prev.length >= 6 ? prev.slice(0, 5) : prev)]
            );
        }

        // Loading animation
        const interval = setInterval(() => {
            let step = Math.max(0.5, 5 - (currentProgress / 20));
            currentProgress += step;
            if (currentProgress >= 100) {
                clearInterval(interval);
                setGenerating(false);
                // Create fake image for demonstration
                setGeneratedImage(`/placeholder.svg?height=${selectedSize}&width=${selectedSize}&text=Сгенерированное+Изображение`);
                return;
            }
            setProgress(currentProgress);
        }, 100);
    };

    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setPrompt(e.target.value);
        if (e.target.value.length > 0) {
            setShowTagSuggestions(true);
        }
    };

    const addTagToPrompt = (tag: string): void => {
        if (prompt.trim().length > 0 && !prompt.endsWith(' ')) {
            setPrompt(prev => `${prev}, ${tag}`);
        } else {
            setPrompt(prev => `${prev}${tag}`);
        }
        promptInputRef.current?.focus();
        showNotification('Тег добавлен в промпт');
    };

    const copyPromptToClipboard = (): void => {
        navigator.clipboard.writeText(prompt);
        setLastCopiedPrompt(prompt);
        showNotification('Промпт скопирован в буфер обмена');
    };

    const showNotification = (message: string): void => {
        setNotification({
            message,
            visible: true
        });
        setTimeout(() => {
            setNotification({
                message: '',
                visible: false
            });
        }, 2000);
    };

    const randomizeSeed = (): void => {
        setSeed(Math.floor(Math.random() * 1000000000));
    };

    const handleFileUpload = (): void => {
        fileInputRef.current?.click();
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file: File): void => {
        if (!file.type.startsWith('image/')) return;
        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            const result = e.target?.result;
            if (typeof result === 'string') {
                setTimeout(() => {
                    setSourceImage(result);
                    setIsUploading(false);
                }, 1000);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            processFile(file);
        }
    };

    useEffect(() => {
        const dropZone = dropZoneRef.current;
        if (!dropZone) return;
        const handleDragEnterEvent = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
        };
        const handleDragLeaveEvent = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
        };
        const handleDragOverEvent = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };
        const handleDropEvent = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                processFile(file);
            }
        };
        dropZone.addEventListener('dragenter', handleDragEnterEvent);
        dropZone.addEventListener('dragleave', handleDragLeaveEvent);
        dropZone.addEventListener('dragover', handleDragOverEvent);
        dropZone.addEventListener('drop', handleDropEvent);
        return () => {
            dropZone.removeEventListener('dragenter', handleDragEnterEvent);
            dropZone.removeEventListener('dragleave', handleDragLeaveEvent);
            dropZone.removeEventListener('dragover', handleDragOverEvent);
            dropZone.removeEventListener('drop', handleDropEvent);
        };
    }, []);

    const renderComplexityVisualization = () => {
        const complexity = calculateComplexity();
        return (
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInOut}
                className="mt-3 space-y-2"
            >
                <div className="flex justify-between items-center">
                    <span className="text-xs font-medium">{getTranslation('form.complexity')}</span>
                    <span className="text-xs">{Math.round(complexity)}%</span>
                </div>
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${complexity}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full rounded-full ${
                            complexity < 33 ? "bg-green-500" :
                                complexity < 66 ? "bg-yellow-500" :
                                    "bg-red-500"
                        }`}
                    />
                </div>
                <div className="grid grid-cols-3">
                    <div className="text-xs text-green-500 text-left">{getTranslation('form.fast')}</div>
                    <div className="text-xs text-yellow-500 text-center">{getTranslation('form.medium')}</div>
                    <div className="text-xs text-red-500 text-right">{getTranslation('form.complex')}</div>
                </div>
            </motion.div>
        );
    };

    const renderParameterVisualization = (
        parameter: string,
        value: number,
        min: number,
        max: number,
        descriptions?: { min?: string; max?: string }
    ) => {
        const percentage = ((value - min) / (max - min)) * 100;
        return (
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInOut}
                className="mt-1"
            >
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-primary rounded-full"
                    />
                </div>
                <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{descriptions?.min || min}</span>
                    <span className="text-xs text-muted-foreground">{descriptions?.max || max}</span>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="w-full max-w-full">
            {/* Notification */}
            <AnimatePresence>
                {notification.visible && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={fadeInOut}
                        className="fixed top-20 right-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
                    >
                        <Check className="h-4 w-4" />
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full">
                {/* Settings panel */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="lg:col-span-5"
                >
                    <Card className="shadow-sm border-muted/80 hover:border-primary/30 transition-colors duration-300">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">{getTranslation('form.title')}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                                        <SelectTrigger className="w-[110px] h-8 text-xs">
                                            <SelectValue placeholder="Соотношение" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {aspectRatios.map((ratio) => (
                                                <SelectItem key={ratio.id} value={ratio.id}>{ratio.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => setShowTips(!showTips)}
                                                >
                                                    <HelpCircle className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Советы по промптам</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                            <CardDescription className="text-xs">{getTranslation('form.configure_parameters')}</CardDescription>
                        </CardHeader>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <div className="px-4">
                                <TabsList className="w-full">
                                    <TabsTrigger value="basic" className="flex-1 text-xs py-1">
                                        {getTranslation('form.basic')}
                                    </TabsTrigger>
                                    <TabsTrigger value="advanced" className="flex-1 text-xs py-1">
                                        {getTranslation('form.advanced')}
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                            {/* Basic tab */}
                            <TabsContent value="basic" className="pt-1">
                                <CardContent className="space-y-3 p-4">
                                    {/* Tips */}
                                    <AnimatePresence>
                                        {showTips && (
                                            <motion.div
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                variants={scale}
                                                className="mb-3 p-3 bg-primary/5 border border-primary/10 rounded-md"
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Lightbulb className="h-4 w-4 text-primary" />
                                                    <h4 className="text-sm font-medium">{getTranslation('form.tips.title')}</h4>
                                                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto" onClick={() => setShowTips(false)}>
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <ul className="text-xs space-y-1 pl-6 list-disc">
                                                    <li>{getTranslation('form.tips.specific')}</li>
                                                    <li>{getTranslation('form.tips.style')}</li>
                                                    <li>{getTranslation('form.tips.lighting')}</li>
                                                    <li>{getTranslation('form.tips.quality')}</li>
                                                </ul>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Prompt */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label
                                                htmlFor="prompt"
                                                className={`text-sm font-medium transition-colors duration-200 ${promptFocused ? "text-primary" : ""}`}
                                            >
                                                {getTranslation('form.prompt')}
                                            </Label>
                                            <div className="flex items-center space-x-1">
                                                <Switch
                                                    id="enhance-prompt"
                                                    checked={enhancePrompt}
                                                    onCheckedChange={setEnhancePrompt}
                                                    className="data-[state=checked]:bg-primary"
                                                />
                                                <Label htmlFor="enhance-prompt" className="text-xs">{getTranslation('form.ai_enhance')}</Label>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                <Lightbulb className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>ИИ улучшит ваш промпт дополнительными деталями</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <Textarea
                                                id="prompt"
                                                placeholder={getTranslation('form.prompt_placeholder')}
                                                className={cn(
                                                    "min-h-[100px] resize-none text-sm transition-all duration-300",
                                                    promptFocused ? "border-primary ring-1 ring-primary" : ""
                                                )}
                                                value={prompt}
                                                onChange={handlePromptChange}
                                                ref={promptInputRef}
                                                onFocus={() => setPromptFocused(true)}
                                                onBlur={() => setPromptFocused(false)}
                                            />
                                            {enhancePrompt && (
                                                <motion.div
                                                    className="absolute right-2 bottom-2 text-primary"
                                                    initial="hidden"
                                                    animate="visible"
                                                    variants={pulse}
                                                >
                                                    <Sparkles className="h-4 w-4" />
                                                </motion.div>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowTagSuggestions(!showTagSuggestions)}
                                                className="text-xs h-7 relative overflow-hidden group"
                                            >
                                              <span className="relative z-10 flex items-center">
                                                <Plus className="mr-1 h-3 w-3 group-hover:rotate-90 transition-transform duration-200" />
                                                  {getTranslation('form.suggestions')}
                                              </span>
                                                <span className="absolute inset-0 bg-primary/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200"></span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs h-7 relative overflow-hidden group"
                                                onClick={copyPromptToClipboard}
                                            >
                                              <span className="relative z-10 flex items-center">
                                                {lastCopiedPrompt === prompt ? (
                                                    <Check className="mr-1 h-3 w-3 text-green-500" />
                                                ) : (
                                                    <Copy className="mr-1 h-3 w-3 group-hover:scale-110 transition-transform duration-200" />
                                                )}
                                                  {getTranslation('form.save_prompt')}
                                              </span>
                                                <span className="absolute inset-0 bg-primary/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200"></span>
                                            </Button>
                                        </div>

                                        {/* Tag suggestions */}
                                        <AnimatePresence>
                                            {showTagSuggestions && (
                                                <motion.div
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    variants={slideUp}
                                                    className="rounded-md border bg-card p-2 shadow-sm"
                                                >
                                                    <h4 className="mb-1 text-xs font-medium">Популярные теги</h4>
                                                    <div className="flex flex-wrap gap-1">
                                                        {commonTags.map((tag) => (
                                                            <Badge
                                                                key={tag.id}
                                                                variant="outline"
                                                                className="cursor-pointer hover:bg-primary/10 text-xs transform hover:scale-105 transition-transform duration-200"
                                                                onClick={() => addTagToPrompt(tag.text)}
                                                            >
                                                                {tag.text}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Negative prompt */}
                                    <div className="space-y-1">
                                        <Label htmlFor="negative-prompt" className="text-sm font-medium">
                                            {getTranslation('form.negative_prompt')}
                                        </Label>
                                        <Textarea
                                            id="negative-prompt"
                                            placeholder={getTranslation('form.negative_prompt_placeholder')}
                                            className="min-h-[60px] resize-none text-sm"
                                            value={negativePrompt}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNegativePrompt(e.target.value)}
                                        />
                                    </div>

                                    {/* Style presets */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium">{getTranslation('form.style_presets')}</Label>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-xs"
                                                onClick={() => setSelectedStyle(null)}
                                            >
                                                {getTranslation('form.reset')}
                                            </Button>
                                        </div>
                                        <ScrollArea className="h-[100px] w-full rounded-md border">
                                            <div className="flex flex-wrap gap-2 p-2">
                                                {stylePresets.map((style) => (
                                                    <div
                                                        key={style.id}
                                                        onClick={() => setSelectedStyle(style.id)}
                                                        className={cn(
                                                            "flex cursor-pointer flex-col items-center gap-1 rounded-md border p-1.5 transition-all hover:border-primary hover:bg-secondary/50",
                                                            selectedStyle === style.id && "border-primary bg-primary/5"
                                                        )}
                                                    >
                                                        <img
                                                            src={style.image}
                                                            alt={style.name}
                                                            className="h-10 w-10 rounded-md object-cover"
                                                        />
                                                        <span className="text-[10px]">{style.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>

                                    {/* Model selection */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">{getTranslation('form.model_selection')}</Label>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {availableModels.map((model) => (
                                                <motion.div
                                                    key={model.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={cn(
                                                        "flex cursor-pointer flex-col items-center gap-1 rounded-md border p-1.5 transition-all hover:border-primary hover:bg-secondary/50",
                                                        selectedModel === model.id && "border-primary bg-primary/5"
                                                    )}
                                                    onClick={() => setSelectedModel(model.id)}
                                                >
                                                    <img
                                                        src={model.image}
                                                        alt={model.name}
                                                        className="h-10 w-10 rounded-md object-cover"
                                                    />
                                                    <span className="text-center text-xs">{model.name}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Size options */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">{getTranslation('form.size')}</Label>
                                        <div className="grid grid-cols-4 gap-1">
                                            {sizeOptions.map((size) => (
                                                <div
                                                    key={size.id}
                                                    onClick={() => setSelectedSize(size.id)}
                                                    className={cn(
                                                        "flex cursor-pointer flex-col items-center rounded-md border p-1.5 transition-all hover:border-primary hover:bg-secondary/50",
                                                        selectedSize === size.id && "border-primary bg-primary/5"
                                                    )}
                                                >
                                                    <span className="text-xs font-medium">{size.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">{size.description}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </TabsContent>

                            {/* Advanced tab */}
                            <TabsContent value="advanced" className="pt-1">
                                <CardContent className="space-y-3 p-4">
                                    {/* Seed */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="seed" className="text-sm">{getTranslation('form.seed')}</Label>
                                            <div className="flex items-center">
                                                <Switch
                                                    id="random-seed"
                                                    checked={useRandomSeed}
                                                    onCheckedChange={setUseRandomSeed}
                                                    className="mr-2 data-[state=checked]:bg-primary"
                                                />
                                                <Label htmlFor="random-seed" className="text-xs">{getTranslation('form.random')}</Label>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Input
                                                id="seed"
                                                type="number"
                                                placeholder={getTranslation('form.random')}
                                                className="flex-1 h-8 text-sm"
                                                value={seed}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSeed(Number(e.target.value))}
                                                disabled={useRandomSeed}
                                            />
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 hover:rotate-180 transition-transform duration-500"
                                                onClick={randomizeSeed}
                                            >
                                                <RefreshCw className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Sampling steps */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="steps" className="text-sm">{getTranslation('form.steps')}</Label>
                                            <span className="text-xs text-muted-foreground">{steps}</span>
                                        </div>
                                        <Slider
                                            id="steps"
                                            value={[steps]}
                                            min={20}
                                            max={150}
                                            step={1}
                                            className="py-1"
                                            onValueChange={(value) => {
                                                setSteps(value[0]);
                                                setShowComplexityVisualization(true);
                                            }}
                                        />
                                        {renderParameterVisualization('steps', steps, 20, 150, {
                                            min: 'Быстрее',
                                            max: 'Качественнее'
                                        })}
                                    </div>

                                    {/* CFG Scale */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="cfg" className="text-sm">{getTranslation('form.cfg')}</Label>
                                            <span className="text-xs text-muted-foreground">{cfgScale}</span>
                                        </div>
                                        <Slider
                                            id="cfg"
                                            value={[cfgScale]}
                                            min={1}
                                            max={20}
                                            step={0.1}
                                            className="py-1"
                                            onValueChange={(value) => {
                                                setCfgScale(value[0]);
                                                setShowComplexityVisualization(true);
                                            }}
                                        />
                                        {renderParameterVisualization('cfg', cfgScale, 1, 20, {
                                            min: 'Креативнее',
                                            max: 'Точнее'
                                        })}
                                    </div>

                                    {/* Sampler */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="sampler" className="text-sm">{getTranslation('form.sampler')}</Label>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                                            <Info className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Алгоритм создания изображения. Разные сэмплеры дают разные результаты.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <Select value={sampler} onValueChange={setSampler}>
                                            <SelectTrigger id="sampler" className="h-8 text-sm">
                                                <SelectValue placeholder="Выберите сэмплер" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableSamplers.map((item) => (
                                                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Batch count */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="batch-count" className="text-sm">{getTranslation('form.batch')}</Label>
                                            <span className="text-xs text-muted-foreground">{batchCount}</span>
                                        </div>
                                        <Slider
                                            id="batch-count"
                                            value={[batchCount]}
                                            min={1}
                                            max={6}
                                            step={1}
                                            className="py-1"
                                            onValueChange={(value) => setBatchCount(value[0])}
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>1</span>
                                            <span>6</span>
                                        </div>
                                    </div>

                                    {/* Image to image */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm">{getTranslation('form.img2img')}</Label>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                                            <Info className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Используйте существующее изображение как основу для генерации</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>

                                        {/* Drag & drop area */}
                                        <motion.div
                                            ref={dropZoneRef}
                                            className={cn(
                                                "relative flex h-24 flex-col items-center justify-center rounded-md border border-dashed transition-colors",
                                                isDragging ? "border-primary bg-primary/5" : "hover:border-primary hover:bg-secondary/50",
                                                (sourceImage || isUploading) && "border-solid"
                                            )}
                                            onClick={handleFileUpload}
                                            animate={{
                                                borderColor: isDragging ? "hsl(var(--primary))" : "hsl(var(--border))",
                                                backgroundColor: isDragging ? "rgba(var(--primary), 0.1)" : "transparent"
                                            }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <AnimatePresence mode="wait">
                                                {isUploading ? (
                                                    <motion.div
                                                        key="uploading"
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                        variants={fadeInOut}
                                                        className="flex flex-col items-center justify-center"
                                                    >
                                                        <RotateCw className="mb-1 h-4 w-4 animate-spin text-primary" />
                                                        <p className="text-xs text-primary">Загрузка...</p>
                                                    </motion.div>
                                                ) : sourceImage ? (
                                                    <motion.div
                                                        key="image"
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                        variants={scale}
                                                        className="relative h-full w-full"
                                                    >
                                                        <img
                                                            src={sourceImage}
                                                            alt="Source"
                                                            className="h-full w-full object-cover rounded-md"
                                                        />
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute right-1 top-1 h-6 w-6 rounded-full opacity-80 hover:opacity-100 transition-opacity"
                                                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                                                e.stopPropagation();
                                                                setSourceImage(null);
                                                            }}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </motion.div>
                                                ) : isDragging ? (
                                                    <motion.div
                                                        key="drop"
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                        variants={scale}
                                                        className="flex flex-col items-center"
                                                    >
                                                        <Image className="mb-1 h-6 w-6 text-primary" />
                                                        <p className="text-xs text-primary">{getTranslation('form.drop_image')}</p>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="default"
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                        variants={fadeInOut}
                                                        className="flex flex-col items-center"
                                                    >
                                                        <Upload className="mb-1 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                        <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{getTranslation('form.drop_image')}</p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFileInputChange}
                                            />
                                        </motion.div>

                                        {/* Strength slider */}
                                        <AnimatePresence>
                                            {sourceImage && (
                                                <motion.div
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    variants={slideUp}
                                                    className="mt-2 space-y-1"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="img2img-strength" className="text-xs">{getTranslation('form.strength')}</Label>
                                                        <span className="text-xs text-muted-foreground">{strength.toFixed(2)}</span>
                                                    </div>
                                                    <Slider
                                                        id="img2img-strength"
                                                        value={[strength]}
                                                        min={0}
                                                        max={1}
                                                        step={0.01}
                                                        className="py-1"
                                                        onValueChange={(value) => setStrength(value[0])}
                                                    />
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>{getTranslation('form.mild')}</span>
                                                        <span>{getTranslation('form.complete')}</span>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Additional parameters */}
                                    <div className="space-y-1.5 pt-1">
                                        <Label className="text-sm font-medium">{getTranslation('form.additional')}</Label>
                                        <div className="space-y-2.5 rounded-md border p-2.5">
                                            {/* Hires.fix */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <ZoomIn className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-xs">{getTranslation('form.hires')}</span>
                                                </div>
                                                <Switch
                                                    checked={hiresFixEnabled}
                                                    onCheckedChange={(checked) => {
                                                        setHiresFixEnabled(checked);
                                                        setShowComplexityVisualization(true);
                                                    }}
                                                    className="data-[state=checked]:bg-primary"
                                                />
                                            </div>

                                            {/* Upscaler */}
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="upscaler" className="text-xs">{getTranslation('form.upscaler')}</Label>
                                                </div>
                                                <Select
                                                    value={selectedUpscaler}
                                                    onValueChange={setSelectedUpscaler}
                                                    disabled={!hiresFixEnabled}
                                                >
                                                    <SelectTrigger id="upscaler" className="h-7 text-xs">
                                                        <SelectValue placeholder="Выберите апскейлер" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {upscalers.map((upscaler) => (
                                                            <SelectItem key={upscaler.id} value={upscaler.id}>{upscaler.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Complexity visualization */}
                                    <AnimatePresence>
                                        {showComplexityVisualization && renderComplexityVisualization()}
                                    </AnimatePresence>
                                </CardContent>
                            </TabsContent>
                        </Tabs>
                        <CardFooter className="p-3">
                            <Button
                                onClick={handleGenerate}
                                disabled={generating || !prompt.trim()}
                                className={cn(
                                    "w-full h-9 relative overflow-hidden transition-all duration-300",
                                    prompt.trim() && !generating ? "bg-primary hover:bg-primary/90" : ""
                                )}
                            >
                                {generating ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center"
                                    >
                                        <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                                        {getTranslation('form.generating')} {Math.round(progress)}%
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        className="flex items-center"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        {getTranslation('form.generate')}
                                    </motion.div>
                                )}
                                {!generating && prompt.trim() && (
                                    <motion.span
                                        className="absolute inset-0 bg-white/10"
                                        initial={{ scale: 0, opacity: 0 }}
                                        whileHover={{ scale: 1.5, opacity: 0.2 }}
                                        transition={{ duration: 0.4 }}
                                    />
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>

                {/* Preview panel */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="lg:col-span-7"
                >
                    <Card className="flex flex-col shadow-sm border-muted/80 hover:border-primary/30 transition-colors duration-300">
                        <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                            <CardTitle className="text-base">{getTranslation('form.preview')}</CardTitle>
                            {generatedImage && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center gap-1.5"
                                >
                                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}>
                                        <ZoomOut className="h-3.5 w-3.5" />
                                    </Button>
                                    <span className="text-xs">{zoomLevel}%</span>
                                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}>
                                        <ZoomIn className="h-3.5 w-3.5" />
                                    </Button>
                                </motion.div>
                            )}
                        </CardHeader>
                        <CardContent className="p-0">
                            <div
                                ref={generationContainerRef}
                                className={cn(
                                    "generation-preview relative w-full bg-muted/10",
                                    aspectRatio === "1:1" ? "aspect-square" :
                                        aspectRatio === "4:3" ? "aspect-[4/3]" :
                                            aspectRatio === "16:9" ? "aspect-[16/9]" :
                                                aspectRatio === "9:16" ? "aspect-[9/16]" :
                                                    aspectRatio === "2:3" ? "aspect-[2/3]" :
                                                        "aspect-[3/2]",
                                    "border-b overflow-hidden"
                                )}
                            >
                                <AnimatePresence mode="wait">
                                    {generating ? (
                                        <motion.div
                                            key="generating"
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            variants={fadeInOut}
                                            className="flex h-full w-full flex-col items-center justify-center"
                                        >
                                            <motion.div
                                                initial={{ rotate: 0 }}
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                className="mb-6"
                                            >
                                                <div className="relative">
                                                    <Sparkles className="absolute -left-6 -top-6 h-4 w-4 text-primary/60" />
                                                    <Sparkles className="absolute -right-8 -bottom-4 h-5 w-5 text-primary/70" />
                                                    <Sparkles className="h-12 w-12 text-primary" />
                                                </div>
                                            </motion.div>
                                            <div className="w-2/3 max-w-md mb-4">
                                                <Progress value={progress} className="h-2" />
                                                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                                                    <span>0%</span>
                                                    <span>{Math.round(progress)}%</span>
                                                    <span>100%</span>
                                                </div>
                                            </div>
                                            <motion.p
                                                className="mt-1 text-sm text-primary font-medium"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                {getTranslation('form.creating')} {Math.round(progress)}%
                                            </motion.p>
                                            <motion.div
                                                key={processingStage}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.3 }}
                                                className="mt-1 text-xs text-muted-foreground"
                                            >
                                                {processingStage}
                                            </motion.div>
                                        </motion.div>
                                    ) : generatedImage ? (
                                        <motion.div
                                            key="result"
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            variants={scale}
                                            className="relative h-full w-full overflow-hidden flex items-center justify-center"
                                        >
                                            <motion.div
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: zoomLevel / 100, opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                                className="h-full w-full"
                                            >
                                                <img
                                                    src={generatedImage}
                                                    alt="Generated"
                                                    className="h-full w-full object-contain"
                                                />
                                            </motion.div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="empty"
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            variants={fadeInOut}
                                            className="flex h-full w-full flex-col items-center justify-center bg-muted/5 p-4 text-center"
                                        >
                                            <motion.div
                                                className="rounded-full bg-muted/80 p-3"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Sparkles className="h-6 w-6 text-muted-foreground" />
                                            </motion.div>
                                            <motion.p
                                                className="mt-3 text-sm text-muted-foreground"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1, duration: 0.3 }}
                                            >
                                                {getTranslation('form.image_will_appear')}
                                            </motion.p>
                                            <motion.p
                                                className="mt-1 text-xs text-muted-foreground"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2, duration: 0.3 }}
                                            >
                                                {getTranslation('form.start_with_prompt')}
                                            </motion.p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </CardContent>

                        {/* Actions for generated image */}
                        <AnimatePresence>
                            {generatedImage && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <CardFooter className="flex flex-wrap justify-between gap-2 p-3 pt-3">
                                        <div className="flex gap-1.5">
                                            <Button variant="outline" size="sm" className="h-8 hover:bg-primary/5 transition-colors duration-200">
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="flex items-center"
                                                >
                                                    <Save className="mr-1.5 h-3.5 w-3.5" />
                                                    {getTranslation('form.save')}
                                                </motion.div>
                                            </Button>
                                            <Button variant="outline" size="sm" className="h-8 hover:bg-primary/5 transition-colors duration-200">
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="flex items-center"
                                                >
                                                    <Download className="mr-1.5 h-3.5 w-3.5" />
                                                    {getTranslation('form.download')}
                                                </motion.div>
                                            </Button>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <Button variant="outline" size="sm" className="h-8 hover:bg-primary/5 transition-colors duration-200">
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="flex items-center"
                                                >
                                                    <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                                                    {getTranslation('form.variations')}
                                                </motion.div>
                                            </Button>
                                            <Button variant="default" size="sm" className="h-8 relative overflow-hidden">
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="flex items-center relative z-10"
                                                >
                                                    <Share2 className="mr-1.5 h-3.5 w-3.5" />
                                                    {getTranslation('form.share')}
                                                </motion.div>
                                                <motion.span
                                                    className="absolute inset-0 bg-white/10"
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    whileHover={{ scale: 1.5, opacity: 0.2 }}
                                                    transition={{ duration: 0.4 }}
                                                />
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Recent generations */}
                        <AnimatePresence>
                            {recentGenerations.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="p-3 pt-0 border-t">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-medium">{getTranslation('form.previous')}</h3>
                                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                                                <Grid className="mr-1.5 h-3.5 w-3.5" />
                                                {getTranslation('form.show_all')}
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-6 gap-2">
                                            {recentGenerations.slice(0, 6).map((image, idx) => (
                                                <div
                                                    key={idx}
                                                    className="group relative aspect-square overflow-hidden rounded-md border cursor-pointer bg-muted/20"
                                                    onClick={() => setGeneratedImage(image)}
                                                >
                                                    <img
                                                        src={image}
                                                        alt={`Recent ${idx + 1}`}
                                                        className="h-full w-full object-cover transition-all duration-300 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:bg-black/50 group-hover:opacity-100">
                                                        <Eye className="h-5 w-5 text-white" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>

                    {/* Analysis panels */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        <Card className="bg-card/60 backdrop-blur-sm col-span-1">
                            <CardContent className="p-3">
                                <div className="flex items-center mb-2">
                                    <FileCode className="h-5 w-5 text-primary mr-2" />
                                    <h3 className="text-sm font-medium">{getTranslation('form.prompt_viz')}</h3>
                                </div>
                                <p className="text-xs text-muted-foreground mb-3">{getTranslation('form.viz_desc')}</p>
                                <div className="bg-muted/30 p-2 rounded-md max-h-40 overflow-auto">
                                    {prompt.split(' ').map((word, idx) => {
                                        const isKeyword = commonTags.some(tag => tag.text.includes(word.toLowerCase())) ||
                                            stylePresets.some(style => style.name.toLowerCase().includes(word.toLowerCase()));
                                        return (
                                            <span
                                                key={idx}
                                                className={cn(
                                                    "mr-1 inline-block",
                                                    isKeyword ? "text-primary font-medium" : ""
                                                )}
                                            >
                                              {word}
                                            </span>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/60 backdrop-blur-sm col-span-2">
                            <CardContent className="p-3">
                                <div className="flex items-center mb-2">
                                    <Palette className="h-5 w-5 text-primary mr-2" />
                                    <h3 className="text-sm font-medium">{getTranslation('form.style_pred')}</h3>
                                </div>
                                <p className="text-xs text-muted-foreground mb-3">{getTranslation('form.pred_desc')}</p>
                                <div className="flex flex-wrap gap-2">
                                    {stylePresets.slice(0, 4).map((style) => {
                                        const isDetected = prompt.toLowerCase().includes(style.name.toLowerCase());
                                        return (
                                            <div
                                                key={style.id}
                                                className={cn(
                                                    "flex items-center gap-2 rounded-md border p-1.5 text-xs",
                                                    isDetected ? "border-primary bg-primary/5" : "border-muted bg-muted/10"
                                                )}
                                            >
                                                <img
                                                    src={style.image}
                                                    alt={style.name}
                                                    className="h-6 w-6 rounded-md object-cover"
                                                />
                                                <span>{style.name}</span>
                                                {isDetected && (
                                                    <CheckCircle2 className="h-3 w-3 text-primary ml-1" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};