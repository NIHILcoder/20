'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Calendar, Users, Clock, Star, ChevronRight, Heart, Info, AlertCircle } from 'lucide-react';
import { useLanguage, useLocalTranslation } from '@/components/language-context';
import { getCurrentUser, registerForTournament, checkTournamentParticipation, TournamentParticipation } from '@/services/user-service';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User } from '@/types/user';

interface Tournament {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  participants: number;
  maxParticipants: number;
  prize: string;
  status: 'upcoming' | 'active' | 'completed';
  image: string;
  category: string;
  rules?: string;
  organizer?: string;
  submissionDeadline?: string;
}

export function Tournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userParticipations, setUserParticipations] = useState<{[key: number]: TournamentParticipation}>({});
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null);
  
  const { language } = useLanguage();
  const t = useLocalTranslation({en: {}, ru: {}});
  
  // Загрузка данных о пользователе
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Загрузка данных о турнирах
  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      
      try {
        // Получаем данные о турнирах из API
        const response = await fetch('/api/community/tournaments');
        
        if (!response.ok) {
          throw new Error('Ошибка при получении данных о турнирах');
        }
        
        const tournamentsData = await response.json();
        setTournaments(tournamentsData);
        
        // Если пользователь авторизован, загружаем информацию об участии в турнирах
        if (currentUser) {
          const participations: {[key: number]: TournamentParticipation} = {};
          
          for (const tournament of tournamentsData) {
            try {
              const participation = await checkTournamentParticipation(currentUser.id, tournament.id);
              if (participation) {
                participations[tournament.id] = participation;
              }
            } catch (error) {
              console.error(`Ошибка при проверке участия в турнире ${tournament.id}:`, error);
            }
          }
          
          setUserParticipations(participations);
        }
      } catch (error) {
        console.error('Ошибка при загрузке турниров:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTournaments();
  }, [currentUser]);
  
  // Форматирование даты
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };
  
  // Получение класса статуса
  const getStatusClass = (status: Tournament['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Получение текста статуса
  const getStatusText = (status: Tournament['status']) => {
    switch (status) {
      case 'active': return 'Активный';
      case 'upcoming': return 'Скоро';
      case 'completed': return 'Завершен';
      default: return 'Неизвестно';
    }
  };
  
  // Анимация для карточек
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
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
  
  // Анимация для трофея
  const trophyVariants = {
    initial: { scale: 1, rotate: 0 },
    animate: { 
      scale: [1, 1.2, 1],
      rotate: [0, 10, -10, 0],
      transition: { 
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse' as const
      }
    }
  };
  
  // Анимация для звезд
  const starVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5
      }
    }
  };
  
  // Анимация для фона
  const backgroundVariants = {
    initial: { 
      background: 'linear-gradient(45deg, #12c2e9, #c471ed, #f64f59)' 
    },
    animate: { 
      background: 'linear-gradient(45deg, #f64f59, #12c2e9, #c471ed)',
      transition: { 
        duration: 10,
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
      {/* Заголовок с анимированным фоном */}
      <motion.div 
        className="relative overflow-hidden rounded-lg p-6 text-center text-white"
        initial="initial"
        animate="animate"
        variants={backgroundVariants}
      >
        <div className="relative z-10">
          <motion.div 
            className="inline-block mb-4"
            variants={trophyVariants}
            initial="initial"
            animate="animate"
          >
            <Trophy className="h-12 w-12" />
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-2">Турниры и соревнования</h2>
          <p className="max-w-2xl mx-auto">Участвуйте в турнирах, соревнуйтесь с другими художниками и выигрывайте ценные призы</p>
          
          {/* Анимированные звезды */}
          <motion.div 
            className="absolute top-4 right-8 text-yellow-300"
            variants={starVariants}
            initial="initial"
            animate="animate"
          >
            <Star className="h-6 w-6" />
          </motion.div>
          
          <motion.div 
            className="absolute bottom-4 left-8 text-yellow-300"
            variants={starVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.3 }}
          >
            <Star className="h-4 w-4" />
          </motion.div>
        </div>
      </motion.div>
      
      {/* Список турниров */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tournament, index) => (
          <motion.div
            key={tournament.id}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
          >
            <Card className="h-full overflow-hidden flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={tournament.image} 
                  alt={tournament.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                  <Badge className={`${getStatusClass(tournament.status)} text-white`}>
                    {getStatusText(tournament.status)}
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="line-clamp-2">{tournament.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {tournament.description}
                </p>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Начало: {formatDate(tournament.startDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Конец: {formatDate(tournament.endDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{tournament.participants}/{tournament.maxParticipants}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <span>Приз: {tournament.prize}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-2">
                {userParticipations[tournament.id] ? (
                  <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                    {userParticipations[tournament.id].status === 'registered' ? 'Вы зарегистрированы' :
                     userParticipations[tournament.id].status === 'submitted' ? 'Работа отправлена' :
                     userParticipations[tournament.id].status === 'finalist' ? 'Вы в финале' :
                     'Победитель'}
                    <Trophy className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        variant={tournament.status === 'active' ? 'default' : 'outline'}
                        onClick={() => {
                          setSelectedTournament(tournament);
                          setRegistrationError(null);
                          setRegistrationSuccess(null);
                        }}
                        disabled={tournament.status === 'completed' || !currentUser}
                      >
                        {tournament.status === 'active' ? 'Участвовать' : 
                         tournament.status === 'upcoming' ? 'Предварительная запись' : 'Посмотреть результаты'}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>{selectedTournament?.title}</DialogTitle>
                        <DialogDescription>
                          {selectedTournament?.description}
                        </DialogDescription>
                      </DialogHeader>
                      
                      {!currentUser && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Для участия в турнире необходимо войти в аккаунт
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {registrationError && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{registrationError}</AlertDescription>
                        </Alert>
                      )}
                      
                      {registrationSuccess && (
                        <Alert className="mb-4 bg-green-100 border-green-400 text-green-700">
                          <Info className="h-4 w-4" />
                          <AlertDescription>{registrationSuccess}</AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="text-sm font-medium">Категория:</span>
                          <span className="col-span-3">{selectedTournament?.category}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="text-sm font-medium">Начало:</span>
                          <span className="col-span-3">{selectedTournament && formatDate(selectedTournament.startDate)}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="text-sm font-medium">Окончание:</span>
                          <span className="col-span-3">{selectedTournament && formatDate(selectedTournament.endDate)}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="text-sm font-medium">Участники:</span>
                          <span className="col-span-3">{selectedTournament?.participants}/{selectedTournament?.maxParticipants}</span>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <span className="text-sm font-medium">Приз:</span>
                          <span className="col-span-3">{selectedTournament?.prize}</span>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          disabled={registrationLoading || !currentUser || selectedTournament?.status === 'completed'}
                          onClick={async () => {
                            if (!currentUser || !selectedTournament) return;
                            
                            setRegistrationLoading(true);
                            setRegistrationError(null);
                            setRegistrationSuccess(null);
                            
                            try {
                              const participation = await registerForTournament(currentUser.id, selectedTournament.id);
                              setUserParticipations(prev => ({
                                ...prev,
                                [selectedTournament.id]: participation
                              }));
                              setRegistrationSuccess('Вы успешно зарегистрированы на турнир!');
                            } catch (error) {
                              console.error('Ошибка при регистрации на турнир:', error);
                              setRegistrationError('Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.');
                            } finally {
                              setRegistrationLoading(false);
                            }
                          }}
                        >
                          {registrationLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                
                <Button variant="outline" className="w-full" onClick={() => setSelectedTournament(tournament)}>
                  Подробнее
                  <Info className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}