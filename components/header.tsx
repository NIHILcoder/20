"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Bell, Zap, Sparkles, User, LogOut, Settings } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/components/language-context"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

export function Header() {
    const [notificationCount, setNotificationCount] = useState(0)
    const [credits, setCredits] = useState(0)
    const { t } = useLanguage()
    const { user, isAuthenticated, logout, updateNotificationStatus } = useAuth()
    const router = useRouter()
    
    // Синхронизация кредитов и уведомлений с аккаунтом пользователя
    useEffect(() => {
        if (user) {
            // Получаем кредиты из данных пользователя
            setCredits(user.credits || 0)
            
            // Получаем количество непрочитанных уведомлений
            const unreadNotifications = user.notifications?.filter(n => !n.read)?.length || 0
            setNotificationCount(unreadNotifications)
        }
    }, [user])
    
    // Обработчик события обновления кредитов
    useEffect(() => {
        // Создаем функцию для обновления кредитов в интерфейсе
        const handleCreditsUpdate = () => {
            // При получении события creditsUpdated, запрашиваем актуальные данные из контекста
            if (user) {
                // Используем актуальные данные из контекста без вызова setState внутри setTimeout
                const updatedCredits = user.credits || 0
                if (updatedCredits !== credits) {
                    setCredits(updatedCredits)
                }
            }
        }
        
        // Добавляем слушатель события
        window.addEventListener('creditsUpdated', handleCreditsUpdate)
        
        // Очистка слушателя при размонтировании компонента
        return () => {
            window.removeEventListener('creditsUpdated', handleCreditsUpdate)
        }
    }, [user, credits]) // Добавляем credits в зависимости для предотвращения лишних обновлений

    return (
        <header className="fixed top-0 right-0 left-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4 backdrop-blur-sm">
            <div className="absolute left-1/2 transform -translate-x-1/2 top-0 h-full flex items-center">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    VisioMera x ВизиоМера
                </h1>
            </div>

            <div className="ml-auto flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-background/30 backdrop-blur px-2 py-1 rounded-full border text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-foreground/80 whitespace-nowrap">{t('header.ai_models')}</span>
                </div>

                <div className="flex items-center gap-1 text-xs font-medium">
                    <Zap className="h-3.5 w-3.5 text-yellow-500" />
                    <span className="whitespace-nowrap">{credits} {t('header.credits')}</span>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative h-8 w-8">
                            <Bell className="h-4 w-4" />
                            {notificationCount > 0 && (
                                <span className="absolute -right-1 -top-1">
                      <Badge
                          className="flex h-3.5 w-3.5 items-center justify-center rounded-full p-0 text-[9px]"
                          variant="destructive"
                      >
                        {notificationCount}
                      </Badge>
                    </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel>{t('header.notifications')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-[300px] overflow-auto">
                            {user?.notifications && user.notifications.length > 0 ? (
                                user.notifications.map((notification) => (
                                    <DropdownMenuItem 
                                        key={notification.id} 
                                        className={`flex cursor-pointer flex-col items-start p-3 ${!notification.read ? 'bg-primary/5' : ''}`}
                                        onClick={() => {
                                            // Помечаем уведомление как прочитанное при клике
                                            if (!notification.read) {
                                                updateNotificationStatus(notification.id, true);
                                            }
                                        }}
                                    >
                                        <div className="font-medium">{notification.title}</div>
                                        <div className="text-sm text-muted-foreground">{notification.description}</div>
                                        <div className="mt-1 text-xs text-muted-foreground">{notification.time}</div>
                                    </DropdownMenuItem>
                                ))
                            ) : (
                                <div className="p-3 text-center text-sm text-muted-foreground">
                                    {t('header.no_notifications')}
                                </div>
                            )}
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="cursor-pointer justify-center text-center"
                            onClick={() => router.push('/settings?tab=notifications')}
                        >
                            {t('header.view_all_notifications')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {isAuthenticated ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName || user?.username || ""} />
                                    <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{user?.displayName || user?.username}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                Профиль
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                Настройки
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout} className="cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                Выход
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button variant="default" size="sm" onClick={() => router.push('/login')}>
                        {t('nav.sign_in')}
                    </Button>
                )}

                <LanguageToggle />
                <ThemeToggle />
            </div>
        </header>
    )
}