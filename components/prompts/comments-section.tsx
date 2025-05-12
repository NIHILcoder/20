'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Rating } from '@/components/ui/rating';
import { formatDistanceToNow } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { useLanguage, useLocalTranslation } from '@/components/language-context';

interface Comment {
  id: string;
  userId: number;
  username: string;
  text: string;
  createdAt: string;
  rating?: number;
  avatarUrl?: string;
}

interface CommentsProps {
  comments: Comment[];
  onAddComment: (text: string) => Promise<void>;
  promptId: string;
  className?: string;
  maxHeight?: string;
  isLoading?: boolean;
}

export function CommentsSection({
  comments,
  onAddComment,
  promptId,
  className,
  maxHeight = '400px',
  isLoading = false
}: CommentsProps) {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { language } = useLanguage();
  
  // Локализация для date-fns
  const locale = language === 'ru' ? ru : enUS;
  
  // Переводы для компонента
  const translations = {
    en: {
      'comments.title': 'Comments',
      'comments.placeholder': 'Write your comment here...',
      'comments.submit': 'Submit',
      'comments.empty': 'No comments yet',
      'comments.be_first': 'Be the first to comment',
      'comments.error': 'Error submitting comment',
      'comments.ago': 'ago',
      'comments.loading': 'Loading comments...'
    },
    ru: {
      'comments.title': 'Комментарии',
      'comments.placeholder': 'Напишите ваш комментарий здесь...',
      'comments.submit': 'Отправить',
      'comments.empty': 'Комментариев пока нет',
      'comments.be_first': 'Будьте первым, кто оставит комментарий',
      'comments.error': 'Ошибка при отправке комментария',
      'comments.ago': 'назад',
      'comments.loading': 'Загрузка комментариев...'
    }
  };
  
  const { localT } = useLocalTranslation(translations);
  
  // Обработчик отправки комментария
  const handleSubmit = async () => {
    if (!commentText.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onAddComment(commentText.trim());
      setCommentText('');
    } catch (err) {
      setError(localT('comments.error'));
      console.error('Error submitting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Форматирование даты
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale });
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {localT('comments.title')}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-0">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">
            {localT('comments.loading')}
          </div>
        ) : comments.length > 0 ? (
          <ScrollArea className={`max-h-[${maxHeight}]`}>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      {comment.avatarUrl ? (
                        <AvatarImage src={comment.avatarUrl} alt={comment.username} />
                      ) : (
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{comment.username}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </div>
                      </div>
                      
                      {comment.rating && (
                        <Rating value={comment.rating} readOnly size="sm" />
                      )}
                      
                      <p className="text-sm">{comment.text}</p>
                    </div>
                  </div>
                  
                  <Separator />
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">{localT('comments.empty')}</p>
            <p className="text-xs text-muted-foreground mt-1">{localT('comments.be_first')}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-4">
        <div className="w-full space-y-2">
          <Textarea
            placeholder={localT('comments.placeholder')}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={!commentText.trim() || isSubmitting}
              className="flex items-center gap-1"
            >
              <Send className="h-4 w-4" />
              {localT('comments.submit')}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}