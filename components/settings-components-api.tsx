"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Copy, Save, Webhook, Download } from "lucide-react";
import { useLanguage, useLocalTranslation } from "@/components/language-context";

// API Settings component for the settings page
export function APISettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { language } = useLanguage();
  
  // Добавляем переводы для компонента настроек API
  const translations = {
    en: {
      'api.title': 'Your API Keys',
      'api.production_key': 'Production Key',
      'api.development_key': 'Development Key',
      'api.active': 'Active',
      'api.inactive': 'Inactive',
      'api.created': 'Created',
      'api.generate_new_key': 'Generate New Key',
      'api.generating': 'Generating...',
      'api.success_message': 'New {type} API key generated successfully',
      'api.usage': 'API Usage',
      'api.requests': 'requests',
      'api.usage_resets': 'Usage resets on',
      'api.view_documentation': 'View API Documentation',
      'api.download_report': 'Download Usage Report',
      'api.settings': 'API Settings',
      'api.rate_limiting': 'Rate Limiting',
      'api.rate_limiting_desc': 'Limit API requests to prevent abuse',
      'api.webhook_notifications': 'Webhook Notifications',
      'api.webhook_notifications_desc': 'Receive notifications for API events',
      'api.ip_restrictions': 'IP Restrictions',
      'api.ip_restrictions_desc': 'Restrict API access to specific IP addresses',
      'api.saving': 'Saving...',
      'api.save_settings': 'Save API Settings'
    },
    ru: {
      'api.title': 'Ваши API-ключи',
      'api.production_key': 'Рабочий ключ',
      'api.development_key': 'Ключ разработки',
      'api.active': 'Активен',
      'api.inactive': 'Неактивен',
      'api.created': 'Создан',
      'api.generate_new_key': 'Сгенерировать новый ключ',
      'api.generating': 'Генерация...',
      'api.success_message': 'Новый {type} API-ключ успешно сгенерирован',
      'api.usage': 'Использование API',
      'api.requests': 'запросов',
      'api.usage_resets': 'Сброс использования',
      'api.view_documentation': 'Просмотр документации API',
      'api.download_report': 'Скачать отчет использования',
      'api.settings': 'Настройки API',
      'api.rate_limiting': 'Ограничение запросов',
      'api.rate_limiting_desc': 'Ограничение API-запросов для предотвращения злоупотреблений',
      'api.webhook_notifications': 'Webhook-уведомления',
      'api.webhook_notifications_desc': 'Получение уведомлений о событиях API',
      'api.ip_restrictions': 'Ограничения по IP',
      'api.ip_restrictions_desc': 'Ограничение доступа к API для определенных IP-адресов',
      'api.saving': 'Сохранение...',
      'api.save_settings': 'Сохранить настройки API'
    }
  };
  
  const t = useLocalTranslation(translations);
  
  // API keys state
  const [apiKeys, setApiKeys] = useState({
    production: {
      key: "sk_prod_xxxxxxxxxxxxxxxxxxxx",
      created: "2023-10-15",
      active: true
    },
    development: {
      key: "sk_dev_xxxxxxxxxxxxxxxxxxxx",
      created: "2023-11-02",
      active: true
    }
  });
  
  // API usage state
  const [apiUsage, setApiUsage] = useState({
    requests: 1250,
    limit: 5000,
    resetDate: "2023-12-01"
  });
  
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    // Could add a toast notification here
  };
  
  const handleGenerateNewKey = async (type: 'production' | 'development') => {
    setIsSaving(true);
    
    try {
      // В реальном приложении здесь был бы запрос к API для генерации нового ключа
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update with a "new" key (in a real app, this would come from the server)
      const newKey = `sk_${type.substring(0, 4)}_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      
      // Сохраняем новый ключ в базу данных (в реальном приложении)
      // await updateApiKey(userId, type, newKey);
      
      setApiKeys(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          key: newKey,
          created: new Date().toISOString().split('T')[0]
        }
      }));
      
      // Локализованное сообщение об успехе
      const typeLabel = type === 'production' 
        ? (language === 'en' ? 'production' : 'рабочий')
        : (language === 'en' ? 'development' : 'разработки');
      
      setSuccessMessage(t.localT('api.success_message').replace('{type}', typeLabel));
    } catch (error) {
      console.error('Error generating new API key:', error);
    } finally {
      setIsSaving(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
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
        <h3 className="text-sm font-medium">{t.localT('api.title')}</h3>
        <div className="space-y-4">
          {/* Production Key */}
          <div className="rounded-lg border p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">{t.localT('api.production_key')}</h4>
              <Badge variant={apiKeys.production.active ? "default" : "outline"} className={apiKeys.production.active ? "bg-green-500" : ""}>
                {apiKeys.production.active ? t.localT('api.active') : t.localT('api.inactive')}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <Input 
                value={apiKeys.production.key} 
                readOnly 
                className="font-mono text-sm" 
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleCopyKey(apiKeys.production.key)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>{t.localT('api.created')}: {apiKeys.production.created}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleGenerateNewKey('production')}
                disabled={isSaving}
              >
                {isSaving ? t.localT('api.generating') : t.localT('api.generate_new_key')}
              </Button>
            </div>
          </div>
          
          {/* Development Key */}
          <div className="rounded-lg border p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">{t.localT('api.development_key')}</h4>
              <Badge variant={apiKeys.development.active ? "default" : "outline"} className={apiKeys.development.active ? "bg-green-500" : ""}>
                {apiKeys.development.active ? t.localT('api.active') : t.localT('api.inactive')}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <Input 
                value={apiKeys.development.key} 
                readOnly 
                className="font-mono text-sm" 
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleCopyKey(apiKeys.development.key)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>{t.localT('api.created')}: {apiKeys.development.created}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleGenerateNewKey('development')}
                disabled={isSaving}
              >
                {isSaving ? t.localT('api.generating') : t.localT('api.generate_new_key')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">{t.localT('api.usage')}</h3>
          <span className="text-sm text-muted-foreground">{apiUsage.requests} / {apiUsage.limit} {t.localT('api.requests')}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary" 
            style={{ width: `${(apiUsage.requests / apiUsage.limit) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-muted-foreground">{t.localT('api.usage_resets')} {apiUsage.resetDate}</p>
        
        <div className="flex space-x-4">
          <Button variant="outline" size="sm">
            <Webhook className="mr-2 h-4 w-4" />
            {t.localT('api.view_documentation')}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t.localT('api.download_report')}
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="text-sm font-medium">{t.localT('api.settings')}</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="rate-limiting">{t.localT('api.rate_limiting')}</Label>
              <p className="text-sm text-muted-foreground">{t.localT('api.rate_limiting_desc')}</p>
            </div>
            <Switch id="rate-limiting" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="webhook-notifications">{t.localT('api.webhook_notifications')}</Label>
              <p className="text-sm text-muted-foreground">{t.localT('api.webhook_notifications_desc')}</p>
            </div>
            <Switch id="webhook-notifications" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ip-restrictions">{t.localT('api.ip_restrictions')}</Label>
              <p className="text-sm text-muted-foreground">{t.localT('api.ip_restrictions_desc')}</p>
            </div>
            <Switch id="ip-restrictions" />
          </div>
        </div>
      </div>
      
      <Button disabled={isSaving}>
        {isSaving ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
            {t.localT('api.saving')}
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            {t.localT('api.save_settings')}
          </>
        )}
      </Button>
    </div>
  );
}