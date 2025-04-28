"use client"

import React, { useState, useEffect } from "react"
import { AvatarUpload } from "@/components/avatar-upload"
import { useRouter } from 'next/navigation'
import { ParticlesBackground } from "@/components/particles-background"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-context"
import { DeleteAccountDialog } from "@/components/delete-account-dialog"
import { AppearanceSettings } from "@/components/appearance-settings"
import {
    NotificationSettings,
    SubscriptionSettings,
    PrivacySettings
} from "@/components/settings-components"
import { APISettings } from "@/components/settings-components-api"
import { ChangePasswordForm } from "@/components/change-password-form"
import {
    Bell,
    Brush,
    Copy,
    CreditCard,
    Download,
    Globe,
    Key,
    Lock,
    LogOut,
    Plus,
    Save,
    Settings as SettingsIcon,
    Shield,
    Sparkles,
    User,
    Webhook,
    Layout,
    X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip"
import { useLanguage, useLocalTranslation } from "@/components/language-context"

export default function SettingsPage() {
    const [editMode, setEditMode] = useState(false)
    const { user, loading, isAuthenticated, updateProfile } = useAuth();
    const router = useRouter();
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        bio: ""
    })
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

    const { t, language } = useLanguage();
    
    // Перенаправление на страницу входа, если пользователь не аутентифицирован
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);
    
    // Обновление данных профиля при загрузке пользователя
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.displayName || user.username,
                email: user.email,
                bio: user.bio || "AI art enthusiast and digital creator passionate about exploring the intersection of technology and creativity."
            });
            setAvatarUrl(user.avatarUrl);
        }
    }, [user]);
    
    // Функция для сохранения изменений профиля
    const handleSaveProfile = async () => {
        if (!user) return;
        
        setIsSaving(true);
        setSaveMessage(null);
        
        try {
            // Вызываем метод обновления профиля из контекста аутентификации
            await updateProfile({
                displayName: profileData.name,
                bio: profileData.bio,
                // email is not part of the updateProfile interface
                // Аватар будет обновляться отдельно
            });
            
            setEditMode(false);
            setSaveMessage({
                type: 'success',
                text: 'Профиль успешно обновлен'
            });
            
            // Скрываем сообщение через 3 секунды
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (error) {
            console.error('Ошибка при обновлении профиля:', error);
            setSaveMessage({
                type: 'error',
                text: 'Не удалось обновить профиль. Пожалуйста, попробуйте снова.'
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    // Если идет загрузка, показываем индикатор загрузки
    if (loading) {
        return (
            <div className="container relative mx-auto py-8 flex justify-center items-center h-screen">
                <ParticlesBackground />
                <div className="flex items-center space-x-2 text-muted-foreground">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span>Загрузка настроек...</span>
                </div>
            </div>
        );
    }

    // Определяем переводы для функций локализации на верхнем уровне компонента
    // Переводы для функции localizeFeature
    const featureTranslationsRu: Record<string, string> = {
        "credits": "1000 кредитов генерации в месяц",
        "models": "Доступ ко всем моделям",
        "resolution": "Максимальное разрешение: 2048×2048",
        "queue": "Приоритетная очередь генерации",
        "parameters": "Расширенные параметры",
        "license": "Коммерческая лицензия",
        "api_access": "Доступ к API",
        "controlnet": "Поддержка ControlNet"
    };
    
    const featureTranslationsEn: Record<string, string> = {
        "credits": "1000 generation credits per month",
        "models": "Access to all models",
        "resolution": "Maximum resolution: 2048×2048",
        "queue": "Priority generation queue",
        "parameters": "Advanced parameters",
        "license": "Commercial license",
        "api_access": "API access",
        "controlnet": "ControlNet support"
    };
    
    // Переводы для функции localizeSubscriptionFeature
    const subscriptionTranslationsRu: Record<string, string> = {
        "100 generation credits per month": "100 кредитов генерации в месяц",
        "1000 generation credits per month": "1000 кредитов генерации в месяц",
        "5000 generation credits per month": "5000 кредитов генерации в месяц",
        "Access to basic models": "Доступ к базовым моделям",
        "Access to all models": "Доступ ко всем моделям",
        "Maximum resolution: 512×512": "Максимальное разрешение: 512×512",
        "Maximum resolution: 2048×2048": "Максимальное разрешение: 2048×2048",
        "Maximum resolution: 4096×4096": "Максимальное разрешение: 4096×4096",
        "Standard generation queue": "Стандартная очередь генерации",
        "Priority generation queue": "Приоритетная очередь генерации",
        "Highest priority queue": "Наивысший приоритет в очереди",
        "Basic parameters": "Базовые параметры",
        "Advanced parameters": "Расширенные параметры",
        "All parameters": "Все параметры",
        "Personal use only": "Только для личного использования",
        "Commercial license": "Коммерческая лицензия",
        "Extended commercial license": "Расширенная коммерческая лицензия",
        "API access": "Доступ к API",
        "Full API access": "Полный доступ к API",
        "ControlNet support": "Поддержка ControlNet",
        "Dedicated support": "Выделенная поддержка",
        "Team collaboration features": "Функции для совместной работы команды",
        "Custom model fine-tuning": "Индивидуальная настройка моделей"
    };
    
    // Helper function to localize features - using pre-defined translation objects
    const localizeFeature = (featureId: string): string => {
        // Use pre-defined translation objects that are defined at the component level
        const translations = language === 'ru' ? featureTranslationsRu : featureTranslationsEn;
        return translations[featureId] || featureId;
    };

    // Helper function to localize subscription plan features - using pre-defined translation objects
    const localizeSubscriptionFeature = (feature: string): string => {
        // Always use the pre-defined translation objects that are defined at the component level
        // This ensures hooks are not conditionally called
        return language === 'ru' ? (subscriptionTranslationsRu[feature] || feature) : feature;
    };

    const pageTranslations = {
        en: {
            'settings.title': 'Settings',
            'settings.description': 'Manage your account preferences and application settings',
            'settings.tab.account': 'Account',
            'settings.tab.appearance': 'Appearance',
            'settings.tab.notifications': 'Notifications',
            'settings.tab.subscription': 'Subscription',
            'settings.tab.privacy': 'Privacy',
            'settings.tab.api': 'API',
            'settings.profile.title': 'Profile Information',
            'settings.profile.description': 'Manage your account details and public profile',
            'settings.profile.display_name': 'Display Name',
            'settings.profile.username': 'Username',
            'settings.profile.email': 'Email',
            'settings.profile.bio': 'Bio',
            'settings.profile.edit': 'Edit Profile',
            'settings.profile.cancel': 'Cancel',
            'settings.profile.save': 'Save Changes',
            'settings.profile.change_avatar': 'Change Avatar',
            'settings.security.title': 'Account Security',
            'settings.security.description': 'Manage your password and security settings',
            'settings.security.current_password': 'Current Password',
            'settings.security.new_password': 'New Password',
            'settings.security.confirm_password': 'Confirm New Password',
            'settings.security.2fa': 'Two-Factor Authentication',
            'settings.security.2fa_app': 'Authenticator App',
            'settings.security.recommended': 'Recommended',
            'settings.security.2fa_description': 'Use an authenticator app to get two-factor authentication codes',
            'settings.security.enable': 'Enable',
            'settings.security.update': 'Update Security Settings',
            'settings.danger.title': 'Danger Zone',
            'settings.danger.description': 'Irreversible account actions',
            'settings.danger.delete_account': 'Delete Account',
            'settings.danger.delete_warning': 'Once you delete your account, there is no going back. This action cannot be undone.',

            // Appearance Tab
            'settings.appearance.title': 'Theme Preferences',
            'settings.appearance.description': 'Customize how VisioMera looks and feels',
            'settings.appearance.color_theme': 'Color Theme',
            'settings.appearance.light': 'Light',
            'settings.appearance.dark': 'Dark',
            'settings.appearance.system': 'System',
            'settings.appearance.ui_density': 'UI Density',
            'settings.appearance.compact': 'Compact',
            'settings.appearance.comfortable': 'Comfortable',
            'settings.appearance.spacious': 'Spacious',
            'settings.appearance.effects': 'Effects & Animations',
            'settings.appearance.particles': 'Background particles',
            'settings.appearance.transitions': 'UI transitions',
            'settings.appearance.reduced_motion': 'Reduced motion',
            'settings.appearance.haptic': 'Haptic feedback',
            'settings.appearance.save': 'Save Preferences',
            'settings.appearance.customization': 'Interface Customization',
            'settings.appearance.customization_description': 'Configure your workspace layout',
            'settings.appearance.default_view': 'Default View',
            'settings.appearance.standard': 'Standard Mode',
            'settings.appearance.standard_description': 'Simplified interface with essential controls',
            'settings.appearance.advanced': 'Advanced Mode',
            'settings.appearance.advanced_description': 'Full control with all parameters and options',
            'settings.appearance.gallery': 'Gallery View Preferences',
            'settings.appearance.gallery_grid': 'Default to grid view',
            'settings.appearance.gallery_info': 'Show image info on hover',
            'settings.appearance.gallery_autosave': 'Auto-save generations',
            'settings.appearance.gallery_prompt': 'Show prompts with images',

            // Notifications Tab
            'settings.notifications.title': 'Notification Preferences',
            'settings.notifications.description': 'Configure how and when you receive notifications',
            'settings.notifications.email': 'Email Notifications',
            'settings.notifications.email_account': 'Account updates and security alerts',
            'settings.notifications.email_comments': 'Comments on your creations',
            'settings.notifications.email_likes': 'Likes and reactions',
            'settings.notifications.email_features': 'New features and announcements',
            'settings.notifications.email_tips': 'Tips and tutorials',
            'settings.notifications.in_app': 'In-App Notifications',
            'settings.notifications.in_app_comments': 'Comments on your creations',
            'settings.notifications.in_app_likes': 'Likes and reactions',
            'settings.notifications.in_app_follows': 'New followers',
            'settings.notifications.in_app_mentions': 'Mentions and tags',
            'settings.notifications.in_app_competitions': 'Competition updates',
            'settings.notifications.in_app_generation': 'Generation completions',
            'settings.notifications.schedule': 'Notification Schedule',
            'settings.notifications.quiet_from': 'Quiet hours start',
            'settings.notifications.quiet_to': 'Quiet hours end',
            'settings.notifications.weekend_pause': 'Pause all notifications on weekends',
            'settings.notifications.save': 'Save Notification Settings',

            // Subscription Tab
            'settings.subscription.title': 'Current Plan',
            'settings.subscription.description': 'Manage your subscription and billing',
            'settings.subscription.pro_plan': 'Pro Plan',
            'settings.subscription.price': 'per month',
            'settings.subscription.next_billing': 'Your next billing date is April 15, 2025',
            'settings.subscription.manage': 'Manage Subscription',
            'settings.subscription.credits': 'Generation Credits',
            'settings.subscription.monthly_limit': 'Monthly Limit',
            'settings.subscription.credits_used': 'Credits Used',
            'settings.subscription.credits_remaining': 'Credits Remaining',
            'settings.subscription.buy_additional': 'Buy Additional Credits',
            'settings.subscription.buy_credits_tooltip': 'Purchase more credits when you reach your limit',
            'settings.subscription.features': 'Plan Features',
            'settings.subscription.history': 'View Billing History',
            'settings.subscription.upgrade': 'Upgrade Plan',
            'settings.subscription.available_plans': 'Available Plans',
            'settings.subscription.compare_plans': 'Compare plans and find the right fit for your needs',
            'settings.subscription.free': 'Free',
            'settings.subscription.business': 'Business',
            'settings.subscription.most_popular': 'Most Popular',
            'settings.subscription.current_plan': 'Current Plan',
            'settings.subscription.upgrade_to': 'Upgrade to',

            // Privacy Tab
            'settings.privacy.title': 'Privacy Settings',
            'settings.privacy.description': 'Control how your data is used and shared',
            'settings.privacy.profile': 'Profile Privacy',
            'settings.privacy.public_profile': 'Make profile public',
            'settings.privacy.public_profile_description': 'Allow anyone to view your profile and creations',
            'settings.privacy.searchable': 'Searchable profile',
            'settings.privacy.searchable_description': 'Allow your profile to appear in search results',
            'settings.privacy.share_activity': 'Share activity',
            'settings.privacy.share_activity_description': 'Show your activity (likes, comments) to followers',
            'settings.privacy.content': 'Content Sharing',
            'settings.privacy.auto_public': 'Automatically make my creations public',
            'settings.privacy.auto_public_description': 'New generations will be visible to the community',
            'settings.privacy.show_prompts': 'Share my prompts with the community',
            'settings.privacy.show_prompts_description': 'Allow others to view the prompts used for your public creations',
            'settings.privacy.allow_remix': 'Allow others to remix my work',
            'settings.privacy.allow_remix_description': 'Let community members use your images as reference for their creations',
            'settings.privacy.data': 'Data Privacy',
            'settings.privacy.anon_analytics': 'Allow anonymous analytics',
            'settings.privacy.anon_analytics_description': 'Help us improve by sharing anonymous usage data',
            'settings.privacy.model_training': 'Allow model training contribution',
            'settings.privacy.model_training_description': 'Your creations may be used to improve AI models',
            'settings.privacy.personalization': 'Personalized experience',
            'settings.privacy.personalization_description': 'Use your activity to customize your experience',
            'settings.privacy.save': 'Save Privacy Settings',
            'settings.privacy.data_management': 'Data Management',
            'settings.privacy.data_export': 'Data Export',
            'settings.privacy.data_export_description': 'Download a copy of your data, including your profile information, creations, and account activity',
            'settings.privacy.request_export': 'Request Data Export',
            'settings.privacy.data_removal': 'Data Removal',
            'settings.privacy.data_removal_description': 'If you\'d like us to delete specific content or data types instead of your entire account, you can request targeted data removal',
            'settings.privacy.request_removal': 'Request Data Removal',

            // API Tab
            'settings.api.title': 'API Access',
            'settings.api.description': 'Manage your API keys and usage for programmatic access',
            'settings.api.keys': 'Your API Keys',
            'settings.api.production_key': 'Production Key',
            'settings.api.development_key': 'Development Key',
            'settings.api.created': 'Created',
            'settings.api.active': 'Active',
            'settings.api.generate': 'Generate New API Key',
            'settings.api.usage': 'API Usage',
            'settings.api.documentation': 'View Documentation',
            'settings.api.monthly_limit': 'Monthly Limit',
            'settings.api.used_month': 'Used This Month',
            'settings.api.usage_cycle': 'Your API usage resets on the 1st of each month. Current billing cycle:',
            'settings.api.domains': 'Allowed Domains',
            'settings.api.domains_description': 'Restrict your API keys to specific domains for enhanced security',
            'settings.api.add_domain': 'Add',
            'settings.api.webhooks': 'Webhooks',
            'settings.api.webhooks_description': 'Configure webhook endpoints to receive real-time events',
            'settings.api.endpoints': 'Webhook Endpoints',
            'settings.api.add_endpoint': 'Add Endpoint',
            'settings.api.endpoint_active': 'Active',
            'settings.api.generation_completed': 'Generation Completed',
            'settings.api.events_description': 'Receives events when image generations complete',
            'settings.api.edit': 'Edit',
            'settings.api.test': 'Test',
            'settings.api.delete': 'Delete',
            'settings.api.enabled': 'API Access Enabled',
            'settings.api.save': 'Save API Settings',

            // Sign Out
            'settings.sign_out': 'Sign Out'
        },
        ru: {
            'settings.title': 'Настройки',
            'settings.description': 'Управление предпочтениями аккаунта и настройками приложения',
            'settings.tab.account': 'Аккаунт',
            'settings.tab.appearance': 'Внешний вид',
            'settings.tab.notifications': 'Уведомления',
            'settings.tab.subscription': 'Подписка',
            'settings.tab.privacy': 'Приватность',
            'settings.tab.api': 'API',
            'settings.profile.title': 'Информация профиля',
            'settings.profile.description': 'Управление данными вашего аккаунта и публичного профиля',
            'settings.profile.display_name': 'Отображаемое имя',
            'settings.profile.username': 'Имя пользователя',
            'settings.profile.email': 'Email',
            'settings.profile.bio': 'О себе',
            'settings.profile.edit': 'Редактировать профиль',
            'settings.profile.cancel': 'Отмена',
            'settings.profile.save': 'Сохранить изменения',
            'settings.profile.change_avatar': 'Изменить аватар',
            'settings.security.title': 'Безопасность аккаунта',
            'settings.security.description': 'Управление паролем и настройками безопасности',
            'settings.security.current_password': 'Текущий пароль',
            'settings.security.new_password': 'Новый пароль',
            'settings.security.confirm_password': 'Подтвердите новый пароль',
            'settings.security.2fa': 'Двухфакторная аутентификация',
            'settings.security.2fa_app': 'Приложение-аутентификатор',
            'settings.security.recommended': 'Рекомендуется',
            'settings.security.2fa_description': 'Используйте приложение-аутентификатор для получения кодов двухфакторной аутентификации',
            'settings.security.enable': 'Включить',
            'settings.security.update': 'Обновить настройки безопасности',
            'settings.danger.title': 'Опасная зона',
            'settings.danger.description': 'Необратимые действия с аккаунтом',
            'settings.danger.delete_account': 'Удалить аккаунт',
            'settings.danger.delete_warning': 'После удаления аккаунта пути назад нет. Это действие нельзя отменить.',

            // Appearance Tab
            'settings.appearance.title': 'Настройки темы',
            'settings.appearance.description': 'Настройте внешний вид и поведение VisioMera',
            'settings.appearance.color_theme': 'Цветовая тема',
            'settings.appearance.light': 'Светлая',
            'settings.appearance.dark': 'Темная',
            'settings.appearance.system': 'Системная',
            'settings.appearance.ui_density': 'Плотность интерфейса',
            'settings.appearance.compact': 'Компактная',
            'settings.appearance.comfortable': 'Комфортная',
            'settings.appearance.spacious': 'Просторная',
            'settings.appearance.effects': 'Эффекты и анимации',
            'settings.appearance.particles': 'Фоновые частицы',
            'settings.appearance.transitions': 'Переходы интерфейса',
            'settings.appearance.reduced_motion': 'Уменьшенное движение',
            'settings.appearance.haptic': 'Тактильная обратная связь',
            'settings.appearance.save': 'Сохранить настройки',
            'settings.appearance.customization': 'Настройка интерфейса',
            'settings.appearance.customization_description': 'Настройте макет рабочего пространства',
            'settings.appearance.default_view': 'Вид по умолчанию',
            'settings.appearance.standard': 'Стандартный режим',
            'settings.appearance.standard_description': 'Упрощенный интерфейс с основными элементами управления',
            'settings.appearance.advanced': 'Расширенный режим',
            'settings.appearance.advanced_description': 'Полный контроль со всеми параметрами и опциями',
            'settings.appearance.gallery': 'Настройки просмотра галереи',
            'settings.appearance.gallery_grid': 'Сетка по умолчанию',
            'settings.appearance.gallery_info': 'Показывать информацию при наведении',
            'settings.appearance.gallery_autosave': 'Автосохранение генераций',
            'settings.appearance.gallery_prompt': 'Показывать промпты с изображениями',

            // Notifications Tab
            'settings.notifications.title': 'Настройки уведомлений',
            'settings.notifications.description': 'Настройте как и когда вы получаете уведомления',
            'settings.notifications.email': 'Email уведомления',
            'settings.notifications.email_account': 'Обновления аккаунта и оповещения безопасности',
            'settings.notifications.email_comments': 'Комментарии к вашим работам',
            'settings.notifications.email_likes': 'Лайки и реакции',
            'settings.notifications.email_features': 'Новые функции и объявления',
            'settings.notifications.email_tips': 'Советы и руководства',
            'settings.notifications.in_app': 'Уведомления в приложении',
            'settings.notifications.in_app_comments': 'Комментарии к вашим работам',
            'settings.notifications.in_app_likes': 'Лайки и реакции',
            'settings.notifications.in_app_follows': 'Новые подписчики',
            'settings.notifications.in_app_mentions': 'Упоминания и теги',
            'settings.notifications.in_app_competitions': 'Обновления конкурсов',
            'settings.notifications.in_app_generation': 'Завершение генераций',
            'settings.notifications.schedule': 'Расписание уведомлений',
            'settings.notifications.quiet_from': 'Начало тихого времени',
            'settings.notifications.quiet_to': 'Конец тихого времени',
            'settings.notifications.weekend_pause': 'Приостановить все уведомления в выходные',
            'settings.notifications.save': 'Сохранить настройки уведомлений',

            // Subscription Tab
            'settings.subscription.title': 'Текущий план',
            'settings.subscription.description': 'Управление подпиской и оплатой',
            'settings.subscription.pro_plan': 'Про План',
            'settings.subscription.price': 'в месяц',
            'settings.subscription.next_billing': 'Ваша следующая дата оплаты: 15 апреля 2025 г.',
            'settings.subscription.manage': 'Управление подпиской',
            'settings.subscription.credits': 'Кредиты генерации',
            'settings.subscription.monthly_limit': 'Месячный лимит',
            'settings.subscription.credits_used': 'Использовано кредитов',
            'settings.subscription.credits_remaining': 'Осталось кредитов',
            'settings.subscription.buy_additional': 'Купить дополнительные кредиты',
            'settings.subscription.buy_credits_tooltip': 'Купите больше кредитов, когда достигнете лимита',
            'settings.subscription.features': 'Возможности плана',
            'settings.subscription.history': 'Просмотреть историю платежей',
            'settings.subscription.upgrade': 'Улучшить план',
            'settings.subscription.available_plans': 'Доступные планы',
            'settings.subscription.compare_plans': 'Сравните планы и найдите подходящий для ваших нужд',
            'settings.subscription.free': 'Бесплатный',
            'settings.subscription.business': 'Бизнес',
            'settings.subscription.most_popular': 'Самый популярный',
            'settings.subscription.current_plan': 'Текущий план',
            'settings.subscription.upgrade_to': 'Перейти на',

            // Privacy Tab
            'settings.privacy.title': 'Настройки приватности',
            'settings.privacy.description': 'Управляйте использованием и доступом к вашим данным',
            'settings.privacy.profile': 'Приватность профиля',
            'settings.privacy.public_profile': 'Сделать профиль публичным',
            'settings.privacy.public_profile_description': 'Разрешить всем просматривать ваш профиль и работы',
            'settings.privacy.searchable': 'Профиль в поиске',
            'settings.privacy.searchable_description': 'Разрешить вашему профилю появляться в результатах поиска',
            'settings.privacy.share_activity': 'Делиться активностью',
            'settings.privacy.share_activity_description': 'Показывать вашу активность (лайки, комментарии) подписчикам',
            'settings.privacy.content': 'Общий доступ к контенту',
            'settings.privacy.auto_public': 'Автоматически делать мои работы публичными',
            'settings.privacy.auto_public_description': 'Новые генерации будут видны сообществу',
            'settings.privacy.show_prompts': 'Делиться моими промптами с сообществом',
            'settings.privacy.show_prompts_description': 'Разрешить другим видеть промпты, использованные для ваших публичных работ',
            'settings.privacy.allow_remix': 'Разрешить другим переделывать мои работы',
            'settings.privacy.allow_remix_description': 'Позволить участникам сообщества использовать ваши изображения в качестве референса для своих работ',
            'settings.privacy.data': 'Приватность данных',
            'settings.privacy.anon_analytics': 'Разрешить анонимную аналитику',
            'settings.privacy.anon_analytics_description': 'Помогите нам улучшить сервис, поделившись анонимными данными об использовании',
            'settings.privacy.model_training': 'Разрешить вклад в обучение моделей',
            'settings.privacy.model_training_description': 'Ваши работы могут быть использованы для улучшения ИИ-моделей',
            'settings.privacy.personalization': 'Персонализированный опыт',
            'settings.privacy.personalization_description': 'Использовать вашу активность для настройки вашего опыта',
            'settings.privacy.save': 'Сохранить настройки приватности',
            'settings.privacy.data_management': 'Управление данными',
            'settings.privacy.data_export': 'Экспорт данных',
            'settings.privacy.data_export_description': 'Скачайте копию ваших данных, включая информацию профиля, работы и активность аккаунта',
            'settings.privacy.request_export': 'Запросить экспорт данных',
            'settings.privacy.data_removal': 'Удаление данных',
            'settings.privacy.data_removal_description': 'Если вы хотите, чтобы мы удалили определенный контент или типы данных вместо всего аккаунта, вы можете запросить целевое удаление данных',
            'settings.privacy.request_removal': 'Запросить удаление данных',

            // API Tab
            'settings.api.title': 'Доступ к API',
            'settings.api.description': 'Управляйте вашими API-ключами и использованием для программного доступа',
            'settings.api.keys': 'Ваши API-ключи',
            'settings.api.production_key': 'Рабочий ключ',
            'settings.api.development_key': 'Ключ разработки',
            'settings.api.created': 'Создан',
            'settings.api.active': 'Активен',
            'settings.api.generate': 'Сгенерировать новый API-ключ',
            'settings.api.usage': 'Использование API',
            'settings.api.documentation': 'Просмотреть документацию',
            'settings.api.monthly_limit': 'Месячный лимит',
            'settings.api.used_month': 'Использовано в этом месяце',
            'settings.api.usage_cycle': 'Ваше использование API сбрасывается 1-го числа каждого месяца. Текущий цикл оплаты:',
            'settings.api.domains': 'Разрешенные домены',
            'settings.api.domains_description': 'Ограничьте использование ваших API-ключей определенными доменами для повышения безопасности',
            'settings.api.add_domain': 'Добавить',
            'settings.api.webhooks': 'Вебхуки',
            'settings.api.webhooks_description': 'Настройте конечные точки вебхуков для получения событий в реальном времени',
            'settings.api.endpoints': 'Конечные точки вебхуков',
            'settings.api.add_endpoint': 'Добавить конечную точку',
            'settings.api.endpoint_active': 'Активна',
            'settings.api.generation_completed': 'Генерация завершена',
            'settings.api.events_description': 'Получает события при завершении генерации изображений',
            'settings.api.edit': 'Редактировать',
            'settings.api.test': 'Тест',
            'settings.api.delete': 'Удалить',
            'settings.api.enabled': 'Доступ к API включен',
            'settings.api.save': 'Сохранить настройки API',

            // Sign Out
            'settings.sign_out': 'Выйти'
        }
    };

    const { localT } = useLocalTranslation(pageTranslations);

    return (
        <div className="container relative mx-auto py-8">
            <ParticlesBackground />

            <div className="mb-8 space-y-4">
                <h1 className="text-3xl font-bold">{localT('settings.title')}</h1>
                <p className="text-muted-foreground">{localT('settings.description')}</p>
            </div>

            <Tabs defaultValue="account" className="space-y-8">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 gap-2">
                    <TabsTrigger value="account" className="flex gap-2 items-center">
                        <User className="h-4 w-4" />
                        <span className="hidden md:inline">{localT('settings.tab.account')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="flex gap-2 items-center">
                        <Brush className="h-4 w-4" />
                        <span className="hidden md:inline">{localT('settings.tab.appearance')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex gap-2 items-center">
                        <Bell className="h-4 w-4" />
                        <span className="hidden md:inline">{localT('settings.tab.notifications')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="subscription" className="flex gap-2 items-center">
                        <CreditCard className="h-4 w-4" />
                        <span className="hidden md:inline">{localT('settings.tab.subscription')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="privacy" className="flex gap-2 items-center">
                        <Shield className="h-4 w-4" />
                        <span className="hidden md:inline">{localT('settings.tab.privacy')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="api" className="flex gap-2 items-center">
                        <Webhook className="h-4 w-4" />
                        <span className="hidden md:inline">{localT('settings.tab.api')}</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="account" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{localT('settings.profile.title')}</CardTitle>
                            <CardDescription>
                                {localT('settings.profile.description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex flex-col items-center space-y-4">
                                    {editMode ? (
                                        <AvatarUpload 
                                            currentAvatarUrl={avatarUrl} 
                                            onAvatarChange={(url) => setAvatarUrl(url)}
                                            size="lg"
                                        />
                                    ) : (
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={avatarUrl || "/placeholder.svg?height=96&width=96&text=UN"} alt="Аватар пользователя" />
                                            <AvatarFallback>
                                                {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    {!editMode && (
                                        <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                                            {localT('settings.profile.change_avatar')}
                                        </Button>
                                    )}
                                </div>

                                <div className="flex-1 space-y-4">
                                    {saveMessage && (
                                        <div className={`p-2 rounded text-sm ${saveMessage.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                            {saveMessage.text}
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">{localT('settings.profile.display_name')}</Label>
                                            <Input
                                                id="name"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                                disabled={!editMode}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="username">{localT('settings.profile.username')}</Label>
                                            <Input id="username" value="@username" disabled />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">{localT('settings.profile.email')}</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                            disabled={!editMode}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bio">{localT('settings.profile.bio')}</Label>
                                        <Textarea
                                            id="bio"
                                            value={profileData.bio}
                                            onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                            disabled={!editMode}
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" onClick={() => {
                                if (editMode) {
                                    // Сбрасываем изменения к исходным данным
                                    if (user) {
                                        setProfileData({
                                            name: user.displayName || user.username,
                                            email: user.email,
                                            bio: user.bio || "AI art enthusiast and digital creator passionate about exploring the intersection of technology and creativity."
                                        });
                                    }
                                }
                                setEditMode(!editMode);
                            }}>
                                {editMode ? localT('settings.profile.cancel') : localT('settings.profile.edit')}
                            </Button>
                            {editMode && (
                                <Button onClick={handleSaveProfile} disabled={isSaving}>
                                    {isSaving ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    {localT('settings.profile.save')}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{localT('settings.security.title')}</CardTitle>
                            <CardDescription>
                                {localT('settings.security.description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ChangePasswordForm />

                            <div className="pt-4">
                                <h3 className="text-sm font-medium mb-3">{localT('settings.security.2fa')}</h3>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center">
                                            <h4 className="font-medium">{localT('settings.security.2fa_app')}</h4>
                                            <Badge variant="outline" className="ml-2">{localT('settings.security.recommended')}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {localT('settings.security.2fa_description')}
                                        </p>
                                    </div>
                                    <Button variant="outline">{localT('settings.security.enable')}</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-destructive/50">
                        <CardHeader>
                            <CardTitle className="text-destructive">{localT('settings.danger.title')}</CardTitle>
                            <CardDescription>
                                {localT('settings.danger.description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg border border-destructive/30 p-4">
                                <h3 className="font-medium text-destructive mb-1">{localT('settings.danger.delete_account')}</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {localT('settings.danger.delete_warning')}
                                </p>
                                <DeleteAccountDialog />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{localT('settings.appearance.title')}</CardTitle>
                            <CardDescription>
                                {localT('settings.appearance.description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AppearanceSettings />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{localT('settings.notifications.title')}</CardTitle>
                            <CardDescription>
                                {localT('settings.notifications.description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">{localT('settings.notifications.email')}</h3>
                                <div className="space-y-2">
                                    {[
                                        { id: "email-account", label: localT('settings.notifications.email_account') },
                                        { id: "email-comments", label: localT('settings.notifications.email_comments') },
                                        { id: "email-likes", label: localT('settings.notifications.email_likes') },
                                        { id: "email-features", label: localT('settings.notifications.email_features') },
                                        { id: "email-tips", label: localT('settings.notifications.email_tips') },
                                    ].map((item) => (
                                        <div key={item.id} className="flex items-center space-x-2">
                                            <Checkbox id={item.id} defaultChecked={item.id === "email-account"} />
                                            <Label htmlFor={item.id} className="text-sm">{item.label}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">{localT('settings.notifications.in_app')}</h3>
                                <div className="space-y-2">
                                    {[
                                        { id: "in-app-comments", label: localT('settings.notifications.in_app_comments'), defaultChecked: true },
                                        { id: "in-app-likes", label: localT('settings.notifications.in_app_likes'), defaultChecked: true },
                                        { id: "in-app-follows", label: localT('settings.notifications.in_app_follows'), defaultChecked: true },
                                        { id: "in-app-mentions", label: localT('settings.notifications.in_app_mentions'), defaultChecked: true },
                                        { id: "in-app-competitions", label: localT('settings.notifications.in_app_competitions'), defaultChecked: true },
                                        { id: "in-app-generation", label: localT('settings.notifications.in_app_generation'), defaultChecked: true },
                                    ].map((item) => (
                                        <div key={item.id} className="flex items-center space-x-2">
                                            <Switch id={item.id} defaultChecked={item.defaultChecked} />
                                            <Label htmlFor={item.id} className="text-sm">{item.label}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">{localT('settings.notifications.schedule')}</h3>
                                <div className="space-y-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="quiet-from">{localT('settings.notifications.quiet_from')}</Label>
                                            <Select defaultValue="22:00">
                                                <SelectTrigger id="quiet-from">
                                                    <SelectValue placeholder="Select time" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from({ length: 24 }, (_, i) => (
                                                        <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                                            {`${i.toString().padStart(2, '0')}:00`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="quiet-to">{localT('settings.notifications.quiet_to')}</Label>
                                            <Select defaultValue="07:00">
                                                <SelectTrigger id="quiet-to">
                                                    <SelectValue placeholder="Select time" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from({ length: 24 }, (_, i) => (
                                                        <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                                            {`${i.toString().padStart(2, '0')}:00`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 pt-2">
                                        <Switch id="weekend-pause" />
                                        <Label htmlFor="weekend-pause">{localT('settings.notifications.weekend_pause')}</Label>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>
                                <Save className="mr-2 h-4 w-4" />
                                {localT('settings.notifications.save')}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="subscription">
                    <SubscriptionSettings />
                </TabsContent>

                <TabsContent value="privacy" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{localT('settings.privacy.title')}</CardTitle>
                            <CardDescription>
                                {localT('settings.privacy.description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">{localT('settings.privacy.profile')}</h3>
                                <div className="space-y-2">
                                    {[
                                        { id: "public-profile", label: localT('settings.privacy.public_profile'), description: localT('settings.privacy.public_profile_description') },
                                        { id: "searchable", label: localT('settings.privacy.searchable'), description: localT('settings.privacy.searchable_description') },
                                        { id: "share-activity", label: localT('settings.privacy.share_activity'), description: localT('settings.privacy.share_activity_description') },
                                    ].map((item) => (
                                        <div key={item.id} className="flex items-start space-x-2">
                                            <div className="pt-0.5">
                                                <Switch id={item.id} defaultChecked />
                                            </div>
                                            <div>
                                                <Label htmlFor={item.id}>{item.label}</Label>
                                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">{localT('settings.privacy.content')}</h3>
                                <div className="space-y-2">
                                    {[
                                        { id: "auto-public", label: localT('settings.privacy.auto_public'), description: localT('settings.privacy.auto_public_description') },
                                        { id: "show-prompts", label: localT('settings.privacy.show_prompts'), description: localT('settings.privacy.show_prompts_description') },
                                        { id: "allow-remix", label: localT('settings.privacy.allow_remix'), description: localT('settings.privacy.allow_remix_description') },
                                    ].map((item) => (
                                        <div key={item.id} className="flex items-start space-x-2">
                                            <div className="pt-0.5">
                                                <Switch id={item.id} defaultChecked={item.id === "show-prompts"} />
                                            </div>
                                            <div>
                                                <Label htmlFor={item.id}>{item.label}</Label>
                                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">{localT('settings.privacy.data')}</h3>
                                <div className="space-y-2">
                                    {[
                                        { id: "anon-analytics", label: localT('settings.privacy.anon_analytics'), description: localT('settings.privacy.anon_analytics_description') },
                                        { id: "model-training", label: localT('settings.privacy.model_training'), description: localT('settings.privacy.model_training_description') },
                                        { id: "personalization", label: localT('settings.privacy.personalization'), description: localT('settings.privacy.personalization_description') },
                                    ].map((item) => (
                                        <div key={item.id} className="flex items-start space-x-2">
                                            <div className="pt-0.5">
                                                <Switch id={item.id} defaultChecked={item.id === "anon-analytics"} />
                                            </div>
                                            <div>
                                                <Label htmlFor={item.id}>{item.label}</Label>
                                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>
                                <Save className="mr-2 h-4 w-4" />
                                {localT('settings.privacy.save')}
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{localT('settings.privacy.data_management')}</CardTitle>
                            <CardDescription>
                                {localT('settings.privacy.data_export')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="rounded-lg border p-4">
                                <h3 className="font-medium mb-2">{localT('settings.privacy.data_export')}</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {localT('settings.privacy.data_export_description')}
                                </p>
                                <Button variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    {localT('settings.privacy.request_export')}
                                </Button>
                            </div>

                            <div className="rounded-lg border border-destructive/30 p-4">
                                <h3 className="font-medium text-destructive mb-2">{localT('settings.privacy.data_removal')}</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {localT('settings.privacy.data_removal_description')}
                                </p>
                                <Button variant="destructive">{localT('settings.privacy.request_removal')}</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="api" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{localT('settings.api.title')}</CardTitle>
                            <CardDescription>
                                {localT('settings.api.description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">{localT('settings.api.keys')}</h3>
                                <div className="rounded-lg border p-4 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">{localT('settings.api.production_key')}</h4>
                                                <p className="text-xs text-muted-foreground">{localT('settings.api.created')}: {language === 'ru' ? '15 марта 2025' : 'Mar 15, 2025'}</p>
                                            </div>
                                            <Badge variant="outline">{localT('settings.api.active')}</Badge>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                type="password"
                                                value="••••••••••••••••••••••••••••••"
                                                readOnly
                                                className="font-mono"
                                            />
                                            <Button variant="outline" size="icon">
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">{localT('settings.api.development_key')}</h4>
                                                <p className="text-xs text-muted-foreground">{localT('settings.api.created')}: {language === 'ru' ? '10 марта 2025' : 'Mar 10, 2025'}</p>
                                            </div>
                                            <Badge variant="outline">{localT('settings.api.active')}</Badge>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                type="password"
                                                value="••••••••••••••••••••••••••••••"
                                                readOnly
                                                className="font-mono"
                                            />
                                            <Button variant="outline" size="icon">
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <Button className="w-full">
                                        <Key className="mr-2 h-4 w-4" />
                                        {localT('settings.api.generate')}
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-medium">{localT('settings.api.usage')}</h3>
                                    <Button variant="outline" size="sm">{localT('settings.api.documentation')}</Button>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span>{localT('settings.api.monthly_limit')}</span>
                                        <span className="font-medium">{language === 'ru' ? '10 000 запросов' : '10,000 requests'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>{localT('settings.api.used_month')}</span>
                                        <span className="font-medium">{language === 'ru' ? '3 254 запроса' : '3,254 requests'}</span>
                                    </div>
                                    <Progress value={32.54} className="h-2" />
                                    <p className="text-xs text-muted-foreground">
                                        {localT('settings.api.usage_cycle')} {language === 'ru' ? '1 марта - 31 марта 2025' : 'Mar 1 - Mar 31, 2025'}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="text-sm font-medium">{localT('settings.api.domains')}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {localT('settings.api.domains_description')}
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Input placeholder="Enter domain (e.g., example.com)" />
                                        <Button variant="outline">{localT('settings.api.add_domain')}</Button>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-sm">{language === 'ru' ? 'вашсайт.рф' : 'yourwebsite.com'}</span>
                                            <Button variant="ghost" size="icon">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Separator className="my-2" />
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-sm">{language === 'ru' ? 'приложение.вашсайт.рф' : 'app.yourwebsite.com'}</span>
                                            <Button variant="ghost" size="icon">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Separator className="my-2" />
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-sm">localhost</span>
                                            <Button variant="ghost" size="icon">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <div className="flex items-center space-x-2">
                                <Switch id="api-enabled" defaultChecked />
                                <Label htmlFor="api-enabled">{localT('settings.api.enabled')}</Label>
                            </div>
                            <Button>{localT('settings.api.save')}</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{localT('settings.api.webhooks')}</CardTitle>
                            <CardDescription>
                                {localT('settings.api.webhooks_description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">{localT('settings.api.endpoints')}</h3>
                                <Button variant="outline" size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    {localT('settings.api.add_endpoint')}
                                </Button>
                            </div>
                            <div className="rounded-lg border">
                                <div className="p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">{localT('settings.api.generation_completed')}</h4>
                                        <Badge variant="outline">{localT('settings.api.endpoint_active')}</Badge>
                                    </div>
                                    <p className="font-mono text-sm text-muted-foreground">https://{language === 'ru' ? 'вашсайт.рф' : 'yourwebsite.com'}/api/webhooks/generations</p>
                                    <div className="flex items-center space-x-2">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">{localT('settings.api.events_description')}</span>
                                    </div>
                                </div>
                                <Separator />
                                <div className="p-4">
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">{localT('settings.api.edit')}</Button>
                                        <Button variant="outline" size="sm">{localT('settings.api.test')}</Button>
                                        <Button variant="destructive" size="sm">{localT('settings.api.delete')}</Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="fixed bottom-4 right-4 z-10">
                <Button variant="secondary" size="sm" className="text-xs flex items-center gap-1 bg-background/80 backdrop-blur-sm">
                    <LogOut className="mr-1 h-4 w-4" />
                    {localT('settings.sign_out')}
                </Button>
            </div>
        </div>
    )
}