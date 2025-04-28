"use client"

import { CardFooter } from "@/components/ui/card"

import type React from "react"

import { useState, useRef } from "react"
import {
  Sparkles,
  Save,
  Share2,
  Download,
  Upload,
  Trash2,
  Copy,
  RefreshCw,
  ChevronDown,
  Wand2,
  Layers,
  Plus,
  Send,
  Maximize2,
  RotateCw,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useScrollLock } from "@/components/hooks/useScrollLock";

interface GenerationFormProps {
  className?: string
}

export function GenerationForm({ className }: GenerationFormProps) {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [recentGenerations, setRecentGenerations] = useState<string[]>([
    "/placeholder.svg?height=512&width=512&text=Recent+1",
    "/placeholder.svg?height=512&width=512&text=Recent+2",
    "/placeholder.svg?height=512&width=512&text=Recent+3",
    "/placeholder.svg?height=512&width=512&text=Recent+4",
  ]);

  // Добавляем состояние для отслеживания открытого диалога
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);

  // Используем хук для предотвращения тряски
  useScrollLock(workflowDialogOpen);

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleGenerate = () => {
    setGenerating(true)
    setProgress(0)

    // Simulate generation process with progress updates
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setGenerating(false)
          setGeneratedImage("/placeholder.svg?height=512&width=512&text=Generated+Image")
          // Add to recent generations
          setRecentGenerations((prev) => [
            "/placeholder.svg?height=512&width=512&text=New+Generation",
            ...prev.slice(0, 3),
          ])
          return 0
        }
        return prev + 5
      })
    }, 200)
  }

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value)
    // Show tag suggestions if the user is typing
    setShowTagSuggestions(e.target.value.length > 0)
  }

  const addTagToPrompt = (tag: string) => {
    setPrompt((prev) => `${prev}, ${tag}`)
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  // Mock tag suggestions based on what the user might be typing
  const tagSuggestions = [
    "detailed",
    "high quality",
    "photorealistic",
    "8k",
    "cinematic lighting",
    "sharp focus",
    "studio quality",
    "professional",
    "trending on artstation",
  ]

  // Style presets with visual examples
  const stylePresets = [
    { name: "Photorealistic", image: "/placeholder.svg?height=100&width=100&text=Photo" },
    { name: "Anime", image: "/placeholder.svg?height=100&width=100&text=Anime" },
    { name: "Oil Painting", image: "/placeholder.svg?height=100&width=100&text=Oil" },
    { name: "Watercolor", image: "/placeholder.svg?height=100&width=100&text=Water" },
    { name: "3D Render", image: "/placeholder.svg?height=100&width=100&text=3D" },
    { name: "Sketch", image: "/placeholder.svg?height=100&width=100&text=Sketch" },
    { name: "Pixel Art", image: "/placeholder.svg?height=100&width=100&text=Pixel" },
    { name: "Fantasy", image: "/placeholder.svg?height=100&width=100&text=Fantasy" },
  ]

  // Model options with visual examples
  const modelOptions = [
    { name: "Flux Realistic", image: "/placeholder.svg?height=80&width=80&text=Flux" },
    { name: "Anime Diffusion", image: "/placeholder.svg?height=80&width=80&text=Anime" },
    { name: "Dreamshaper", image: "/placeholder.svg?height=80&width=80&text=Dream" },
    { name: "Realistic Vision", image: "/placeholder.svg?height=80&width=80&text=Real" },
    { name: "Deliberate", image: "/placeholder.svg?height=80&width=80&text=Delib" },
    { name: "Custom Model", image: "/placeholder.svg?height=80&width=80&text=Custom" },
  ]

  // LoRA options
  const loraOptions = ["Character LoRA", "Style LoRA", "Detail LoRA", "Custom LoRA"]

  return (
    <div className={className}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Create New Image</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left panel - Settings */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Image Settings</CardTitle>
              <CardDescription>Configure your generation parameters</CardDescription>
            </CardHeader>

            <Tabs defaultValue="basic">
              <div className="px-6">
                <TabsList className="w-full">
                  <TabsTrigger value="basic" className="flex-1">
                    Basic
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="flex-1">
                    Advanced
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="basic" className="pt-2">
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Prompt</Label>
                    <div className="relative">
                      <Textarea
                        id="prompt"
                        placeholder="Describe your image in detail..."
                        className="min-h-[100px] resize-none"
                        value={prompt}
                        onChange={handlePromptChange}
                      />

                      {/* Tag suggestions */}
                      {showTagSuggestions && (
                        <div className="absolute bottom-2 left-2 right-2 z-10 rounded-md border bg-popover p-2 shadow-md">
                          <div className="mb-1 text-xs font-medium">Suggested tags:</div>
                          <div className="flex flex-wrap gap-1">
                            {tagSuggestions.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="cursor-pointer hover:bg-secondary"
                                onClick={() => addTagToPrompt(tag)}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Clock className="mr-2 h-3 w-3" />
                            Prompt History
                            <ChevronDown className="ml-2 h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>A beautiful landscape with mountains</DropdownMenuItem>
                          <DropdownMenuItem>Portrait of a woman with blue eyes</DropdownMenuItem>
                          <DropdownMenuItem>Futuristic cityscape at night</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button variant="outline" size="sm">
                        <Save className="mr-2 h-3 w-3" />
                        Save Prompt
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="negative-prompt">Negative Prompt</Label>
                    <Textarea
                      id="negative-prompt"
                      placeholder="Elements to avoid in the image..."
                      className="min-h-[60px] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Select defaultValue="flux">
                        <SelectTrigger id="model">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flux">Flux Realistic</SelectItem>
                          <SelectItem value="anime">Anime Diffusion</SelectItem>
                          <SelectItem value="dreamshaper">Dreamshaper</SelectItem>
                          <SelectItem value="realistic">Realistic Vision</SelectItem>
                          <SelectItem value="deliberate">Deliberate</SelectItem>
                          <SelectItem value="custom">Custom Model</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                      <Select defaultValue="1:1">
                        <SelectTrigger id="aspect-ratio">
                          <SelectValue placeholder="Select ratio" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1:1">1:1 Square</SelectItem>
                          <SelectItem value="4:3">4:3 Standard</SelectItem>
                          <SelectItem value="16:9">16:9 Widescreen</SelectItem>
                          <SelectItem value="9:16">9:16 Portrait</SelectItem>
                          <SelectItem value="2:3">2:3 Portrait</SelectItem>
                          <SelectItem value="3:2">3:2 Landscape</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Style Presets</Label>
                    <ScrollArea className="h-[120px] rounded-md border">
                      <div className="flex flex-wrap gap-2 p-2">
                        {stylePresets.map((style) => (
                          <TooltipProvider key={style.name}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex cursor-pointer flex-col items-center rounded-md border p-1 hover:bg-secondary">
                                  <img
                                    src={style.image || "/placeholder.svg"}
                                    alt={style.name}
                                    className="h-12 w-12 rounded-md object-cover"
                                  />
                                  <span className="mt-1 text-xs">{style.name}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Apply {style.name} style</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="advanced" className="pt-2">
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="seed">Seed</Label>
                    <div className="flex gap-2">
                      <Input id="seed" type="number" placeholder="Random" className="flex-1" />
                      <Button variant="outline" size="icon">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="steps">Sampling Steps</Label>
                      <span className="text-xs text-muted-foreground">30</span>
                    </div>
                    <Slider id="steps" defaultValue={[30]} min={20} max={150} step={1} className="py-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="cfg">CFG Scale</Label>
                      <span className="text-xs text-muted-foreground">7.0</span>
                    </div>
                    <Slider id="cfg" defaultValue={[7]} min={1} max={20} step={0.1} className="py-2" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sampler">Sampler</Label>
                    <Select defaultValue="euler_a">
                      <SelectTrigger id="sampler">
                        <SelectValue placeholder="Select sampler" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="euler_a">Euler Ancestral</SelectItem>
                        <SelectItem value="euler">Euler</SelectItem>
                        <SelectItem value="ddim">DDIM</SelectItem>
                        <SelectItem value="dpm_2">DPM++ 2M</SelectItem>
                        <SelectItem value="dpm_2_a">DPM++ 2M Ancestral</SelectItem>
                        <SelectItem value="lcm">LCM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="batch-size">Batch Size</Label>
                    <Select defaultValue="1">
                      <SelectTrigger id="batch-size">
                        <SelectValue placeholder="Select batch size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Image</SelectItem>
                        <SelectItem value="2">2 Images</SelectItem>
                        <SelectItem value="4">4 Images</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Image to Image</Label>
                    <div className="flex flex-col gap-2">
                      <div
                        className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed"
                        onClick={handleFileUpload}
                      >
                        <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload an image</p>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="img2img-strength">Strength</Label>
                          <span className="text-xs text-muted-foreground">0.75</span>
                        </div>
                        <Slider
                          id="img2img-strength"
                          defaultValue={[0.75]}
                          min={0}
                          max={1}
                          step={0.01}
                          className="py-2"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Model Selection</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {modelOptions.map((model) => (
                        <div
                          key={model.name}
                          className="flex cursor-pointer flex-col items-center rounded-md border p-2 hover:bg-secondary"
                        >
                          <img
                            src={model.image || "/placeholder.svg"}
                            alt={model.name}
                            className="h-16 w-16 rounded-md object-cover"
                          />
                          <span className="mt-1 text-center text-xs">{model.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>LoRA Selection</Label>
                    <div className="flex flex-wrap gap-2">
                      {loraOptions.map((lora) => (
                        <Badge key={lora} variant="outline" className="cursor-pointer hover:bg-secondary">
                          {lora}
                        </Badge>
                      ))}
                      <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                        <Plus className="mr-1 h-3 w-3" />
                        Add LoRA
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </TabsContent>
            </Tabs>

            <CardFooter>
              <Button onClick={handleGenerate} disabled={generating} className="w-full">
                {generating ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating... {progress}%
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right panel - Preview */}
        <div className="space-y-4 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="generation-preview relative">
                {generating ? (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <RotateCw className="mb-4 h-12 w-12 animate-spin text-muted-foreground" />
                    <Progress value={progress} className="w-2/3" />
                    <p className="mt-2 text-sm text-muted-foreground">Generating your image... {progress}%</p>
                  </div>
                ) : generatedImage ? (
                  <>
                    <img
                      src={generatedImage || "/placeholder.svg"}
                      alt="Generated image"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                            >
                              <Maximize2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View fullscreen</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6">
                    <Sparkles className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">Your generated image will appear here</p>
                  </div>
                )}
              </div>

              {/* Recent generations gallery */}
              {recentGenerations.length > 0 && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium">Recent Generations</h3>
                    <Button variant="ghost" size="sm">
                      View all
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {recentGenerations.map((image, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square cursor-pointer overflow-hidden rounded-md"
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Recent generation ${index + 1}`}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-white">
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-white">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>

            {generatedImage && (
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Save to collection</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Share image</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Download image</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Wand2 className="mr-2 h-4 w-4" />
                    Variations
                  </Button>

                  <Button variant="default" size="sm">
                    <Send className="mr-2 h-4 w-4" />
                    Share to Community
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>

          {/* Visual workflow editor for advanced mode */}
          <Dialog open={workflowDialogOpen} onOpenChange={setWorkflowDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Layers className="mr-2 h-4 w-4" />
                Open Visual Workflow Editor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Visual Workflow Editor</DialogTitle>
                <DialogDescription>Create and customize advanced generation workflows</DialogDescription>
              </DialogHeader>
              <div className="h-[500px] rounded-md border bg-muted/20 p-4 modal-scrollable">
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">Visual workflow editor would be displayed here</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}

