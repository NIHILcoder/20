"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ParticlesBackground } from "@/components/particles-background";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  BookmarkPlus, 
  Share2, 
  Star,
  Video,
  Play
} from "lucide-react";
import { useLanguage, useLocalTranslation } from "@/components/language-context";
import Link from "next/link";

// Import data for related resources
import { guides, tutorials, courses } from "@/data/learning-resources";

export default function GuideDetailPage() {
  const params = useParams();
  const { language } = useLanguage();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // In a real app, you would fetch the guide data based on the ID
  // For this example, we'll use a hardcoded guide
  const guide = {
    id: "model-parameters",
    title: "Understanding Model Parameters",
    description: "Learn how different parameters affect your generations and how to optimize them for better results.",
    category: "Technical",
    readTime: "8 min",
    author: "AI Model Expert",
    date: "April 10, 2024",
    content: `
# Understanding Model Parameters

## Introduction

When working with AI art generation models, understanding the various parameters is crucial for getting the best results. This guide explores the key parameters, their effects, and how to optimize them for your specific needs.

## Key Parameters

### Sampling Steps

Sampling steps determine how many iterations the AI performs to refine the image from noise. More steps generally produce more detailed results but take longer to generate.

- **Low steps (15-25)**: Faster generations, but may lack detail
- **Medium steps (30-50)**: Good balance of quality and speed for most use cases
- **High steps (60-100)**: Maximum detail, but diminishing returns above 70 steps

### Guidance Scale (CFG Scale)

The guidance scale (or CFG scale) determines how closely the AI follows your prompt. Higher values make the AI adhere more strictly to the prompt, while lower values allow more creativity.

- **Low CFG (1-4)**: More creative, artistic results that may deviate from the prompt
- **Medium CFG (7-11)**: Balanced adherence to prompt while maintaining aesthetics
- **High CFG (15-30)**: Strict prompt following, may produce unnatural results at very high values

### Sampling Methods

Different sampling methods produce different aesthetic results:

- **Euler a**: Good general-purpose sampler, produces clean results
- **DPM++ 2M Karras**: Excellent detail and texture
- **DDIM**: Fast but sometimes less detailed
- **DPM++ SDE Karras**: Good for painterly effects

## Optimizing Parameters for Different Scenarios

### Portraits
- Sampling Steps: 30-40
- CFG Scale: 7-9
- Sampler: DPM++ 2M Karras

### Landscapes
- Sampling Steps: 40-60
- CFG Scale: 7-8
- Sampler: Euler a

### Abstract Art
- Sampling Steps: 20-30
- CFG Scale: 3-5
- Sampler: DPM++ SDE Karras

## Advanced Parameter Combinations

Certain parameter combinations work particularly well together. Here are some recommended settings:

### High Detail Setting
- Sampling Steps: 50
- CFG Scale: 7
- Sampler: DPM++ 2M Karras
- Add to prompt: "highly detailed, intricate"

### Artistic Painting Setting
- Sampling Steps: 30
- CFG Scale: 4
- Sampler: DPM++ SDE Karras
- Add to prompt: "artistic, painterly, expressive brushstrokes"

## Conclusion

Experimenting with different parameter combinations is key to finding what works best for your specific style and needs. Use this guide as a starting point, but don't be afraid to explore and develop your own preferred settings.
    `,
    prerequisites: [
      "Basic understanding of AI art generation",
      "Experience with at least one generation model"
    ],
    whatYouWillLearn: [
      "How sampling steps affect image quality",
      "The role of guidance scale in prompt adherence",
      "Different sampling methods and their effects",
      "Optimal parameter combinations for different styles"
    ],
    partOfSeries: true,
    seriesName: "Technical AI Art Fundamentals",
    seriesPosition: 1,
    totalInSeries: 3,
    nextGuide: {
      title: "Effective Negative Prompts",
      link: "/guides/negative-prompts"
    },
    relatedGuides: [
      "guide.3.title", // Effective Negative Prompts
      "guide.6.title", // Optimizing for Different Aspect Ratios
    ],
    relatedTutorials: [
      "tutorial.1.title", // Getting Started with VisioMera
    ]
  };

  // Page-specific translations
  const pageTranslations = {
    en: {
      'guide.back': 'Back to Guides',
      'guide.category': 'Category',
      'guide.readTime': 'Read Time',
      'guide.author': 'Author',
      'guide.published': 'Published',
      'guide.share': 'Share',
      'guide.bookmark': 'Bookmark',
      'guide.bookmarked': 'Bookmarked',
      'guide.like': 'Like',
      'guide.liked': 'Liked',
      'guide.series': 'Part of Series',
      'guide.prerequisites': 'Prerequisites',
      'guide.whatYouWillLearn': 'What You\'ll Learn',
      'guide.relatedResources': 'Related Resources',
      'guide.nextGuide': 'Next Guide in Series',
      'guide.relatedGuides': 'Related Guides',
      'guide.relatedTutorials': 'Related Tutorials',
    },
    ru: {
      'guide.back': 'Назад к руководствам',
      'guide.category': 'Категория',
      'guide.readTime': 'Время чтения',
      'guide.author': 'Автор',
      'guide.published': 'Опубликовано',
      'guide.share': 'Поделиться',
      'guide.bookmark': 'Сохранить',
      'guide.bookmarked': 'Сохранено',
      'guide.like': 'Нравится',
      'guide.liked': 'Понравилось',
      'guide.series': 'Часть серии',
      'guide.prerequisites': 'Предварительные требования',
      'guide.whatYouWillLearn': 'Чему вы научитесь',
      'guide.relatedResources': 'Похожие ресурсы',
      'guide.nextGuide': 'Следующее руководство в серии',
      'guide.relatedGuides': 'Похожие руководства',
      'guide.relatedTutorials': 'Похожие уроки',
    }
  };

  const { localT } = useLocalTranslation(pageTranslations);

  // Find related guides and tutorials
  const relatedGuides = guides.filter(g => 
    guide.relatedGuides.includes(g.titleKey) || 
    guide.relatedGuides.includes(g.title)
  ).slice(0, 2);

  const relatedTutorials = tutorials.filter(t => 
    guide.relatedTutorials.includes(t.titleKey) ||
    guide.relatedTutorials.includes(t.title)
  ).slice(0, 2);

  return (
    <div className="container relative mx-auto py-8">
      <ParticlesBackground />

      <div className="mb-8">
        <Link href="/learning" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="mr-1 h-4 w-4" />
          {localT('guide.back')}
        </Link>

        <h1 className="text-3xl font-bold mb-4">{guide.title}</h1>
        <p className="text-xl text-muted-foreground mb-6">{guide.description}</p>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center">
            <Badge className="mr-2">{guide.category}</Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-4 w-4" />
              {guide.readTime} {localT('guide.readTime')}
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className={liked ? "text-red-500" : ""}
              onClick={() => setLiked(!liked)}
            >
              <Heart className={`mr-1 h-4 w-4 ${liked ? "fill-red-500" : ""}`} />
              {liked ? localT('guide.liked') : localT('guide.like')}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className={bookmarked ? "text-primary" : ""}
              onClick={() => setBookmarked(!bookmarked)}
            >
              <BookmarkPlus className={`mr-1 h-4 w-4 ${bookmarked ? "fill-primary" : ""}`} />
              {bookmarked ? localT('guide.bookmarked') : localT('guide.bookmark')}
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-1 h-4 w-4" />
              {localT('guide.share')}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 p-4 bg-muted/30 rounded-lg mb-8">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">{localT('guide.author')}</h3>
            <p className="font-medium">{guide.author}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">{localT('guide.published')}</h3>
            <p className="font-medium">{guide.date}</p>
          </div>
          {guide.partOfSeries && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">{localT('guide.series')}</h3>
              <p className="font-medium">{guide.seriesName} ({guide.seriesPosition}/{guide.totalInSeries})</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="order-2 lg:order-1 lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Prerequisites */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{localT('guide.prerequisites')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {guide.prerequisites.map((prerequisite, index) => (
                    <li key={index} className="text-sm">{prerequisite}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{localT('guide.whatYouWillLearn')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {guide.whatYouWillLearn.map((item, index) => (
                    <li key={index} className="text-sm">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Next in Series */}
            {guide.nextGuide && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{localT('guide.nextGuide')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={guide.nextGuide.link} className="text-primary hover:underline">
                    {guide.nextGuide.title} <ChevronRight className="inline h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="order-1 lg:order-2 lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: guide.content }} />
              </div>
            </CardContent>
          </Card>

          {/* Related Resources */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">{localT('guide.relatedResources')}</h2>
            
            <Tabs defaultValue="guides">
              <TabsList className="mb-4">
                <TabsTrigger value="guides">{localT('guide.relatedGuides')}</TabsTrigger>
                <TabsTrigger value="tutorials">{localT('guide.relatedTutorials')}</TabsTrigger>
              </TabsList>

              {/* Related Guides */}
              <TabsContent value="guides" className="mt-0">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {relatedGuides.map((relatedGuide, index) => (
                    <Link href={relatedGuide.link} key={index} className="block">
                      <Card className="hover:shadow-md transition-shadow duration-300">
                        <CardContent className="p-4">
                          <Badge className="mb-2">
                            {relatedGuide.categoryKey ? localT(relatedGuide.categoryKey) : relatedGuide.category}
                          </Badge>
                          <h3 className="font-bold">
                            {relatedGuide.titleKey ? localT(relatedGuide.titleKey) : relatedGuide.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {relatedGuide.descriptionKey ? localT(relatedGuide.descriptionKey) : relatedGuide.description}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </TabsContent>

              {/* Related Tutorials */}
              <TabsContent value="tutorials" className="mt-0">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {relatedTutorials.map((relatedTutorial, index) => (
                    <Link href={relatedTutorial.link} key={index} className="block">
                      <Card className="hover:shadow-md transition-shadow duration-300">
                        <div className="relative aspect-video">
                          <img
                            src={relatedTutorial.image || "/placeholder.svg"}
                            alt={relatedTutorial.titleKey ? localT(relatedTutorial.titleKey) : relatedTutorial.title}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                            <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full">
                              <Play className="h-6 w-6" />
                            </Button>
                          </div>
                          <Badge className="absolute left-2 top-2 bg-black/70">
                            <Video className="mr-1 h-3 w-3" />
                            Video
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-bold">
                            {relatedTutorial.titleKey ? localT(relatedTutorial.titleKey) : relatedTutorial.title}
                          </h3>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {relatedTutorial.durationKey ? localT(relatedTutorial.durationKey) : relatedTutorial.duration}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}