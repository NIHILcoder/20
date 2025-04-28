"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Save,
  CreditCard,
  Download,
  Shield,
  Plus,
  Bell,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { AppearanceSettings } from "./appearance-settings";
import { ChangePasswordForm } from "./change-password-form";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { useAuth } from "./auth-context";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLanguage } from "./language-context";

export function NotificationSettings() {
  const { user, updateNotificationStatus } = useAuth();
  const { t } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Состояние для настроек уведомлений
  const [emailNotifications, setEmailNotifications] = useState({
    account: true,
    comments: false,
    likes: false,
    features: false,
    tips: false,
  });

  const [inAppNotifications, setInAppNotifications] = useState({
    comments: true,
    likes: true,
    follows: true,
    mentions: true,
    competitions: true,
    generation: true,
  });

  const [quietHours, setQuietHours] = useState({
    from: "22:00",
    to: "08:00",
    weekendPause: false,
  });

  // Загрузка уведомлений пользователя
  useEffect(() => {
    if (user && user.notifications) {
      // Здесь можно обработать уведомления пользователя, если нужно
      // Например, отметить все как прочитанные
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMessage(null);

    try {
      // Имитация запроса на сервер для сохранения настроек
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Показываем сообщение об успехе
      setSuccessMessage("Настройки уведомлений успешно сохранены");
    } catch (error) {
      console.error("Ошибка при сохранении настроек уведомлений:", error);
    } finally {
      setIsSaving(false);

      // Скрываем сообщение об успехе через 3 секунды
      if (successMessage) {
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };

  // Функция для отметки всех уведомлений как прочитанных
  const markAllAsRead = () => {
    if (user && user.notifications) {
      user.notifications.forEach((notification) => {
        if (!notification.read) {
          updateNotificationStatus(notification.id, true);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="text-sm text-green-600 dark:text-green-500 p-2 bg-green-50 dark:bg-green-900/20 rounded">
          {successMessage}
        </div>
      )}

      {user && user.notifications && user.notifications.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium">Текущие уведомления</h3>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3 max-h-[300px] overflow-auto">
                {user.notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-md ${
                      !notification.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {notification.description}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {notification.time}
                        </div>
                      </div>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            updateNotificationStatus(notification.id, true)
                          }
                        >
                          Отметить как прочитанное
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Отметить все как прочитанные
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Email уведомления</h3>
        <div className="space-y-2">
          {[
            {
              id: "email-account",
              label: "Обновления аккаунта и оповещения безопасности",
              state: emailNotifications.account,
              setState: (val: boolean) =>
                setEmailNotifications({ ...emailNotifications, account: val }),
            },
            {
              id: "email-comments",
              label: "Комментарии к вашим работам",
              state: emailNotifications.comments,
              setState: (val: boolean) =>
                setEmailNotifications({ ...emailNotifications, comments: val }),
            },
            {
              id: "email-likes",
              label: "Лайки и реакции",
              state: emailNotifications.likes,
              setState: (val: boolean) =>
                setEmailNotifications({ ...emailNotifications, likes: val }),
            },
            {
              id: "email-features",
              label: "Новые функции и объявления",
              state: emailNotifications.features,
              setState: (val: boolean) =>
                setEmailNotifications({ ...emailNotifications, features: val }),
            },
            {
              id: "email-tips",
              label: "Советы и рекомендации",
              state: emailNotifications.tips,
              setState: (val: boolean) =>
                setEmailNotifications({ ...emailNotifications, tips: val }),
            },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <Label htmlFor={item.id} className="flex-1">
                {item.label}
              </Label>
              <Switch
                id={item.id}
                checked={item.state}
                onCheckedChange={item.setState}
              />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Уведомления в приложении</h3>
        <div className="space-y-2">
          {[
            {
              id: "inapp-comments",
              label: "Комментарии к вашим работам",
              state: inAppNotifications.comments,
              setState: (val: boolean) =>
                setInAppNotifications({ ...inAppNotifications, comments: val }),
            },
            {
              id: "inapp-likes",
              label: "Лайки и реакции",
              state: inAppNotifications.likes,
              setState: (val: boolean) =>
                setInAppNotifications({ ...inAppNotifications, likes: val }),
            },
            {
              id: "inapp-follows",
              label: "Новые подписчики",
              state: inAppNotifications.follows,
              setState: (val: boolean) =>
                setInAppNotifications({ ...inAppNotifications, follows: val }),
            },
            {
              id: "inapp-mentions",
              label: "Упоминания вашего имени",
              state: inAppNotifications.mentions,
              setState: (val: boolean) =>
                setInAppNotifications({ ...inAppNotifications, mentions: val }),
            },
            {
              id: "inapp-competitions",
              label: "Конкурсы и события",
              state: inAppNotifications.competitions,
              setState: (val: boolean) =>
                setInAppNotifications({
                  ...inAppNotifications,
                  competitions: val,
                }),
            },
            {
              id: "inapp-generation",
              label: "Завершение генерации",
              state: inAppNotifications.generation,
              setState: (val: boolean) =>
                setInAppNotifications({
                  ...inAppNotifications,
                  generation: val,
                }),
            },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <Label htmlFor={item.id} className="flex-1">
                {item.label}
              </Label>
              <Switch
                id={item.id}
                checked={item.state}
                onCheckedChange={item.setState}
              />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Раздел "Тихие часы" - пока не реализован */}
      {/* ... */}

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
            Сохранение...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Сохранить настройки уведомлений
          </>
        )}
      </Button>
    </div>
  );
}

// Компонент настроек приватности
export function PrivacySettings() {
  const { user, updatePrivacySettings } = useAuth();
  const { t } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Состояние для настроек приватности
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showGenerations: true,
    allowComments: true,
    allowMessages: true,
    dataCollection: true,
    searchIndexing: true,
  });

  // Загрузка настроек приватности пользователя
  useEffect(() => {
    if (user?.privacySettings) { // Используем optional chaining для безопасного доступа
      setPrivacy(prev => ({
        ...prev,
        profileVisibility: user.privacySettings?.profileVisibility || prev.profileVisibility,
        // Используем существующие поля из privacy вместо отсутствующих полей
        // activityVisibility заменяем на showGenerations
        showGenerations: user.privacySettings?.showGenerations || prev.showGenerations,
        allowComments: user.privacySettings?.allowComments || prev.allowComments,
        // allowFollowers заменяем на allowMessages
        allowMessages: user.privacySettings?.allowMessages || prev.allowMessages,
      }));
    }
  }, [user]);

  // Effect to handle the success message timeout
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (successMessage) {
      timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }
    // Cleanup function
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [successMessage]);

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMessage(null); // Clear previous message immediately

    try {
      // Обновляем настройки приватности в контексте аутентификации
      // Отправляем только те поля, которые определены в типе в auth-context
      updatePrivacySettings({
        profileVisibility: privacy.profileVisibility,
        showGenerations: privacy.showGenerations,
        allowComments: privacy.allowComments,
        allowMessages: privacy.allowMessages,
        // dataCollection и searchIndexing не включены, так как они не определены в типе
      });
      
      // Для локального состояния сохраняем все поля
      // В реальном приложении здесь можно было бы отправить запрос на сервер
      // с дополнительными полями, если они поддерживаются API

      // Имитация запроса на сервер для сохранения настроек
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Показываем сообщение об успехе *after* operation succeeds
      setSuccessMessage("Настройки приватности успешно сохранены");
    } catch (error) {
      console.error("Ошибка при сохранении настроек приватности:", error);
      // Optionally set an error message state here
    } finally {
      setIsSaving(false); // Re-enable button
      // Remove the incorrect timeout logic from here
    }
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="text-sm text-green-600 dark:text-green-500 p-2 bg-green-50 dark:bg-green-900/20 rounded">
          {successMessage}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Видимость профиля</h3>
        <div className="space-y-3">
          <RadioGroup
            value={privacy.profileVisibility}
            onValueChange={(value) =>
              setPrivacy({ ...privacy, profileVisibility: value })
            }
          >
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="public" id="profile-public" />
              <div className="grid gap-1">
                <Label htmlFor="profile-public" className="font-medium">
                  Публичный
                </Label>
                <p className="text-sm text-muted-foreground">
                  Ваш профиль и работы видны всем пользователям
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="followers" id="profile-followers" />
              <div className="grid gap-1">
                <Label htmlFor="profile-followers" className="font-medium">
                  Только подписчики
                </Label>
                <p className="text-sm text-muted-foreground">
                  Ваш профиль и работы видны только вашим подписчикам
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="private" id="profile-private" />
              <div className="grid gap-1">
                <Label htmlFor="profile-private" className="font-medium">
                  Приватный
                </Label>
                <p className="text-sm text-muted-foreground">
                  Ваш профиль скрыт от других пользователей
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Настройки контента</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-generations">
                Показывать мои генерации в профиле
              </Label>
              <p className="text-xs text-muted-foreground">
                Другие пользователи смогут видеть ваши работы
              </p>
            </div>
            <Switch
              id="show-generations"
              checked={privacy.showGenerations}
              onCheckedChange={(value) =>
                setPrivacy({ ...privacy, showGenerations: value })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-comments">Разрешить комментарии</Label>
              <p className="text-xs text-muted-foreground">
                Пользователи смогут комментировать ваши работы
              </p>
            </div>
            <Switch
              id="allow-comments"
              checked={privacy.allowComments}
              onCheckedChange={(value) =>
                setPrivacy({ ...privacy, allowComments: value })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-messages">Разрешить личные сообщения</Label>
              <p className="text-xs text-muted-foreground">
                Пользователи смогут отправлять вам личные сообщения
              </p>
            </div>
            <Switch
              id="allow-messages"
              checked={privacy.allowMessages}
              onCheckedChange={(value) =>
                setPrivacy({ ...privacy, allowMessages: value })
              }
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Данные и приватность</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="data-collection">
                Сбор данных для улучшения сервиса
              </Label>
              <p className="text-xs text-muted-foreground">
                Мы собираем анонимные данные для улучшения работы приложения
              </p>
            </div>
            <Switch
              id="data-collection"
              checked={privacy.dataCollection}
              onCheckedChange={(value) =>
                setPrivacy({ ...privacy, dataCollection: value })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="search-indexing">
                Индексация в поисковых системах
              </Label>
              <p className="text-xs text-muted-foreground">
                Разрешить поисковым системам индексировать ваш профиль
              </p>
            </div>
            <Switch
              id="search-indexing"
              checked={privacy.searchIndexing}
              onCheckedChange={(value) =>
                setPrivacy({ ...privacy, searchIndexing: value })
              }
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Управление данными</h3>
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h4 className="font-medium mb-1">Экспорт данных</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Скачайте копию ваших данных, включая информацию профиля, работы и
              активность аккаунта
            </p>
            <Button variant="outline" size="sm" onClick={() => console.log('Запрос на экспорт данных инициирован.')}>
              <Download className="mr-2 h-4 w-4" />
              Запросить экспорт данных
            </Button>
          </div>

          <div className="rounded-lg border p-4">
            <h4 className="font-medium mb-1">Удаление данных</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Если вы хотите, чтобы мы удалили определенный контент или типы
              данных вместо всего аккаунта, вы можете запросить целевое удаление
              данных
            </p>
            <Button variant="outline" size="sm" onClick={() => console.log('Запрос на удаление данных инициирован.')}>
              <Shield className="mr-2 h-4 w-4" />
              Запросить удаление данных
            </Button>
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
            Сохранение...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Сохранить настройки приватности
          </>
        )}
      </Button>
    </div>
  );
}

// Компонент настроек подписки
export function SubscriptionSettings() {
  const { user, fetchUserProfile, updateCredits } = useAuth();
  const { t } = useLanguage();
  const [credits, setCredits] = useState({
    total: 1000,
    used: 0,
  });

  const [currentPlan, setCurrentPlan] = useState("pro");
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Синхронизация кредитов с аккаунтом пользователя
  useEffect(() => {
    if (user && user.credits) {
      // Вычисляем использованные кредиты как разницу между максимальным количеством (1400) и текущим
      // Это обеспечит согласованность с отображением в хедере (183/1400)
      const maxCredits = 1400; // Максимальное количество кредитов
      const usedCredits = maxCredits - user.credits;
      
      setCredits({
        total: maxCredits,
        used: usedCredits,
      });
    }
    // Перемещаем setIsLoading в отдельный useEffect с пустым массивом зависимостей,
    // чтобы он выполнялся только один раз при монтировании компонента
  }, [user]);
  
  // Устанавливаем isLoading в false только при монтировании компонента
  useEffect(() => {
    setIsLoading(false);
  }, []);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Второй useEffect удален, так как он дублирует функциональность первого
  // и приводит к несогласованности данных

  // Функция для отображения сообщений с автоматическим скрытием
  const showMessage = (message: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccessMessage(message);
      setErrorMessage(null);
    } else {
      setErrorMessage(message);
      setSuccessMessage(null);
    }

    // Скрываем сообщение через 3 секунды
    setTimeout(() => {
      if (type === "success") {
        setSuccessMessage(null);
      } else {
        setErrorMessage(null);
      }
    }, 3000);
  };

  // Отслеживание изменений состояния isChangingPlan
  useEffect(() => {
    console.log("isChangingPlan изменился:", isChangingPlan);
  }, [isChangingPlan]);

  // Загрузка данных о подписке при монтировании компонента
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const response = await fetch("/api/subscription");

        // Проверяем тип контента ответа перед парсингом JSON
        const contentType = response.headers.get("content-type");
        let data;

        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          const text = await response.text();
          throw new Error(`Ошибка сервера: ${text.substring(0, 100)}...`);
        }

        if (!response.ok) {
          throw new Error(
            data?.error || "Произошла ошибка при получении данных о подписке"
          );
        }

        // Обновляем данные о подписке
        if (data?.subscription) {
          setCurrentPlan(data.subscription.plan);
          if (data.subscription.credits) {
            setCredits({
              total: data.subscription.credits.total,
              used: data.subscription.credits.used,
            });
          }
        }
      } catch (err: any) {
        console.error("Ошибка при загрузке данных о подписке:", err);
        // Не показываем ошибку пользователю, используем значения по умолчанию
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  const plans = [
    {
      id: "free",
      name: "Бесплатный",
      price: "0 ₽",
      features: [
        "100 кредитов генерации в месяц",
        "Доступ к базовым моделям",
        "Максимальное разрешение: 512×512",
        "Стандартная очередь генерации",
        "Базовые параметры",
        "Только для личного использования",
      ],
      current: currentPlan === "free",
    },
    {
      id: "pro",
      name: "Про",
      price: "999 ₽",
      features: [
        "1000 кредитов генерации в месяц",
        "Доступ ко всем моделям",
        "Максимальное разрешение: 2048×2048",
        "Пrioритетная очередь генерации",
        "Расширенные параметры",
        "Коммерческая лицензия",
        "Доступ к API",
      ],
      popular: true,
      current: currentPlan === "pro",
    },
    {
      id: "business",
      name: "Бизнес",
      price: "4999 ₽",
      features: [
        "5000 кредитов генерации в месяц",
        "Доступ ко всем моделям",
        "Максимальное разрешение: 4096×4096",
        "Наивысший приоритет в очереди",
        "Все параметры",
        "Расширенная коммерческая лицензия",
        "Полный доступ к API",
        "Поддержка ControlNet",
        "Выделенная поддержка",
        "Функции для совместной работы команды",
        "Индивидуальная настройка моделей",
      ],
      current: currentPlan === "business",
    },
  ];

  // Получаем текущий план
  const currentPlanDetails = plans.find((p) => p.id === currentPlan);

  // Функция для изменения плана подписки
  const handleChangePlan = (planId: string) => {
    setSelectedPlan(planId);
    setConfirmDialogOpen(true);
  };

  // Функция для подтверждения изменения плана
  const confirmPlanChange = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Отправляем запрос к API для изменения плана
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId: selectedPlan }),
      });

      // Проверяем тип контента ответа перед парсингом JSON
      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Ошибка сервера: ${text.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(data?.error || "Произошла ошибка при изменении плана");
      }

      // Обновляем состояние после успешного изменения плана
      setCurrentPlan(selectedPlan);
      // Имитация обновления кредитов (в реальном приложении данные придут с сервера)
      const newPlanDetails = plans.find(p => p.id === selectedPlan);
      if (newPlanDetails && user) {
          // Примерное обновление кредитов - замените на реальную логику
          const newTotalCredits = newPlanDetails.id === 'free' ? 100 : newPlanDetails.id === 'pro' ? 1000 : 5000;
          
          // Рассчитываем разницу в кредитах для обновления глобального состояния
          const creditsDifference = newTotalCredits - (user.credits || 0);
          
          // Обновляем локальное состояние кредитов
          setCredits({ total: newTotalCredits, used: 0 }); // Сбрасываем использованные кредиты при смене плана
          
          // Обновляем глобальное состояние пользователя через контекст авторизации
          // Это вызовет событие creditsUpdated и обновит кредиты в топ-баре
          updateCredits(creditsDifference);
      }

      showMessage("План подписки успешно изменен!", "success");
      setConfirmDialogOpen(false);
      setSelectedPlan(null);
      // Обновляем профиль пользователя, чтобы получить актуальные данные о кредитах
      fetchUserProfile();

    } catch (err: any) {
      console.error("Ошибка при изменении плана:", err);
      showMessage(err.message || "Не удалось изменить план подписки.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Функция для покупки дополнительных кредитов
  const handleBuyCredits = async () => {
    setIsProcessing(true);

    try {
      // Отправляем запрос к API для покупки кредитов
      const response = await fetch("/api/subscription/credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: 100 }),
      });

      // Проверяем тип контента ответа перед парсингом JSON
      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Ошибка сервера: ${text.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(data?.error || "Произошла ошибка при покупке кредитов");
      }

      // Обновляем количество кредитов из ответа API
      if (data?.credits) {
        // Обновляем локальное состояние кредитов
        setCredits({
          total: data.credits.total,
          used: data.credits.used,
        });
        
        // Обновляем глобальное состояние пользователя через контекст авторизации
        // Передаем точное количество добавленных кредитов
        updateCredits(data.credits.added);
        
        // Обновляем профиль пользователя для синхронизации данных
        // Это обеспечит актуальность данных во всем приложении
        await fetchUserProfile();
      } else {
        // Резервное обновление, если API не вернул данные о кредитах
        setCredits((prev) => ({ ...prev, total: prev.total + 100 }));
        
        // Обновляем глобальное состояние пользователя через контекст авторизации
        updateCredits(100);
      }

      showMessage(
        data?.message || "Вы успешно приобрели 100 дополнительных кредитов",
        "success"
      );
    } catch (err: any) {
      console.error("Ошибка при покупке кредитов:", err);
      showMessage(err.message || "Произошла ошибка при покупке кредитов", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Показываем индикатор загрузки, пока данные о подписке загружаются
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
        <span>Загрузка информации о подписке...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="text-sm text-green-600 dark:text-green-500 p-2 bg-green-50 dark:bg-green-900/20 rounded">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="text-sm text-red-600 dark:text-red-500 p-2 bg-red-50 dark:bg-red-900/20 rounded">
          {errorMessage}
        </div>
      )}

      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-lg">
              {currentPlanDetails?.name} План
            </h3>
            <p className="text-muted-foreground">
              {currentPlanDetails?.price} в месяц
            </p>
          </div>
          <Badge variant="outline" className="bg-primary/10">
            Текущий план
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Ваша следующая дата оплаты: 15 апреля 2025 г.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Используем функциональное обновление состояния для гарантии правильного обновления
            setIsChangingPlan((prevState) => {
              const newState = !prevState;
              console.log(
                "Изменение состояния isChangingPlan с",
                prevState,
                "на",
                newState
              );
              return newState;
            });
          }}
          type="button"
          data-testid="manage-subscription-button"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Управление подпиской
        </Button>
      </div>

      {/* Диалоговое окно подтверждения изменения плана */}
      {confirmDialogOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
          onClick={(e) => {
            // Закрываем диалог при клике на затемненный фон
            if (e.target === e.currentTarget) {
              setConfirmDialogOpen(false);
            }
          }}
        >
          <div className="bg-background rounded-lg p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-medium">Подтверждение изменения плана</h3>
            <p>
              Вы уверены, что хотите изменить план подписки на{" "}
              <strong>
                {plans.find((p) => p.id === selectedPlan)?.name}
              </strong>
              ?
            </p>

            {selectedPlan === "free" && currentPlan !== "free" && (
              <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-3 rounded-md text-sm">
                <p>
                  ⚠️ Переход на бесплатный план приведет к потере доступа к
                  премиум-функциям.
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setConfirmDialogOpen(false)}
                disabled={isProcessing}
                type="button"
              >
                Отмена
              </Button>
              <Button
                onClick={() => confirmPlanChange()}
                disabled={isProcessing}
                type="button"
              >
                {isProcessing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                    Обработка...
                  </>
                ) : (
                  "Подтвердить"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Кредиты генерации</h3>
          <span className="text-sm text-muted-foreground">
            {credits.used} / {credits.total}
          </span>
        </div>
        <Progress value={(credits.used / credits.total) * 100} className="h-2" />
        <div className="flex justify-between text-sm">
          <span>Использовано: {credits.used}</span>
          <span>Осталось: {credits.total - credits.used}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleBuyCredits} // Используем новую функцию
          disabled={isProcessing} // Блокируем во время обработки
          >
          <Plus className="mr-2 h-4 w-4" />
          Купить кредиты
        </Button>
      </div>

      <Separator />

      {/* Отображение планов подписки при нажатии на кнопку "Управление подпиской" */}
      {isChangingPlan && (
        <div className="space-y-6" data-testid="subscription-plans">
          <h3 className="text-lg font-medium">Выберите план подписки</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-lg border p-4 space-y-4 relative ${
                  plan.current ? "border-primary" : ""
                } ${plan.popular ? "ring-2 ring-primary" : ""}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 -right-2 bg-primary">
                    Популярный
                  </Badge>
                )}
                <div>
                  <h4 className="font-medium text-lg">{plan.name}</h4>
                  <p className="text-2xl font-bold">{plan.price}</p>
                  <p className="text-sm text-muted-foreground">в месяц</p>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-sm flex items-start">
                      <svg
                        className="h-4 w-4 mr-2 text-green-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.current ? "outline" : "default"}
                  className="w-full"
                  disabled={plan.current || isProcessing}
                  onClick={() => handleChangePlan(plan.id)}
                  type="button"
                >
                  {plan.current ? "Текущий план" : "Выбрать план"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-medium">Возможности плана</h3>
        <ul className="space-y-2">
          {currentPlanDetails?.features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2" />
              {feature}
            </li>
          ))}
        </ul>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            showMessage(
              "Функция просмотра истории платежей будет доступна в ближайшее время",
              "success"
            );
          }}
          type="button"
        >
          <Download className="mr-2 h-4 w-4" />
          Просмотреть историю платежей
        </Button>
      </div>

      {/* Второй блок с планами подписки - отключаем его, так как он может конфликтовать с первым */}
      {false && (
        <>
          <Separator />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Доступные планы</h3>
              <span className="text-sm text-muted-foreground">
                Сравните планы и найдите подходящий для ваших нужд
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-lg border p-4 space-y-4 relative ${
                    plan.id === currentPlan ? "border-primary" : ""
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 -right-2 bg-primary">
                      Самый популярный
                    </Badge>
                  )}
                  {plan.id === currentPlan && (
                    <Badge
                      variant="outline"
                      className="absolute -top-2 -right-2 bg-primary/10"
                    >
                      Текущий план
                    </Badge>
                  )}
                  <div>
                    <h4 className="font-medium">{plan.name}</h4>
                    <p className="text-2xl font-bold">
                      {plan.price}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        в месяц
                      </span>
                    </p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {plan.features.slice(0, 5).map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2" />
                        {feature}
                      </li>
                    ))}
                    {plan.features.length > 5 && (
                      <li className="text-muted-foreground">
                        + {plan.features.length - 5} других возможностей
                      </li>
                    )}
                  </ul>
                  {plan.id !== currentPlan && (
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handleChangePlan(plan.id)}
                      disabled={isProcessing}
                      type="button"
                    >
                      {isProcessing && selectedPlan === plan.id ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                          Обработка...
                        </>
                      ) : (
                        <>Перейти на {plan.name}</>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Диалог подтверждения изменения плана уже определен выше */}
    </div>
  );
}

// Компонент настроек приватности
export function OtherPrivacySettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Состояние для настроек приватности
  const [profilePrivacy, setProfilePrivacy] = useState({
    publicProfile: true,
    searchable: true,
    shareActivity: true,
  });

  const [contentSharing, setContentSharing] = useState({
    autoPublic: false,
    showPrompts: true,
    allowRemix: true,
  });

  const [dataPrivacy, setDataPrivacy] = useState({
    anonAnalytics: true,
    modelTraining: false,
    personalization: true,
  });

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMessage(null);

    try {
      // Имитация запроса на сервер для сохранения настроек
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Показываем сообщение об успехе
      setSuccessMessage("Настройки приватности успешно сохранены");
    } catch (error) {
      console.error("Ошибка при сохранении настроек приватности:", error);
    } finally {
      setIsSaving(false);

      // Скрываем сообщение об успехе через 3 секунды
      if (successMessage) {
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="text-sm text-green-600 dark:text-green-500 p-2 bg-green-50 dark:bg-green-900/20 rounded">
          {successMessage}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Приватность профиля</h3>
        <div className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center space-x-2">
              <Switch
                id="public-profile"
                checked={profilePrivacy.publicProfile}
                onCheckedChange={(val) =>
                  setProfilePrivacy({ ...profilePrivacy, publicProfile: val })
                }
              />
              <Label htmlFor="public-profile">Сделать профиль публичным</Label>
            </div>
            <p className="text-sm text-muted-foreground pl-7">
              Разрешить всем просматривать ваш профиль и работы
            </p>
          </div>

          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center space-x-2">
              <Switch
                id="searchable"
                checked={profilePrivacy.searchable}
                onCheckedChange={(val) =>
                  setProfilePrivacy({ ...profilePrivacy, searchable: val })
                }
              />
              <Label htmlFor="searchable">Профиль в поиске</Label>
            </div>
            <p className="text-sm text-muted-foreground pl-7">
              Разрешить вашему профилю появляться в результатах поиска
            </p>
          </div>

          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center space-x-2">
              <Switch
                id="share-activity"
                checked={profilePrivacy.shareActivity}
                onCheckedChange={(val) =>
                  setProfilePrivacy({
                    ...profilePrivacy,
                    shareActivity: val,
                  })
                }
              />
              <Label htmlFor="share-activity">Делиться активностью</Label>
            </div>
            <p className="text-sm text-muted-foreground pl-7">
              Показывать вашу активность (лайки, комментарии) подписчикам
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Общий доступ к контенту</h3>
        <div className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-public"
                checked={contentSharing.autoPublic}
                onCheckedChange={(val) =>
                  setContentSharing({ ...contentSharing, autoPublic: val })
                }
              />
              <Label htmlFor="auto-public">
                Автоматически делать мои работы публичными
              </Label>
            </div>
            <p className="text-sm text-muted-foreground pl-7">
              Новые генерации будут видны сообществу
            </p>
          </div>

          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-prompts"
                checked={contentSharing.showPrompts}
                onCheckedChange={(val) =>
                  setContentSharing({ ...contentSharing, showPrompts: val })
                }
              />
              <Label htmlFor="show-prompts">
                Делиться моими промптами с сообществом
              </Label>
            </div>
            <p className="text-sm text-muted-foreground pl-7">
              Разрешить другим видеть промпты, использованные для ваших
              публичных работ
            </p>
          </div>

          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center space-x-2">
              <Switch
                id="allow-remix"
                checked={contentSharing.allowRemix}
                onCheckedChange={(val) =>
                  setContentSharing({ ...contentSharing, allowRemix: val })
                }
              />
              <Label htmlFor="allow-remix">
                Разрешить другим переделывать мои работы
              </Label>
            </div>
            <p className="text-sm text-muted-foreground pl-7">
              Позволить участникам сообщества использовать ваши изображения в
              качестве референса для своих работ
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Приватность данных</h3>
        <div className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center space-x-2">
              <Switch
                id="anon-analytics"
                checked={dataPrivacy.anonAnalytics}
                onCheckedChange={(val) =>
                  setDataPrivacy({ ...dataPrivacy, anonAnalytics: val })
                }
              />
              <Label htmlFor="anon-analytics">
                Разрешить анонимную аналитику
              </Label>
            </div>
            <p className="text-sm text-muted-foreground pl-7">
              Помогите нам улучшить сервис, поделившись анонимными данными об
              использовании
            </p>
          </div>

          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center space-x-2">
              <Switch
                id="model-training"
                checked={dataPrivacy.modelTraining}
                onCheckedChange={(val) =>
                  setDataPrivacy({ ...dataPrivacy, modelTraining: val })
                }
              />
              <Label htmlFor="model-training">
                Разрешить вклад в обучение моделей
              </Label>
            </div>
            <p className="text-sm text-muted-foreground pl-7">
              Ваши работы могут быть использованы для улучшения ИИ-моделей
            </p>
          </div>

          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center space-x-2">
              <Switch
                id="personalization"
                checked={dataPrivacy.personalization}
                onCheckedChange={(val) =>
                  setDataPrivacy({ ...dataPrivacy, personalization: val })
                }
              />
              <Label htmlFor="personalization">
                Персонализированный опыт
              </Label>
            </div>
            <p className="text-sm text-muted-foreground pl-7">
              Использовать вашу активность для настройки вашего опыта
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Управление данными</h3>
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h4 className="font-medium mb-1">Экспорт данных</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Скачайте копию ваших данных, включая информацию профиля, работы и
              активность аккаунта
            </p>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Запросить экспорт данных
            </Button>
          </div>

          <div className="rounded-lg border p-4">
            <h4 className="font-medium mb-1">Удаление данных</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Если вы хотите, чтобы мы удалили определенный контент или типы
              данных вместо всего аккаунта, вы можете запросить целевое удаление
              данных
            </p>
            <Button variant="outline" size="sm">
              <Shield className="mr-2 h-4 w-4" />
              Запросить удаление данных
            </Button>
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
            Сохранение...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Сохранить настройки приватности
          </>
        )}
      </Button>
    </div>
  );
}
