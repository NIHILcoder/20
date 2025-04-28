"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ModeToggleProps {
  options: { label: string; value: string }[]
  defaultValue?: string
  onChange?: (value: string) => void
  className?: string
}

export function ModeToggle({ options, defaultValue, onChange, className }: ModeToggleProps) {
  const [activeValue, setActiveValue] = useState(defaultValue || options[0].value)

  const handleChange = (value: string) => {
    setActiveValue(value)
    onChange?.(value)
  }

  const activeIndex = options.findIndex((option) => option.value === activeValue)

  return (
    <div className={cn("mode-toggle-container bg-muted", className)}>
      <div
        className="mode-toggle-slider bg-background"
        style={{
          width: `${100 / options.length}%`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
      {options.map((option) => (
        <Button
          key={option.value}
          variant="ghost"
          size="sm"
          className={cn(
            "relative z-10 rounded-none px-4 py-2",
            activeValue === option.value ? "text-foreground font-medium" : "text-muted-foreground",
          )}
          onClick={() => handleChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}

