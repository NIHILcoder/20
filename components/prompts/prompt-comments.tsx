'use client';

import { useState, useRef, useEffect } from 'react';
import { Star, StarHalf, MessageSquare, Send, Edit, Trash2, User, ThumbsUp, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Comment {
  id: string;
  userId: number;
  username: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
  rating?: number;
  likes?: number;
  isLiked?: boolean;
}

interface PromptCommentsProps {
  promptId: string;
  comments: Comment[];
  userRating?: number | null;
  onAddComment: (text: string) => void;
  onEditComment?: (id: string, text: string) => void;
  onDeleteComment?: (id: string) => void;
  onRatePrompt?: (rating: number) => void;
  onLikeComment?: (id: string) => void;
  onReportComment?: (id: string) => void;
  className?: string;
  maxHeight?: string;
  isLoggedIn?: boolean;
}

export function PromptComments({
  promptId,
  comments,
  userRating,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onRatePrompt,
  onLikeComment,
  onReportComment,
  className,
  maxHeight = '400px',
  isLoggedIn = false
}: PromptCommentsProps) {
  const [commentText, setCommentText] = useState('');
  const [editingComment, setEditingComment] = useState<{id: string, text: string} | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Автоматически фокусируемся на текстовом поле при редактировании
  useEffect(() => {
    if (editingComment && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editingComment]);
  
  const handleSubmitComment = () => {
    if (!commentText.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    onAddComment(commentText.trim());
    
    // Имитация задержки сети
    setTimeout(() => {
      setCommentText('');
      setIsSubmitting(false);
    }, 500);
  };
  
  const handleUpdateComment = () => {
    if (!editingComment || !editingComment.text.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    if (onEditComment) {
      onEditComment(editingComment.id, editingComment.text.trim());
    }
    
    // Имитация задержки сети
    setTimeout(() => {
      setEditingComment(null);
      setIsSubmitting(false);
    }, 500);
  };
  
  const handleDeleteComment = (id: string) => {
    if (isSubmitting || !onDeleteComment) return;
    
    if (window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      setIsSubmitting(true);
      onDeleteComment(id);
      
      // Имитация задержки сети
      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
    }
  };
  
  const handleRating = (rating: number) => {
    if (!onRatePrompt) return;
    onRatePrompt(rating);
  };
  
  const renderStars = () => {
    const displayRating = hoveredRating !== null ? hoveredRating : userRating || 0;
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      const isHalf = i - 0.5 === displayRating;
      const isFilled = i <= displayRating;
      
      stars.push(
        <span 
          key={i}
          className={cn(
            "cursor-pointer transition-colors",
            isFilled ? "text-yellow-400" : "text-gray-300",
            onRatePrompt && "hover:text-yellow-400"
          )}
          onMouseEnter={() => onRatePrompt && setHoveredRating(i)}
          onMouseLeave={() => onRatePrompt && setHoveredRating(null)}
          onClick={() => onRatePrompt && handleRating(i)}
        >
          {isHalf ? <StarHalf className="h-6 w-6" /> : <Star className="h-6 w-6" fill={isFilled ? "currentColor" : "none"} />}
        </span>
      );
    }
    
    return stars;
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: ru });
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <Card className={cn("mb-4", className)}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Комментарии и оценки
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        {/* Секция рейтинга */}
        {onRatePrompt && (
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Ваша оценка:</div>
            <div className="flex items-center space-x-1">
              {renderStars()}
              {userRating ? (
                <span className="ml-2 text-sm text-muted-foreground">
                  {userRating.toFixed(1)}/5
                </span>
              ) : null}
            </div>
          </div>
        )}
        
        {/* Форма добавления комментария */}
        {isLoggedIn ? (
          <div className="mb-4">
            <Textarea
              ref={textareaRef}
              placeholder={editingComment ? "Редактировать комментарий..." : "Добавить комментарий..."}
              value={editingComment ? editingComment.text : commentText}
              onChange={(e) => {
                if (editingComment) {
                  setEditingComment({...editingComment, text: e.target.value});
                } else {
                  setCommentText(e.target.value);
                }
              }}
              className="min-h-[80px] mb-2"
              disabled={isSubmitting}
            />
            <div className="flex justify-end space-x-2">
              {editingComment && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingComment(null)}
                  disabled={isSubmitting}
                >
                  Отмена
                </Button>
              )}
              <Button 
                variant="default" 
                size="sm"
                onClick={editingComment ? handleUpdateComment : handleSubmitComment}
                disabled={isSubmitting || (editingComment ? !editingComment.text.trim() : !commentText.trim())}
              >
                <Send className="h-4 w-4 mr-2" />
                {editingComment ? 'Обновить' : 'Отправить'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-muted rounded-md text-sm text-center">
            Войдите в систему, чтобы оставить комментарий
          </div>
        )}
        
        <Separator className="my-2" />
        
        {/* Список комментариев */}
        {comments.length > 0 ? (
          <ScrollArea className={`max-h-[${maxHeight}]`}>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="relative group">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      {comment.userAvatar && (
                        <AvatarImage src={comment.userAvatar} alt={comment.username} />
                      )}
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="font-medium text-sm">{comment.username}</div>
                        <div className="text-xs text-muted-foreground ml-2">
                          {formatDate(comment.createdAt)}
                        </div>
                        
                        {comment.rating && (
                          <div className="flex items-center ml-2">
                            <Star className="h-3 w-3 text-yellow-400 mr-1" fill="currentColor" />
                            <span className="text-xs">{comment.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm mt-1">{comment.text}</div>
                      
                      <div className="flex items-center mt-2 text-xs text-muted-foreground">
                        {onLikeComment && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-xs flex items-center"
                            onClick={() => onLikeComment(comment.id)}
                          >
                            <ThumbsUp className={cn(
                              "h-3 w-3 mr-1",
                              comment.isLiked && "text-primary fill-primary"
                            )} />
                            {comment.likes || 0}
                          </Button>
                        )}
                        
                        {onReportComment && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-xs flex items-center ml-2"
                            onClick={() => onReportComment(comment.id)}
                          >
                            <Flag className="h-3 w-3 mr-1" />
                            Пожаловаться
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Кнопки редактирования и удаления */}
                    <div className="hidden group-hover:flex items-center space-x-1">
                      {onEditComment && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => setEditingComment({id: comment.id, text: comment.text})}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                      
                      {onDeleteComment && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            Нет комментариев. Будьте первым, кто оставит комментарий!
          </div>
        )}
      </CardContent>
    </Card>
  );
}