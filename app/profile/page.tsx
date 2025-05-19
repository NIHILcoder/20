"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { ParticlesBackground } from "@/components/particles-background";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart, 
  Image, 
  Heart, 
  Trophy, 
  Users, 
  Bookmark, 
  Settings, 
  Edit, 
  LogOut, 
  Loader2, 
  Eye, 
  Share2, 
  Download 
} from "lucide-react";
import { useLanguage, useLocalTranslation } from "@/components/language-context";
import { useAuth } from "@/components/auth-context";
import { getUserHistory } from "@/services/api-service";
import { Artwork } from "@/services/api-service";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

/**
 * Компонент страницы профиля пользователя
 * Отображает информацию о пользователе, его работы, статистику и коллекции
 */
export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, error, isAuthenticated, logout } = useAuth();
  const { language } = useLanguage();
  
  // Состояния для работы с артворками пользователя
  const [userArtworks, setUserArtworks] = useState<Artwork[]>([]);
  const [artworksLoading, setArtworksLoading] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Translations
  const pageTranslations = {
    en: {
      'profile.edit': 'Edit Profile',
      'profile.follow': 'Follow',
      'profile.logout': 'Log Out',
      'profile.generations': 'Generations',
      'profile.likes': 'Likes',
      'profile.competitions': 'Competitions',
      'profile.followers': 'Followers',
      'profile.portfolio': 'Portfolio',
      'profile.collections': 'Collections',
      'profile.stats': 'Stats',
      'profile.achievements': 'Achievements',
      'profile.loading': 'Loading profile...',
      'profile.error': 'Failed to load profile. Please try logging in again.',
      'profile.artwork': 'Artwork',
      'profile.view': 'View',
      'profile.edit_artwork': 'Edit',
      'profile.share_artwork': 'Share',
      'profile.download': 'Download',
      'profile.collection_items': 'items',
      'profile.activity_stats': 'Activity Stats',
      'profile.activity_chart_placeholder': 'Activity chart would be displayed here',
      'profile.recent_activity': 'Recent Activity',
      'profile.achievements_title': 'Achievements',
      'profile.achievements_placeholder': 'Achievements list would be displayed here',
      'profile.no_artworks': 'You don\'t have any artworks yet. Create your first generation on the home page!',
      'profile.download_success': 'Image downloaded successfully',
      'profile.share_success': 'Image shared to community successfully',
      'profile.artwork_details': 'Artwork Details',
      'profile.created_at': 'Created at',
      'profile.prompt': 'Prompt',
      'profile.model': 'Model',
      'profile.close': 'Close',
    },
    ru: {
      'profile.edit': 'Редактировать профиль',
      'profile.follow': 'Подписаться',
      'profile.logout': 'Выйти',
      'profile.generations': 'Генерации',
      'profile.likes': 'Лайки',
      'profile.competitions': 'Конкурсы',
      'profile.followers': 'Подписчики',
      'profile.portfolio': 'Портфолио',
      'profile.collections': 'Коллекции',
      'profile.stats': 'Статистика',
      'profile.achievements': 'Достижения',
      'profile.loading': 'Загрузка профиля...',
      'profile.error': 'Не удалось загрузить профиль. Пожалуйста, попробуйте войти снова.',
      'profile.artwork': 'Работа',
      'profile.view': 'Просмотр',
      'profile.edit_artwork': 'Редактировать',
      'profile.share_artwork': 'Поделиться',
      'profile.download': 'Скачать',
      'profile.collection_items': 'элементов',
      'profile.activity_stats': 'Статистика активности',
      'profile.activity_chart_placeholder': 'Здесь будет отображаться график активности',
      'profile.recent_activity': 'Недавняя активность',
      'profile.achievements_title': 'Достижения',
      'profile.achievements_placeholder': 'Здесь будет отображаться список достижений',
      'profile.no_artworks': 'У вас пока нет работ. Создайте свою первую генерацию на главной странице!',
      'profile.download_success': 'Изображение успешно скачано',
      'profile.share_success': 'Изображение успешно опубликовано в сообществе',
      'profile.artwork_details': 'Детали работы',
      'profile.created_at': 'Создано',
      'profile.prompt': 'Промпт',
      'profile.model': 'Модель',
      'profile.close': 'Закрыть',
    }
  };
  const { localT } = useLocalTranslation(pageTranslations);

  // Перенаправление на страницу входа, если пользователь не аутентифицирован
  useEffect(() => {
    if (!loading && !isAuthenticated && window.location.pathname !== '/login') {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Загрузка работ пользователя
  useEffect(() => {
    const fetchUserArtworks = async () => {
      if (!user?.id) return;
      
      setArtworksLoading(true);
      try {
        // Используем функцию getUserHistory из api-service
        const response = await getUserHistory({
          userId: user.id,
          limit: 50,
          filter: 'all'
        });
        
        if (response && response.artworks) {
          setUserArtworks(response.artworks);
        } else {
          console.error('Ошибка в ответе API:', response);
        }
      } catch (error) {
        console.error('Ошибка при загрузке работ пользователя:', error);
      } finally {
        setArtworksLoading(false);
      }
    };
    
    if (user) {
      fetchUserArtworks();
    }
  }, [user]);

  const handleLogout = () => {
    logout(); // Используем функцию logout из контекста аутентификации
    router.push('/login'); // Перенаправляем на страницу входа после выхода
  };

  // Обработчик для скачивания изображения
  const handleDownloadArtwork = async (artwork: Artwork) => {
    try {
      const response = await fetch(artwork.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `artwork_${artwork.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert(localT('profile.download_success'));
    } catch (error) {
      console.error('Ошибка при скачивании изображения:', error);
    }
  };

  // Обработчик для публикации работы в сообществе
  const handleShareToCommunity = async (artwork: Artwork) => {
    try {
      // Получаем CSRF-токен из cookie для NextAuth (если он используется)
      const getCsrfToken = () => {
        const cookies = document.cookie.split(';');
        const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('next-auth.csrf-token='));
        if (csrfCookie) {
          const tokenValue = csrfCookie.split('=')[1];
          // Если токен содержит %7C (закодированный символ |), нужно взять часть до него
          if (tokenValue.includes('%7C')) {
            return decodeURIComponent(tokenValue.split('%7C')[0]);
          }
          return decodeURIComponent(tokenValue);
        }
        return '';
      };

      // Проверяем наличие сессии NextAuth
      const checkNextAuthSession = () => {
        return document.cookie.split(';').some(cookie => 
          cookie.trim().startsWith('next-auth.session-token=') || 
          cookie.trim().startsWith('__Secure-next-auth.session-token=')
        );
      };

      // Если нет сессии NextAuth, выбрасываем ошибку авторизации
      if (!checkNextAuthSession()) {
        throw new Error('Необходима авторизация. Пожалуйста, войдите в систему снова.');
      }
      
      // Делаем простой запрос для проверки авторизации перед публикацией
      const authCheckResponse = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include', // Важно для передачи cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!authCheckResponse.ok) {
        if (authCheckResponse.status === 401) {
          throw new Error('Необходима авторизация. Пожалуйста, войдите в систему снова.');
        }
        throw new Error('Ошибка при проверке авторизации');
      }

      const response = await fetch('/api/artwork/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken() // Добавляем CSRF-токен для NextAuth
        },
        credentials: 'include', // Важно для передачи cookies
        body: JSON.stringify({
          userId: user?.id,
          imageUrl: artwork.image_url,
          prompt: artwork.prompt,
          title: artwork.title,
          description: artwork.prompt,
          model: artwork.model || 'flux_realistic',
          parameters: artwork.parameters || {}
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Ошибка при публикации работы');
      }
      
      alert(localT('profile.share_success'));
    } catch (error) {
      console.error('Ошибка при публикации работы:', error);
      
      // Если ошибка связана с авторизацией, предлагаем пользователю войти снова
      if (error instanceof Error && (error.message.includes('авторизация') || error.message.includes('Необходима авторизация'))) {
        alert('Необходима авторизация. Пожалуйста, войдите в систему снова.');
        // Перенаправляем на страницу входа
        setTimeout(() => {
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        }, 1500);
      } else {
        alert(error instanceof Error ? error.message : 'Не удалось опубликовать работу');
      }
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(language === 'en' ? 'en-US' : 'ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container relative mx-auto py-8 flex justify-center items-center h-screen">
        <ParticlesBackground />
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{localT('profile.loading')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container relative mx-auto py-8 flex justify-center items-center h-screen">
        <ParticlesBackground />
        <div className="text-center text-destructive">
          <p>{error}</p>
          <Button onClick={() => router.push('/login')} className="mt-4">Go to Login</Button>
        </div>
      </div>
    );
  }

  if (!user) {
    // This case should ideally be handled by the loading/error states or redirect
    return null; 
  }

  // Helper to format large numbers (optional)
  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return 'N/A';
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const stats = [
    { title: localT('profile.generations'), value: formatNumber(user.generations || userArtworks.length), icon: Image },
    { title: localT('profile.likes'), value: formatNumber(user.likes), icon: Heart },
    { title: localT('profile.competitions'), value: formatNumber(user.competitions), icon: Trophy },
    { title: localT('profile.followers'), value: formatNumber(user.followers), icon: Users },
  ];

  return (
    <div className="container relative mx-auto py-8">
      <ParticlesBackground />

      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user.avatarUrl || user.avatar || `/placeholder.svg?height=128&width=128&text=${user.username.substring(0, 2).toUpperCase()}`}
                alt={`${user.displayName || user.username}'s profile`}
                className="h-24 w-24 rounded-full object-cover bg-muted"
              />
              {/* Edit avatar button - functionality needs implementation */}
              <Button variant="secondary" size="icon" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.displayName || user.username}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
              {user.bio && <p className="mt-1 text-sm text-muted-foreground">{user.bio}</p>} 
              <div className="mt-2 flex flex-wrap gap-2">
                {/* Badges could be dynamic based on user roles/achievements */}
                <Badge variant="outline">Artist</Badge>
                <Badge variant="outline">AI Enthusiast</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {/* Link Edit Profile button to settings page or a modal */}
            <Button variant="outline" onClick={() => router.push('/settings')}> 
              <Settings className="mr-2 h-4 w-4" />
              {localT('profile.edit')}
            </Button>
            {/* Follow button - needs implementation */}
            {/* <Button>
              <Users className="mr-2 h-4 w-4" />
              {localT('profile.follow')}
            </Button> */}
            <Button variant="outline" onClick={handleLogout}> 
              <LogOut className="mr-2 h-4 w-4" />
              {localT('profile.logout')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="portfolio">
          <TabsList className="mb-4">
            <TabsTrigger value="portfolio">
              <Image className="mr-2 h-4 w-4" />
              {localT('profile.portfolio')}
            </TabsTrigger>
            <TabsTrigger value="collections">
              <Bookmark className="mr-2 h-4 w-4" />
              {localT('profile.collections')}
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart className="mr-2 h-4 w-4" />
              {localT('profile.stats')}
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <Trophy className="mr-2 h-4 w-4" />
              {localT('profile.achievements')}
            </TabsTrigger>
          </TabsList>

          {/* Portfolio Tab - With dynamic data fetching */}
          <TabsContent value="portfolio" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>{localT('profile.portfolio')}</CardTitle>
              </CardHeader>
              <CardContent>
                {artworksLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : userArtworks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {userArtworks.map((artwork) => (
                      <div key={artwork.id} className="group relative aspect-square overflow-hidden rounded-md bg-muted">
                        <img
                          src={artwork.image_url}
                          alt={artwork.title || localT('profile.artwork')}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => {
                                setSelectedArtwork(artwork);
                                setDialogOpen(true);
                              }}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              {localT('profile.view')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => handleShareToCommunity(artwork)}
                            >
                              <Share2 className="mr-1 h-3 w-3" />
                              {localT('profile.share_artwork')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    {localT('profile.no_artworks')}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collections Tab - Needs dynamic data fetching */}
          <TabsContent value="collections" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>{localT('profile.collections')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {["Landscapes", "Portraits", "Abstract", "Sci-Fi", "Fantasy", "Favorites"].map(
                    (collection, index) => (
                      <Card key={index} className="overflow-hidden">
                        <div className="aspect-video bg-muted">
                          <img
                            src={`/placeholder.svg?height=200&width=400&text=${collection}`}
                            alt={collection}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium">{collection}</h3>
                          <p className="text-sm text-muted-foreground">
                            {Math.floor(Math.random() * 20) + 5} {localT('profile.collection_items')}
                          </p>
                        </CardContent>
                      </Card>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab - Needs dynamic data/chart implementation */}
          <TabsContent value="stats" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>{localT('profile.activity_stats')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full flex items-center justify-center bg-muted rounded-md">
                  <p className="text-muted-foreground">{localT('profile.activity_chart_placeholder')}</p>
                </div>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <h3 className="font-medium">{localT('profile.recent_activity')}</h3>
                  <div className="space-y-4">
                    {/* Placeholder recent activity - Needs dynamic data */}
                    {[ 
                      {
                        action: "Created a new artwork",
                        time: "2 hours ago",
                        icon: Image,
                      },
                      {
                        action: "Entered the Sci-Fi Landscapes competition",
                        time: "1 day ago",
                        icon: Trophy,
                      },
                      {
                        action: "Received 24 likes on your artwork",
                        time: "2 days ago",
                        icon: Heart,
                      },
                      {
                        action: "Gained 5 new followers",
                        time: "3 days ago",
                        icon: Users,
                      },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-4 rounded-lg border p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <activity.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab - Needs dynamic data fetching */}
          <TabsContent value="achievements" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>{localT('profile.achievements_title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full flex items-center justify-center bg-muted rounded-md">
                  <p className="text-muted-foreground">{localT('profile.achievements_placeholder')}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Диалог с детальной информацией о работе */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{localT('profile.artwork_details')}</DialogTitle>
          </DialogHeader>
          {selectedArtwork && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative aspect-square bg-muted rounded-md overflow-hidden">
                <img 
                  src={selectedArtwork.image_url} 
                  alt={selectedArtwork.title || localT('profile.artwork')}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">{selectedArtwork.title || localT('profile.artwork')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {localT('profile.created_at')}: {formatDate(selectedArtwork.created_at)}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium mb-1">{localT('profile.prompt')}</h4>
                  <p className="text-sm border rounded-md p-3 bg-muted/30">
                    {selectedArtwork.prompt || "No prompt information available"}
                  </p>
                </div>
                
                {selectedArtwork.model && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">{localT('profile.model')}</h4>
                    <Badge variant="outline">{selectedArtwork.model}</Badge>
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => handleDownloadArtwork(selectedArtwork)}>
                    <Download className="mr-2 h-4 w-4" />
                    {localT('profile.download')}
                  </Button>
                  <Button variant="outline" onClick={() => handleShareToCommunity(selectedArtwork)}>
                    <Share2 className="mr-2 h-4 w-4" />
                    {localT('profile.share_artwork')}
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {localT('profile.close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}