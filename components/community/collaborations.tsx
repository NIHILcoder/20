'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, MessageSquare, Calendar, ArrowRight, Sparkles, ChevronRight, Info, AlertCircle } from 'lucide-react';
import { useLanguage, useLocalTranslation } from '@/components/language-context';
import { getCurrentUser, checkCollaborationParticipation, joinCollaboration, CollaborationParticipation } from '@/services/user-service';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User } from '@/types/user';

interface Collaboration {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  deadline: string;
  status: 'open' | 'in_progress' | 'completed';
  category: string;
  initiator: {
    id: number;
    name: string;
    avatar: string;
    role: string;
  };
  participants: {
    id: number;
    name: string;
    avatar: string;
    role: string;
  }[];
  maxParticipants: number;
  skills: string[];
}

export function Collaborations() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedCollaboration, setSelectedCollaboration] = useState<Collaboration | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  const [userCollaborations, setUserCollaborations] = useState<number[]>([]);
  
  const { language } = useLanguage();
  const t = useLocalTranslation({en: {}, ru: {}});
  
  // Загрузка данных о пользователе
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        
        if (user) {
          // Получаем информацию об участии пользователя в коллаборациях
          const userCollabs: number[] = [];
          
          // Проверяем участие в каждой коллаборации
          for (const collab of collaborations) {
            try {
              const participation = await checkCollaborationParticipation(user.id, collab.id);
              if (participation) {
                userCollabs.push(collab.id);
              }
            } catch (error) {
              console.error(`Ошибка при проверке участия в коллаборации ${collab.id}:`, error);
            }
          }
          
          setUserCollaborations(userCollabs);
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
      }
    };
    
    fetchUserData();
  }, [collaborations]);
  
  // Загрузка данных о коллаборациях
  useEffect(() => {
    const fetchCollaborations = async () => {
      setLoading(true);
      
      try {
        // Получаем данные о коллаборациях из API
        const response = await fetch('/api/community/collaborations');
        
        if (!response.ok) {
          throw new Error('Ошибка при получении данных о коллаборациях');
        }
        
        const collaborationsData = await response.json();
        setCollaborations(collaborationsData);
      } catch (error) {
        console.error('Ошибка при загрузке коллабораций:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollaborations();
  }, []);
  
  // Форматирование даты
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };
  
  // Получение класса статуса
  const getStatusClass = (status: Collaboration['status']) => {
    switch (status) {
      case 'open': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Получение текста статуса
  const getStatusText = (status: Collaboration['status']) => {
    switch (status) {
      case 'open': return 'Открыто';
      case 'in_progress': return 'В процессе';
      case 'completed': return 'Завершено';
      default: return 'Неизвестно';
    }
  };
  
  // Фильтрация коллабораций
  const filteredCollaborations = activeFilter === 'all' 
    ? collaborations 
    : collaborations.filter(collab => collab.status === activeFilter);
  
  // Анимация для карточек
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: 'spring',
        stiffness: 100
      }
    })
  };
  
  // Анимация для заголовка
  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        type: 'spring',
        stiffness: 100
      }
    }
  };
  
  // Анимация для иконки
  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.6,
        type: 'spring',
        stiffness: 200
      }
    }
  };
  
  // Анимация для частиц
  const particleVariants = {
    initial: { opacity: 0.7, scale: 1 },
    animate: {
      opacity: [0.7, 1, 0.7],
      scale: [1, 1.2, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: 'reverse' as const
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 py-4">
      {/* Заголовок с анимацией */}
      <div className="relative overflow-hidden rounded-lg p-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white">
        <motion.div 
          className="absolute top-4 right-8 text-yellow-300 opacity-70"
          variants={particleVariants}
          initial="initial"
          animate="animate"
        >
          <Sparkles className="h-6 w-6" />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-8 left-12 text-yellow-300 opacity-70"
          variants={particleVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.5 }}
        >
          <Sparkles className="h-4 w-4" />
        </motion.div>
        
        <motion.div 
          className="absolute top-12 left-1/4 text-blue-300 opacity-70"
          variants={particleVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 1 }}
        >
          <Sparkles className="h-5 w-5" />
        </motion.div>
        
        <div className="relative z-10 flex items-center justify-center flex-col">
          <motion.div
            variants={iconVariants}
            initial="hidden"
            animate="visible"
            className="mb-4"
          >
            <Users className="h-12 w-12" />
          </motion.div>
          
          <motion.div
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <h2 className="text-2xl font-bold mb-2">Творческие коллаборации</h2>
            <p className="max-w-2xl mx-auto">Объединяйтесь с другими художниками для создания уникальных проектов и расширения своих творческих возможностей</p>
          </motion.div>
        </div>
      </div>
      
      {/* Фильтры */}
      <div className="flex justify-center space-x-2">
        <Button 
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('all')}
        >
          Все
        </Button>
        <Button 
          variant={activeFilter === 'open' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('open')}
        >
          Открытые
        </Button>
        <Button 
          variant={activeFilter === 'in_progress' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('in_progress')}
        >
          В процессе
        </Button>
        <Button 
          variant={activeFilter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('completed')}
        >
          Завершенные
        </Button>
      </div>
      
      {/* Список коллабораций */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCollaborations.map((collab, index) => (
          <motion.div
            key={collab.id}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <Card className="h-full overflow-hidden flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-1">{collab.title}</CardTitle>
                  <Badge className={`${getStatusClass(collab.status)} text-white`}>
                    {getStatusText(collab.status)}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {collab.category}
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow pb-2">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {collab.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {collab.skills.map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Дедлайн: {formatDate(collab.deadline)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{collab.participants.length}/{collab.maxParticipants} участников</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center">
                    <div className="mr-2">
                      <Avatar className="h-8 w-8 border-2 border-background">
                        <AvatarImage src={collab.initiator.avatar} alt={collab.initiator.name} />
                        <AvatarFallback>{collab.initiator.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{collab.initiator.name}</div>
                      <div className="text-xs text-muted-foreground">{collab.initiator.role}</div>
                    </div>
                  </div>
                  
                  {collab.participants.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-muted-foreground mb-1">Участники:</div>
                      <div className="flex -space-x-2">
                        {collab.participants.map((participant) => (
                          <Avatar key={participant.id} className="h-6 w-6 border-2 border-background">
                            <AvatarImage src={participant.avatar} alt={participant.name} />
                            <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ))}
                        {collab.participants.length < collab.maxParticipants && (
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                            +{collab.maxParticipants - collab.participants.length}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-2">
                {userCollaborations.includes(collab.id) ? (
                  <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                    Вы участвуете
                    <Users className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        variant={collab.status === 'open' ? 'default' : 'outline'}
                        onClick={() => {
                          setSelectedCollaboration(collab);
                          setJoinError(null);
                          setJoinSuccess(null);
                        }}
                        disabled={collab.status === 'completed' || !currentUser || collab.participants.length >= collab.maxParticipants}
                      >
                        {collab.status === 'open' ? 'Присоединиться' : 
                         collab.status === 'in_progress' ? 'Посмотреть детали' : 'Посмотреть результаты'}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>{selectedCollaboration?.title}</DialogTitle>
                        <DialogDescription>
                          {selectedCollaboration?.description}
                        </DialogDescription>
                      </DialogHeader>
                      
                      {!currentUser && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Для участия в коллаборации необходимо войти в аккаунт
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {joinError && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{joinError}</AlertDescription>
                        </Alert>
                      )}
                      
                      {joinSuccess && (
                        <Alert className="mb-4 bg-green-100 border-green-400 text-green-700">
                          <Info className="h-4 w-4" />
                          <AlertDescription>{joinSuccess}</AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="text-sm font-medium">Категория:</span>
                          <span className="col-span-3">{selectedCollaboration?.category}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="text-sm font-medium">Создано:</span>
                          <span className="col-span-3">{selectedCollaboration && formatDate(selectedCollaboration.createdAt)}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="text-sm font-medium">Дедлайн:</span>
                          <span className="col-span-3">{selectedCollaboration && formatDate(selectedCollaboration.deadline)}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="text-sm font-medium">Участники:</span>
                          <span className="col-span-3">{selectedCollaboration?.participants.length}/{selectedCollaboration?.maxParticipants}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="text-sm font-medium">Инициатор:</span>
                          <span className="col-span-3 flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={selectedCollaboration?.initiator.avatar} alt={selectedCollaboration?.initiator.name} />
                              <AvatarFallback>{selectedCollaboration?.initiator.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {selectedCollaboration?.initiator.name} ({selectedCollaboration?.initiator.role})
                          </span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="text-sm font-medium">Навыки:</span>
                          <div className="col-span-3 flex flex-wrap gap-1">
                            {selectedCollaboration?.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          disabled={joinLoading || !currentUser || selectedCollaboration?.status !== 'open' || 
                                   (selectedCollaboration?.participants.length >= (selectedCollaboration?.maxParticipants || 0))}
                          onClick={async () => {
                            if (!currentUser || !selectedCollaboration) return;
                            
                            setJoinLoading(true);
                            setJoinError(null);
                            setJoinSuccess(null);
                            
                            try {
                              // Используем функцию joinCollaboration из user-service
                              const participation = await joinCollaboration(currentUser.id, selectedCollaboration.id);
                              
                              // Обновляем список коллабораций пользователя
                              setUserCollaborations(prev => [...prev, selectedCollaboration.id]);
                              setJoinSuccess('Вы успешно присоединились к коллаборации!');
                            } catch (error) {
                              console.error('Ошибка при присоединении к коллаборации:', error);
                              setJoinError('Произошла ошибка. Пожалуйста, попробуйте позже.');
                            } finally {
                              setJoinLoading(false);
                            }
                          }}
                        >
                          {joinLoading ? 'Присоединение...' : 'Присоединиться'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                
                <Button variant="outline" className="w-full" onClick={() => setSelectedCollaboration(collab)}>
                  Подробнее
                  <Info className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Кнопка создания новой коллаборации */}
      <div className="flex justify-center mt-6">
        <Button size="lg" className="gap-2">
          <span>Создать коллаборацию</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}