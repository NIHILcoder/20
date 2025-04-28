"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Определение типа для уведомления
interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

// Определение типа для данных пользователя
interface UserProfile {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  isVerified: boolean;
  generations?: number;
  likes?: number;
  competitions?: number;
  followers?: number;
  credits?: number;
  notifications?: Notification[];
  privacySettings?: {
    profileVisibility: string;
    showGenerations: boolean;
    allowComments: boolean;
    allowMessages: boolean;
  };
}

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUserProfile: () => Promise<void>;
  updateProfile: (profileData: {displayName?: string; bio?: string; avatarUrl?: string}) => Promise<void>;
  updateNotificationStatus: (notificationId: number, read: boolean) => void;
  updatePrivacySettings: (settings: {profileVisibility?: string; showGenerations?: boolean; allowComments?: boolean; allowMessages?: boolean}) => void;
  updateCredits: (amount: number) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Проверка аутентификации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        await fetchUserProfile();
      } catch (e) {
        // Если ошибка, пользователь не аутентифицирован
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          setUser(null);
          return;
        }
        
        // Try to get more detailed error information from the response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = `Server error: ${errorData.error}`;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }
      const data: UserProfile = await response.json();
      
      // Получаем количество кредитов из данных пользователя
      // Кредиты теперь хранятся в базе данных для каждого пользователя
      let userCredits = data.credits ?? 1000;
      
      // Демо-данные для уведомлений (в реальном приложении будут приходить с сервера)
      const demoNotifications: Notification[] = [
        {
          id: 1,
          title: "New competition announced",
          description: "Abstract Emotions competition starts today",
          time: "10 minutes ago",
          read: false
        },
        {
          id: 2,
          title: "Your image was featured",
          description: "Your 'Cosmic Dreams' artwork was featured on the homepage",
          time: "2 hours ago",
          read: false
        },
        {
          id: 3,
          title: "New follower",
          description: "ArtistUser42 started following you",
          time: "5 hours ago",
          read: false
        },
        {
          id: 4,
          title: "Comment on your artwork",
          description: "CreativeUser99 commented: 'Amazing work!'",
          time: "1 day ago",
          read: true
        },
        {
          id: 5,
          title: "New tutorial available",
          description: "Learn how to use LoRA models effectively",
          time: "2 days ago",
          read: true
        }
      ];
      
      // Демо-данные для настроек приватности
      const demoPrivacySettings = {
        profileVisibility: 'public',
        showGenerations: true,
        allowComments: true,
        allowMessages: true
      };
      
      setUser({
        ...data,
        generations: data.generations ?? 248,
        likes: data.likes ?? 1200,
        competitions: data.competitions ?? 12,
        followers: data.followers ?? 356,
        credits: userCredits, // Используем значение из cookie или данные с сервера
        notifications: data.notifications ?? demoNotifications,
        privacySettings: data.privacySettings ?? demoPrivacySettings
      });
      setIsAuthenticated(true);
    } catch (e: any) {
      console.error("Failed to fetch user profile:", e);
      setError(e.message || "Failed to fetch user profile");
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const login = async (usernameOrEmail: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usernameOrEmail,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An error occurred during login");
      }

      // Обновляем профиль пользователя после успешного входа
      // Добавляем повторные попытки при ошибке получения профиля
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          await fetchUserProfile();
          break; // Успешно получили профиль, выходим из цикла
        } catch (error) {
          // Properly type the error as unknown and handle it safely
          const profileError = error as unknown;
          retryCount++;
          console.error(`Attempt ${retryCount}/${maxRetries} failed:`, profileError);
          
          if (retryCount >= maxRetries) {
            // Если все попытки исчерпаны, пробрасываем ошибку дальше
            const errorMessage = profileError instanceof Error ? profileError.message : 'Unknown error';
            throw new Error(`Failed to fetch user profile after ${maxRetries} attempts: ${errorMessage}`);
          }
          
          // Ждем перед следующей попыткой (увеличиваем время с каждой попыткой)
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    } catch (e: any) {
      console.error('Login error details:', e);
      setError(e.message || "An error occurred during login");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Отправляем запрос на сервер для очистки сессии
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
    } finally {
      // Очистка куки/токена на клиенте
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict;';
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      
      // Сброс состояния
      setUser(null);
      setIsAuthenticated(false);
      
      // Перенаправление на страницу входа
      router.push('/login');
    }
  };

  const updateProfile = async (profileData: {displayName?: string; bio?: string; avatarUrl?: string, avatarFile?: File, email?: string}) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      
      // Если передан файл аватара, используем FormData
      if (profileData.avatarFile) {
        const formData = new FormData();
        formData.append('avatar', profileData.avatarFile);
        
        // Добавляем остальные поля профиля
        if (profileData.displayName) formData.append('displayName', profileData.displayName);
        if (profileData.bio) formData.append('bio', profileData.bio);
        if (profileData.email) formData.append('email', profileData.email);
        
        response = await fetch('/api/auth/profile', {
          method: 'PUT',
          body: formData,
        });
      } else {
        // Обычный JSON запрос без файла
        response = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData),
        });
      }

      // Проверяем тип контента ответа
      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.error || "Ошибка при обновлении профиля");
        } else {
          throw new Error("Ошибка при обновлении профиля: сервер вернул некорректный формат данных");
        }
      }

      // Обновляем локальные данные пользователя
      if (user) {
        setUser({
          ...user,
          displayName: profileData.displayName ?? user.displayName,
          bio: profileData.bio ?? user.bio,
          avatarUrl: profileData.avatarUrl ?? user.avatarUrl,
          email: profileData.email ?? user.email
        });
      }
      
      // Проверяем тип контента перед парсингом JSON
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return { success: true };
    } catch (e: any) {
      setError(e.message || "Произошла ошибка при обновлении профиля");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Обновление статуса уведомления
  const updateNotificationStatus = (notificationId: number, read: boolean) => {
    if (!user) return;
    
    // Проверяем наличие уведомлений
    if (!user.notifications) {
      console.warn('Уведомления не найдены');
      return;
    }
    
    // Обновляем статус уведомления в локальном состоянии
    const updatedNotifications = user.notifications.map(notification => 
      notification.id === notificationId ? {...notification, read} : notification
    );
    
    setUser({
      ...user,
      notifications: updatedNotifications
    });
    
    // В реальном приложении здесь был бы запрос к API для обновления статуса на сервере
    // Например:
    // return fetch(`/api/notifications/${notificationId}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ read })
    // }).then(response => response.json());
  };
  
  // Обновление настроек приватности
  const updatePrivacySettings = (settings: {profileVisibility?: string; showGenerations?: boolean; allowComments?: boolean; allowMessages?: boolean}) => {
    if (!user) return;
    
    // Создаем настройки по умолчанию, если они отсутствуют
    const currentSettings = user.privacySettings || {
      profileVisibility: 'public',
      showGenerations: true,
      allowComments: true,
      allowMessages: true
    };
    
    const updatedSettings = {
      ...currentSettings,
      ...settings
    };
    
    setUser({
      ...user,
      privacySettings: updatedSettings
    });
    
    // В реальном приложении здесь был бы запрос к API для обновления настроек на сервере
    // Например:
    // return fetch('/api/user/privacy', {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(settings)
    // }).then(response => response.json());
  };
  
  // Функция для обновления количества кредитов пользователя
  const updateCredits = async (amount: number) => {
    if (!user) return;
    
    try {
      // Сохраняем предыдущее значение кредитов для возможного отката
      const previousCredits = user.credits || 0;
      
      // Обновляем количество кредитов в состоянии пользователя
      setUser({
        ...user,
        credits: previousCredits + amount
      });
      
      // Создаем и диспатчим событие обновления кредитов для синхронизации UI
      const event = new Event('creditsUpdated');
      window.dispatchEvent(event);
      
      // Отправляем запрос к API для обновления кредитов в базе данных
      const response = await fetch('/api/user/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Ошибка при обновлении кредитов:', errorData.error);
        // В случае ошибки возвращаем предыдущее значение
        setUser({
          ...user,
          credits: previousCredits
        });
      } else {
        // Получаем обновленные данные о кредитах
        const data = await response.json();
        // Обновляем состояние с точными данными с сервера
        setUser({
          ...user,
          credits: data.credits.total
        });
      }
    } catch (error) {
      console.error('Ошибка при обновлении кредитов:', error);
      // В случае ошибки возвращаем предыдущее значение
      setUser({
        ...user,
        credits: user.credits || 0
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        login,
        logout,
        fetchUserProfile,
        updateProfile,
        updateNotificationStatus,
        updatePrivacySettings,
        updateCredits
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}