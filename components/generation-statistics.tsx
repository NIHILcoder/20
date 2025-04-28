"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage, useLocalTranslation } from "@/components/language-context";
import { Flame, Calendar, Award, BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIcon } from "lucide-react";
import { BarChart, LineChart, PieChart } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";

interface ChartTooltipContext {
  label?: string;
  raw?: number;
  formattedValue?: string;
  dataset?: {
    label?: string;
  };
  dataIndex?: number;
}

export function GenerationStatistics() {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">("week");
  const { language } = useLanguage();

  // Page-specific translations
  const statsTranslations = {
    en: {
      'stats.title': 'Generation Statistics',
      'stats.description': 'Track your AI art generation activity',
      'stats.time_range.day': 'Last 24 Hours',
      'stats.time_range.week': 'Last Week',
      'stats.time_range.month': 'Last Month',
      'stats.time_range.year': 'Last Year',
      'stats.tab.generations': 'Generations',
      'stats.tab.models': 'Model Usage',
      'stats.tab.time': 'Time Spent',
      'stats.total_generations': 'Total Generations',
      'stats.average_per_day': 'Average Per Day',
      'stats.most_active_day': 'Most Active Day',
      'stats.total_time': 'Total Time',
      'stats.average_time': 'Average Per Day',
      'stats.longest_session': 'Longest Session',
      'stats.monday': 'Mon',
      'stats.tuesday': 'Tue',
      'stats.wednesday': 'Wed',
      'stats.thursday': 'Thu',
      'stats.friday': 'Fri',
      'stats.saturday': 'Sat',
      'stats.sunday': 'Sun',
      'stats.minutes': 'min',
      'stats.flux_realistic': 'Flux Realistic',
      'stats.anime_diffusion': 'Anime Diffusion',
      'stats.dreamshaper': 'Dreamshaper',
      'stats.realistic_vision': 'Realistic Vision',
      'stats.other_models': 'Other Models',
    },
    ru: {
      'stats.title': 'Статистика генераций',
      'stats.description': 'Отслеживайте вашу активность по созданию AI-изображений',
      'stats.time_range.day': 'Последние 24 часа',
      'stats.time_range.week': 'Последняя неделя',
      'stats.time_range.month': 'Последний месяц',
      'stats.time_range.year': 'Последний год',
      'stats.tab.generations': 'Генерации',
      'stats.tab.models': 'Использование моделей',
      'stats.tab.time': 'Затраченное время',
      'stats.total_generations': 'Всего генераций',
      'stats.average_per_day': 'Среднее за день',
      'stats.most_active_day': 'Самый активный день',
      'stats.total_time': 'Общее время',
      'stats.average_time': 'Среднее за день',
      'stats.longest_session': 'Самый долгий сеанс',
      'stats.monday': 'Пн',
      'stats.tuesday': 'Вт',
      'stats.wednesday': 'Ср',
      'stats.thursday': 'Чт',
      'stats.friday': 'Пт',
      'stats.saturday': 'Сб',
      'stats.sunday': 'Вс',
      'stats.minutes': 'мин',
      'stats.flux_realistic': 'Flux Реалистичный',
      'stats.anime_diffusion': 'Anime Диффузия',
      'stats.dreamshaper': 'Dreamshaper',
      'stats.realistic_vision': 'Realistic Vision',
      'stats.other_models': 'Другие модели',
    }
  };

  const { localT } = useLocalTranslation(statsTranslations);

  // Get week day labels based on current language
  const getDayLabels = () => {
    return [
      localT('stats.monday'),
      localT('stats.tuesday'),
      localT('stats.wednesday'),
      localT('stats.thursday'),
      localT('stats.friday'),
      localT('stats.saturday'),
      localT('stats.sunday')
    ];
  };

  // Get model names based on current language
  const getModelLabels = () => {
    return [
      localT('stats.flux_realistic'),
      localT('stats.anime_diffusion'),
      localT('stats.dreamshaper'),
      localT('stats.realistic_vision'),
      localT('stats.other_models')
    ];
  };

  // Prepare generation data chart
  const generationData = {
    labels: getDayLabels(),
    datasets: [
      {
        label: localT('stats.tab.generations'),
        data: [12, 19, 8, 15, 12, 25, 18],
        backgroundColor: "rgba(147, 51, 234, 0.7)", // Purple with opacity
        borderColor: "rgb(147, 51, 234)", // Solid purple border
        borderWidth: 2,
      },
    ],
  };

  // Prepare model usage data chart
  const modelUsageData = {
    labels: getModelLabels(),
    datasets: [
      {
        label: localT('stats.tab.models'),
        data: [35, 25, 15, 20, 5],
        backgroundColor: [
          "rgba(147, 51, 234, 0.8)", // Purple
          "rgba(59, 130, 246, 0.8)", // Blue
          "rgba(234, 88, 12, 0.8)",  // Orange
          "rgba(16, 185, 129, 0.8)", // Green
          "rgba(99, 102, 241, 0.8)",  // Indigo
        ],
        borderColor: "rgb(255, 255, 255, 0.3)", // White border
        borderWidth: 2,
      },
    ],
  };

  // Prepare time spent data chart
  const timeSpentData = {
    labels: getDayLabels(),
    datasets: [
      {
        label: localT('stats.tab.time'),
        data: [45, 60, 30, 75, 40, 90, 65],
        borderColor: "rgb(234, 88, 12)", // Orange
        backgroundColor: "rgba(234, 88, 12, 0.2)", // Light orange
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
      <Card className="bg-card/90 backdrop-blur-sm border-muted/50 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChartIcon className="h-5 w-5 text-primary" />
              {localT('stats.title')}
            </CardTitle>
            <CardDescription>{localT('stats.description')}</CardDescription>
          </div>
          <Select value={timeRange} onValueChange={(value: "day" | "week" | "month" | "year") => setTimeRange(value)}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">{localT('stats.time_range.day')}</SelectItem>
              <SelectItem value="week">{localT('stats.time_range.week')}</SelectItem>
              <SelectItem value="month">{localT('stats.time_range.month')}</SelectItem>
              <SelectItem value="year">{localT('stats.time_range.year')}</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="generations">
            <TabsList className="mb-4 bg-muted">
              <TabsTrigger value="generations" className="flex items-center gap-1 data-[state=active]:bg-background">
                <Flame className="h-4 w-4" />
                {localT('stats.tab.generations')}
              </TabsTrigger>
              <TabsTrigger value="models" className="flex items-center gap-1 data-[state=active]:bg-background">
                <PieChartIcon className="h-4 w-4" />
                {localT('stats.tab.models')}
              </TabsTrigger>
              <TabsTrigger value="time" className="flex items-center gap-1 data-[state=active]:bg-background">
                <LineChartIcon className="h-4 w-4" />
                {localT('stats.tab.time')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generations" className="space-y-4">
              <div className="h-[300px] bg-card/95 rounded-lg p-4 border border-muted shadow-sm">
                <BarChart
                    data={generationData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(200, 200, 200, 0.1)', // Subtle grid lines
                          },
                          ticks: {
                            color: 'rgba(200, 200, 200, 0.8)', // Better visible tick labels
                          },
                          title: {
                            display: true,
                            text: localT('stats.tab.generations'),
                            color: 'rgba(200, 200, 200, 0.8)', // Better visible title
                          },
                        },
                        x: {
                          grid: {
                            color: 'rgba(200, 200, 200, 0.1)', // Subtle grid lines
                          },
                          ticks: {
                            color: 'rgba(200, 200, 200, 0.8)', // Better visible tick labels
                          },
                        },
                      },
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          mode: "index",
                          intersect: false,
                          backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark tooltip background
                          titleColor: 'rgba(255, 255, 255, 1)', // White title
                          bodyColor: 'rgba(255, 255, 255, 1)', // White body text
                          borderColor: 'rgba(255, 255, 255, 0.2)', // White border with opacity
                          borderWidth: 1,
                        },
                      },
                    }}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Карточка 1: Всего генераций */}
                <div className="rounded-lg border border-muted p-4 bg-secondary/10">
                  <div className="flex flex-col justify-between h-full">
                    <div className="text-sm text-muted-foreground mb-2">{localT('stats.total_generations')}</div>
                    <div className="text-3xl font-bold">109</div>
                  </div>
                </div>

                {/* Карточка 2: Среднее за день */}
                <div className="rounded-lg border border-muted p-4 bg-secondary/10">
                  <div className="flex flex-col justify-between h-full">
                    <div className="text-sm text-muted-foreground mb-2">{localT('stats.average_per_day')}</div>
                    <div className="text-3xl font-bold">15.6</div>
                  </div>
                </div>

                {/* Карточка 3: Самый активный день */}
                <div className="rounded-lg border border-muted p-4 bg-secondary/10">
                  <div className="flex flex-col justify-between h-full">
                    <div className="text-sm text-muted-foreground mb-2">{localT('stats.most_active_day')}</div>
                    <div className="text-3xl font-bold">{localT('stats.saturday')}</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="models">
              <div className="h-[300px] bg-card/95 rounded-lg p-4 border border-muted shadow-sm">
                <PieChart
                    data={modelUsageData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "right",
                          labels: {
                            color: 'rgba(200, 200, 200, 0.8)', // Better visible legend labels
                            padding: 20,
                            font: {
                              size: 12
                            }
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark tooltip background
                          titleColor: 'rgba(255, 255, 255, 1)', // White title
                          bodyColor: 'rgba(255, 255, 255, 1)', // White body text
                          borderColor: 'rgba(255, 255, 255, 0.2)', // White border with opacity
                          borderWidth: 1,
                          callbacks: {
                            label: (context: ChartTooltipContext) => {
                              const label = context.label || "";
                              const value = context.raw || 0;
                              return `${label}: ${value}%`;
                            },
                          },
                        },
                      },
                    }}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {getModelLabels().map((model, index) => {
                  const colors = ["bg-purple-500", "bg-blue-500", "bg-orange-500", "bg-green-500", "bg-indigo-500"];
                  return (
                      <Badge key={index} className={`${colors[index]} text-white`}>
                        {model}
                      </Badge>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="time">
              <div className="h-[300px] bg-card/95 rounded-lg p-4 border border-muted shadow-sm mb-4">
                <LineChart
                    data={timeSpentData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(200, 200, 200, 0.1)', // Subtle grid lines
                          },
                          ticks: {
                            color: 'rgba(200, 200, 200, 0.8)', // Better visible tick labels
                          },
                          title: {
                            display: true,
                            text: localT('stats.minutes'),
                            color: 'rgba(200, 200, 200, 0.8)', // Better visible title
                          },
                        },
                        x: {
                          grid: {
                            color: 'rgba(200, 200, 200, 0.1)', // Subtle grid lines
                          },
                          ticks: {
                            color: 'rgba(200, 200, 200, 0.8)', // Better visible tick labels
                          },
                        },
                      },
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          mode: "index",
                          intersect: false,
                          backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark tooltip background
                          titleColor: 'rgba(255, 255, 255, 1)', // White title
                          bodyColor: 'rgba(255, 255, 255, 1)', // White body text
                          borderColor: 'rgba(255, 255, 255, 0.2)', // White border with opacity
                          borderWidth: 1,
                        },
                      },
                    }}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Карточка 1: Общее время */}
                <div className="rounded-lg border border-muted p-4 bg-secondary/10">
                  <div className="flex flex-col justify-between h-full">
                    <div className="text-sm text-muted-foreground mb-2">{localT('stats.total_time')}</div>
                    <div className="flex items-end">
                      <span className="text-3xl font-bold mr-2">405</span>
                      <span className="text-lg mb-1">{localT('stats.minutes')}</span>
                    </div>
                  </div>
                </div>

                {/* Карточка 2: Среднее за день */}
                <div className="rounded-lg border border-muted p-4 bg-secondary/10">
                  <div className="flex flex-col justify-between h-full">
                    <div className="text-sm text-muted-foreground mb-2">{localT('stats.average_time')}</div>
                    <div className="flex items-end">
                      <span className="text-3xl font-bold mr-2">57.9</span>
                      <span className="text-lg mb-1">{localT('stats.minutes')}</span>
                    </div>
                  </div>
                </div>

                {/* Карточка 3: Самый долгий сеанс */}
                <div className="rounded-lg border border-muted p-4 bg-secondary/10">
                  <div className="flex flex-col justify-between h-full">
                    <div className="text-sm text-muted-foreground mb-2">{localT('stats.longest_session')}</div>
                    <div className="flex items-end">
                      <span className="text-3xl font-bold mr-2">90</span>
                      <span className="text-lg mb-1">{localT('stats.minutes')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
  );
}