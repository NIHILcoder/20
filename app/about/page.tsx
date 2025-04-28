"use client";

import { ParticlesBackground } from "@/components/particles-background"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useLanguage, useLocalTranslation } from "@/components/language-context"

export default function AboutPage() {
  const { t, language } = useLanguage();

  // Добавляем переводы для страницы О нас
  const pageTranslations = {
    en: {
      'about.title': 'About VisioMera',
      'about.subtitle': 'Empowering creativity through AI art generation',
      'about.mission.title': 'Our Mission',
      'about.mission.text1': 'VisioMera was created to democratize digital art creation by making powerful AI tools accessible to everyone. We believe that creativity should not be limited by technical skill, but rather enhanced by technology that helps bring your imagination to life.',
      'about.mission.text2': 'Our platform combines the power of ComfyUI, Flux models, and other cutting-edge AI technologies to provide an intuitive yet powerful interface for creating stunning visual art.',
      'about.developer.title': 'Meet the Developer',
      'about.developer.name': 'Proxy Nihil',
      'about.developer.bio': 'Proxy Nihil is a developer and AI enthusiast passionate about the intersection of technology and creativity. With a background in computer science and digital art, they created VisioMera to bridge the gap between technical complexity and artistic expression.',
      'about.timeline.title': 'Development Timeline',
      'about.timeline.event1.date': 'March 2025',
      'about.timeline.event1.title': 'VisioMera Launch',
      'about.timeline.event1.description': 'Initial release with core generation features and community hub.',
      'about.timeline.event2.date': 'January 2025',
      'about.timeline.event2.title': 'Beta Testing',
      'about.timeline.event2.description': 'Invited users test the platform and provide feedback for improvements.',
      'about.timeline.event3.date': 'October 2024',
      'about.timeline.event3.title': 'Development Begins',
      'about.timeline.event3.description': 'Work starts on creating a user-friendly interface for ComfyUI and Flux models.',
      'about.timeline.event4.date': 'August 2024',
      'about.timeline.event4.title': 'Concept Phase',
      'about.timeline.event4.description': 'Research and planning for an accessible AI art generation platform.',
      'about.tech.title': 'Technology Stack',
      'about.tech.comfy.title': 'ComfyUI',
      'about.tech.comfy.description': 'A powerful and modular UI system for Stable Diffusion and other generative models.',
      'about.tech.flux.title': 'Flux Models',
      'about.tech.flux.description': 'State-of-the-art image generation models optimized for quality and speed.',
      'about.tech.nextjs.title': 'Next.js',
      'about.tech.nextjs.description': 'React framework for building fast and responsive web applications.',
      'about.tech.tailwind.title': 'Tailwind CSS',
      'about.tech.tailwind.description': 'Utility-first CSS framework for rapid UI development.',
      'about.faq.title': 'Frequently Asked Questions',
      'about.contact.title': 'Contact Us',
      'about.contact.name': 'Name',
      'about.contact.email': 'Email',
      'about.contact.subject': 'Subject',
      'about.contact.message': 'Message',
      'about.contact.send': 'Send Message',
    },
    ru: {
      'about.title': 'О VisioMera',
      'about.subtitle': 'Расширение возможностей творчества с помощью ИИ-генерации изображений',
      'about.mission.title': 'Наша миссия',
      'about.mission.text1': 'VisioMera создана для демократизации цифрового искусства, делая мощные инструменты ИИ доступными для всех. Мы считаем, что творчество не должно ограничиваться техническими навыками, а должно усиливаться технологиями, которые помогают воплотить ваше воображение в жизнь.',
      'about.mission.text2': 'Наша платформа объединяет возможности ComfyUI, моделей Flux и других передовых технологий ИИ, чтобы предоставить интуитивно понятный, но мощный интерфейс для создания потрясающего визуального искусства.',
      'about.developer.title': 'Познакомьтесь с разработчиком',
      'about.developer.name': 'Proxy Nihil',
      'about.developer.bio': 'Proxy Nihil — разработчик и энтузиаст ИИ, увлеченный точкой пересечения технологий и творчества. Имея опыт в компьютерных науках и цифровом искусстве, он создал VisioMera, чтобы преодолеть разрыв между технической сложностью и художественным самовыражением.',
      'about.timeline.title': 'Хронология разработки',
      'about.timeline.event1.date': 'Март 2025',
      'about.timeline.event1.title': 'Запуск VisioMera',
      'about.timeline.event1.description': 'Первый выпуск с основными функциями генерации и центром сообщества.',
      'about.timeline.event2.date': 'Январь 2025',
      'about.timeline.event2.title': 'Бета-тестирование',
      'about.timeline.event2.description': 'Приглашенные пользователи тестируют платформу и предоставляют отзывы для улучшений.',
      'about.timeline.event3.date': 'Октябрь 2024',
      'about.timeline.event3.title': 'Начало разработки',
      'about.timeline.event3.description': 'Начата работа по созданию удобного интерфейса для ComfyUI и моделей Flux.',
      'about.timeline.event4.date': 'Август 2024',
      'about.timeline.event4.title': 'Концептуальная фаза',
      'about.timeline.event4.description': 'Исследования и планирование доступной платформы генерации искусства ИИ.',
      'about.tech.title': 'Технологический стек',
      'about.tech.comfy.title': 'ComfyUI',
      'about.tech.comfy.description': 'Мощная и модульная UI-система для Stable Diffusion и других генеративных моделей.',
      'about.tech.flux.title': 'Модели Flux',
      'about.tech.flux.description': 'Современные модели генерации изображений, оптимизированные для качества и скорости.',
      'about.tech.nextjs.title': 'Next.js',
      'about.tech.nextjs.description': 'React-фреймворк для создания быстрых и отзывчивых веб-приложений.',
      'about.tech.tailwind.title': 'Tailwind CSS',
      'about.tech.tailwind.description': 'CSS-фреймворк, основанный на утилитах, для быстрой разработки UI.',
      'about.faq.title': 'Часто задаваемые вопросы',
      'about.contact.title': 'Связаться с нами',
      'about.contact.name': 'Имя',
      'about.contact.email': 'Email',
      'about.contact.subject': 'Тема',
      'about.contact.message': 'Сообщение',
      'about.contact.send': 'Отправить сообщение',
    }
  };

  // Функция локального перевода для страницы
  const { localT } = useLocalTranslation(pageTranslations);

  return (
      <div className="container relative mx-auto py-8">
        <ParticlesBackground />

        <div className="mx-auto max-w-3xl space-y-12">
          <section className="space-y-4 text-center">
            <h1 className="text-4xl font-bold">{localT('about.title')}</h1>
            <p className="text-xl text-muted-foreground">{localT('about.subtitle')}</p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">{localT('about.mission.title')}</h2>
            <p className="text-lg leading-relaxed">
              {localT('about.mission.text1')}
            </p>
            <p className="text-lg leading-relaxed">
              {localT('about.mission.text2')}
            </p>
          </section>

          <Separator />

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">{localT('about.developer.title')}</h2>
            <Card>
              <CardContent className="flex flex-col items-center gap-6 p-6 text-center md:flex-row md:text-left">
                <img
                    src="/placeholder.svg?height=150&width=150&text=PN"
                    alt="Proxy Nihil"
                    className="h-32 w-32 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold">{localT('about.developer.name')}</h3>
                  <p className="mt-2 text-muted-foreground">
                    {localT('about.developer.bio')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">{localT('about.timeline.title')}</h2>
            <div className="relative space-y-8 pl-8 before:absolute before:left-3 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-border">
              {[
                {
                  date: localT('about.timeline.event1.date'),
                  title: localT('about.timeline.event1.title'),
                  description: localT('about.timeline.event1.description'),
                },
                {
                  date: localT('about.timeline.event2.date'),
                  title: localT('about.timeline.event2.title'),
                  description: localT('about.timeline.event2.description'),
                },
                {
                  date: localT('about.timeline.event3.date'),
                  title: localT('about.timeline.event3.title'),
                  description: localT('about.timeline.event3.description'),
                },
                {
                  date: localT('about.timeline.event4.date'),
                  title: localT('about.timeline.event4.title'),
                  description: localT('about.timeline.event4.description'),
                },
              ].map((event, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-8 top-1 h-5 w-5 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                      <h3 className="text-lg font-medium">{event.title}</h3>
                      <p className="mt-1">{event.description}</p>
                    </div>
                  </div>
              ))}
            </div>
          </section>

          <Separator />

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">{localT('about.tech.title')}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                {
                  title: localT('about.tech.comfy.title'),
                  description: localT('about.tech.comfy.description'),
                },
                {
                  title: localT('about.tech.flux.title'),
                  description: localT('about.tech.flux.description'),
                },
                {
                  title: localT('about.tech.nextjs.title'),
                  description: localT('about.tech.nextjs.description'),
                },
                {
                  title: localT('about.tech.tailwind.title'),
                  description: localT('about.tech.tailwind.description'),
                },
              ].map((tech, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <h3 className="font-bold">{tech.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{tech.description}</p>
                    </CardContent>
                  </Card>
              ))}
            </div>
          </section>

          <Separator />

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">{localT('about.faq.title')}</h2>
            <Accordion type="single" collapsible className="w-full">
              {/* Здесь нужно добавить переводы для вопросов и ответов FAQ */}
              {/* Пример с переводами не показан для краткости */}
            </Accordion>
          </section>

          <Separator />

          <section className="space-y-6">
            <h2 className="text-2xl font-bold">{localT('about.contact.title')}</h2>
            <Card>
              <CardContent className="p-6">
                <form className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        {localT('about.contact.name')}
                      </label>
                      <Input id="name" placeholder={localT('about.contact.name')} />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        {localT('about.contact.email')}
                      </label>
                      <Input id="email" type="email" placeholder={localT('about.contact.email')} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      {localT('about.contact.subject')}
                    </label>
                    <Input id="subject" placeholder={localT('about.contact.subject')} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      {localT('about.contact.message')}
                    </label>
                    <Textarea id="message" placeholder={localT('about.contact.message')} rows={5} />
                  </div>
                  <Button type="submit" className="w-full">
                    {localT('about.contact.send')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
  )
}