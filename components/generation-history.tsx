"use client"

import { useState } from "react"
import { Clock } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface HistoryItem {
  id: string
  image: string
  prompt: string
  date: string
}

export function GenerationHistory() {
  const [open, setOpen] = useState(false)

  // Mock history data
  const historyItems: HistoryItem[] = Array.from({ length: 10 }).map((_, i) => ({
    id: `history-${i}`,
    image: `/placeholder.svg?height=256&width=256&text=Image ${i + 1}`,
    prompt: `A beautiful ${i % 2 === 0 ? "landscape" : "portrait"} with ${
      i % 3 === 0 ? "mountains" : "ocean"
    } in the background`,
    date: new Date(Date.now() - i * 3600000).toLocaleString(),
  }))

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="fixed bottom-4 right-4 z-10 h-12 w-12 rounded-full shadow-lg">
          <Clock className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Generation History</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-6rem)] pr-4">
          <div className="grid gap-4 py-4">
            {historyItems.map((item) => (
              <div key={item.id} className="group flex flex-col overflow-hidden rounded-lg border">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.prompt}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:bg-black/50 group-hover:opacity-100">
                    <Button variant="secondary" size="sm">
                      Regenerate
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm">{item.prompt}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

