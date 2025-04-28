"use client"; // Added "use client"

import { useEffect } from "react"; // Removed useState, оставили только useEffect
import { useRouter } from 'next/navigation';
import { ParticlesBackground } from "@/components/particles-background"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BarChart, Image, Heart, Trophy, Users, Bookmark, Settings, Edit, LogOut, Loader2 } from "lucide-react"
import { useLanguage, useLocalTranslation } from "@/components/language-context";
import { useAuth } from "@/components/auth-context"; // Добавили импорт useAuth

// Define a type for the user data
interface UserProfile {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  isVerified: boolean;
  // Add other fields as needed based on API response
  generations?: number; // Example additional fields
  likes?: number;
  competitions?: number;
  followers?: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, error, isAuthenticated, logout } = useAuth();

  // Translations (simplified for brevity, use your context)
  const pageTranslations = {
    en: {
      'profile.edit': 'Edit Profile',
      'profile.follow': 'Follow', // Assuming follow functionality exists
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
      'profile.collection_items': 'items',
      'profile.activity_stats': 'Activity Stats',
      'profile.activity_chart_placeholder': 'Activity chart would be displayed here',
      'profile.recent_activity': 'Recent Activity',
      'profile.achievements_title': 'Achievements',
      'profile.achievements_placeholder': 'Achievements list would be displayed here',
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
      'profile.collection_items': 'элементов',
      'profile.activity_stats': 'Статистика активности',
      'profile.activity_chart_placeholder': 'Здесь будет отображаться график активности',
      'profile.recent_activity': 'Недавняя активность',
      'profile.achievements_title': 'Достижения',
      'profile.achievements_placeholder': 'Здесь будет отображаться список достижений',
    }
  };
  const { localT } = useLocalTranslation(pageTranslations);

  // Перенаправление на страницу входа, если пользователь не аутентифицирован
  useEffect(() => {
    if (!loading && !isAuthenticated && window.location.pathname !== '/login') {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const handleLogout = () => {
    logout(); // Используем функцию logout из контекста аутентификации
    router.push('/login'); // Перенаправляем на страницу входа после выхода
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
    { title: localT('profile.generations'), value: formatNumber(user.generations), icon: Image },
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
                src={user.avatarUrl || `/placeholder.svg?height=128&width=128&text=${user.username.substring(0, 2).toUpperCase()}`}
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

          {/* Portfolio Tab - Needs dynamic data fetching */}
          <TabsContent value="portfolio" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>{localT('profile.portfolio')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="image-grid">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-md bg-muted">
                      <img
                        src={`/placeholder.svg?height=300&width=300&text=${localT('profile.artwork')}+${i + 1}`}
                        alt={`${localT('profile.artwork')} ${i + 1}`}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary">
                            {localT('profile.view')}
                          </Button>
                          <Button size="sm" variant="secondary">
                            {localT('profile.edit_artwork')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
    </div>
  )
}

