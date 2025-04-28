"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Save, Layout, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";

interface AppearanceSettingsProps {
  onSave?: () => void;
}

export function AppearanceSettings({ onSave }: AppearanceSettingsProps) {
  // Состояние для настроек внешнего вида
  const [colorTheme, setColorTheme] = useState<string>('system');
  const [uiDensity, setUiDensity] = useState<string>('comfortable');
  const [particles, setParticles] = useState<boolean>(true);
  const [transitions, setTransitions] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [hapticFeedback, setHapticFeedback] = useState<boolean>(false);
  const [standardView, setStandardView] = useState<boolean>(true);
  const [galleryGrid, setGalleryGrid] = useState<boolean>(true);
  const [galleryInfo, setGalleryInfo] = useState<boolean>(true);
  const [galleryAutosave, setGalleryAutosave] = useState<boolean>(false);
  const [galleryPrompt, setGalleryPrompt] = useState<boolean>(true);
  
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { setTheme } = useTheme();
  
  // Загрузка настроек из localStorage при монтировании компонента
  useEffect(() => {
    const savedSettings = localStorage.getItem('appearanceSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setColorTheme(settings.colorTheme || 'system');
      setUiDensity(settings.uiDensity || 'comfortable');
      setParticles(settings.particles !== undefined ? settings.particles : true);
      setTransitions(settings.transitions !== undefined ? settings.transitions : true);
      setReducedMotion(settings.reducedMotion || false);
      setHapticFeedback(settings.hapticFeedback || false);
      setStandardView(settings.standardView !== undefined ? settings.standardView : true);
      setGalleryGrid(settings.galleryGrid !== undefined ? settings.galleryGrid : true);
      setGalleryInfo(settings.galleryInfo !== undefined ? settings.galleryInfo : true);
      setGalleryAutosave(settings.galleryAutosave || false);
      setGalleryPrompt(settings.galleryPrompt !== undefined ? settings.galleryPrompt : true);
    }
  }, []);
  
  // Применение темы при изменении colorTheme
  useEffect(() => {
    setTheme(colorTheme);
  }, [colorTheme, setTheme]);
  
  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMessage(null);
    
    try {
      // Сохраняем настройки в localStorage
      const settings = {
        colorTheme,
        uiDensity,
        particles,
        transitions,
        reducedMotion,
        hapticFeedback,
        standardView,
        galleryGrid,
        galleryInfo,
        galleryAutosave,
        galleryPrompt
      };
      
      localStorage.setItem('appearanceSettings', JSON.stringify(settings));
      
      // Имитация запроса на сервер для сохранения настроек
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Показываем сообщение об успехе
      setSuccessMessage('Настройки внешнего вида успешно сохранены');
      
      // Вызываем колбэк, если он предоставлен
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Ошибка при сохранении настроек внешнего вида:', error);
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
        <h3 className="text-sm font-medium">Цветовая тема</h3>
        <RadioGroup value={colorTheme} onValueChange={setColorTheme} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <RadioGroupItem value="light" id="light" className="peer sr-only" />
            <Label
              htmlFor="light"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <Sparkles className="mb-3 h-6 w-6" />
              <div className="font-medium">Светлая</div>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
            <Label
              htmlFor="dark"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <Sparkles className="mb-3 h-6 w-6" />
              <div className="font-medium">Темная</div>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="system" id="system" className="peer sr-only" />
            <Label
              htmlFor="system"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <Sparkles className="mb-3 h-6 w-6" />
              <div className="font-medium">Системная</div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Плотность интерфейса</h3>
        <RadioGroup value={uiDensity} onValueChange={setUiDensity} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <RadioGroupItem value="compact" id="compact" className="peer sr-only" />
            <Label
              htmlFor="compact"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <Layout className="mb-3 h-6 w-6" />
              <div className="font-medium">Компактная</div>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="comfortable" id="comfortable" className="peer sr-only" />
            <Label
              htmlFor="comfortable"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <Layout className="mb-3 h-6 w-6" />
              <div className="font-medium">Комфортная</div>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="spacious" id="spacious" className="peer sr-only" />
            <Label
              htmlFor="spacious"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <Layout className="mb-3 h-6 w-6" />
              <div className="font-medium">Просторная</div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Эффекты и анимации</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="particles" checked={particles} onCheckedChange={setParticles} />
            <Label htmlFor="particles">Фоновые частицы</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="transitions" checked={transitions} onCheckedChange={setTransitions} />
            <Label htmlFor="transitions">Переходы интерфейса</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="reduced-motion" checked={reducedMotion} onCheckedChange={setReducedMotion} />
            <Label htmlFor="reduced-motion">Уменьшенное движение</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="haptic" checked={hapticFeedback} onCheckedChange={setHapticFeedback} />
            <Label htmlFor="haptic">Тактильная обратная связь</Label>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Вид по умолчанию</h3>
        <RadioGroup value={standardView ? "standard" : "advanced"} onValueChange={(value) => setStandardView(value === "standard")} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <RadioGroupItem value="standard" id="standard-view" className="peer sr-only" />
            <Label
              htmlFor="standard-view"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <Sparkles className="mb-3 h-6 w-6" />
              <div className="font-medium">Стандартный режим</div>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Упрощенный интерфейс с основными элементами управления
              </p>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="advanced" id="advanced-view" className="peer sr-only" />
            <Label
              htmlFor="advanced-view"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <Layout className="mb-3 h-6 w-6" />
              <div className="font-medium">Расширенный режим</div>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Полный контроль со всеми параметрами и опциями
              </p>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Настройки просмотра галереи</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="auto-grid" checked={galleryGrid} onCheckedChange={setGalleryGrid} />
            <Label htmlFor="auto-grid">Сетка по умолчанию</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="image-info" checked={galleryInfo} onCheckedChange={setGalleryInfo} />
            <Label htmlFor="image-info">Показывать информацию при наведении</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="auto-save" checked={galleryAutosave} onCheckedChange={setGalleryAutosave} />
            <Label htmlFor="auto-save">Автосохранение генераций</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="show-prompt" checked={galleryPrompt} onCheckedChange={setGalleryPrompt} />
            <Label htmlFor="show-prompt">Показывать промпты с изображениями</Label>
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
            <Save className="mr-2 h-4 w-4" />
            Сохранить настройки
          </>
        )}
      </Button>
    </div>
  );
}