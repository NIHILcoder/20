'use client';

import { useState, useEffect } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showValue?: boolean;
  precision?: 'half' | 'full';
}

export function Rating({
  value,
  max = 5,
  onChange,
  readOnly = false,
  size = 'md',
  className,
  showValue = false,
  precision = 'half'
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [internalValue, setInternalValue] = useState(value);

  // Обновляем внутреннее значение при изменении входного значения
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Определяем размеры звезд в зависимости от параметра size
  const starSizes = {
    sm: 'h-3 w-3',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  // Определяем цвета звезд
  const starColors = {
    filled: 'text-yellow-400',
    empty: 'text-gray-300 dark:text-gray-600'
  };

  // Функция для обработки клика по звезде
  const handleClick = (newValue: number) => {
    if (readOnly) return;
    
    // Если кликнули на текущее значение, уменьшаем на 0.5 или 1 в зависимости от precision
    if (precision === 'half' && Math.abs(internalValue - newValue) < 0.1) {
      newValue -= 0.5;
    } else if (precision === 'full' && Math.abs(internalValue - newValue) < 0.1) {
      newValue -= 1;
    }
    
    // Ограничиваем значение между 0 и max
    newValue = Math.max(0, Math.min(newValue, max));
    
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  // Функция для обработки наведения на звезду
  const handleMouseEnter = (newValue: number) => {
    if (readOnly) return;
    setHoverValue(newValue);
  };

  // Функция для обработки ухода курсора со звезды
  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverValue(null);
  };

  // Создаем массив звезд
  const stars = [];
  const displayValue = hoverValue !== null ? hoverValue : internalValue;

  for (let i = 1; i <= max; i++) {
    // Определяем, заполнена ли звезда
    let isFilled = i <= displayValue;
    let isHalfFilled = precision === 'half' && i - 0.5 <= displayValue && i > displayValue;

    stars.push(
      <div
        key={i}
        className={cn('relative cursor-pointer', readOnly && 'cursor-default')}
        onClick={() => handleClick(i)}
        onMouseEnter={() => handleMouseEnter(i)}
        onMouseLeave={handleMouseLeave}
      >
        {isHalfFilled ? (
          <StarHalf className={cn(starSizes[size], starColors.filled)} />
        ) : (
          <Star
            className={cn(
              starSizes[size],
              isFilled ? starColors.filled : starColors.empty
            )}
            fill={isFilled ? 'currentColor' : 'none'}
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">{stars}</div>
      {showValue && (
        <span className="ml-2 text-sm text-muted-foreground">
          {displayValue.toFixed(precision === 'half' ? 1 : 0)}
        </span>
      )}
    </div>
  );
}