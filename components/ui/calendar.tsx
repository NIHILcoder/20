"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface CalendarProps {
  className?: string
  selected?: Date
  onSelect?: (date: Date | null) => void
  disabled?: (date: Date) => boolean
  showOutsideDays?: boolean
  mode?: "single" | "multiple" | "range"
}

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]

function Calendar({
  className,
  selected,
  onSelect,
  disabled,
  showOutsideDays = true,
  mode = "single",
  ...props
}: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(selected || new Date())
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  // Получаем первый день месяца и количество дней
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  
  // Получаем день недели первого дня (0 = воскресенье, нужно конвертировать в понедельник = 0)
  const startDayOfWeek = (firstDay.getDay() + 6) % 7
  
  // Создаем массив дней для отображения
  const calendarDays = []
  
  // Добавляем дни предыдущего месяца
  if (showOutsideDays) {
    const prevMonth = new Date(year, month - 1, 0)
    const prevMonthDays = prevMonth.getDate()
    
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      calendarDays.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
        isToday: false
      })
    }
  }
  
  // Добавляем дни текущего месяца
  const today = new Date()
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    calendarDays.push({
      date,
      isCurrentMonth: true,
      isToday: date.toDateString() === today.toDateString()
    })
  }
  
  // Добавляем дни следующего месяца
  if (showOutsideDays) {
    const remainingCells = 42 - calendarDays.length // 6 недель * 7 дней
    for (let day = 1; day <= remainingCells; day++) {
      calendarDays.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isToday: false
      })
    }
  }
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }
  
  const handleDateClick = (date: Date) => {
    if (disabled && disabled(date)) return
    onSelect?.(date)
  }
  
  const isSelected = (date: Date) => {
    return selected && date.toDateString() === selected.toDateString()
  }
  
  const isDisabled = (date: Date) => {
    return disabled ? disabled(date) : false
  }
  
  return (
    <div className={cn("p-3", className)} {...props}>
      {/* Заголовок с навигацией */}
      <div className="flex justify-center pt-1 relative items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-sm font-medium">
          {MONTHS[month]} {year}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Дни недели */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="h-9 w-9 text-center text-[0.8rem] font-normal text-muted-foreground flex items-center justify-center"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Календарная сетка */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const dayDisabled = isDisabled(day.date)
          const daySelected = isSelected(day.date)
          
          return (
            <button
              key={index}
              onClick={() => handleDateClick(day.date)}
              disabled={dayDisabled}
              className={cn(
                "h-9 w-9 p-0 font-normal text-sm rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:bg-primary focus:text-primary-foreground focus:outline-none",
                // Выбранный день
                daySelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                // Сегодня
                day.isToday && !daySelected && "bg-accent text-accent-foreground font-semibold",
                // Дни других месяцев
                !day.isCurrentMonth && "text-muted-foreground opacity-50",
                // Отключенные дни
                dayDisabled && "text-muted-foreground opacity-30 cursor-not-allowed hover:bg-transparent"
              )}
            >
              {day.date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }