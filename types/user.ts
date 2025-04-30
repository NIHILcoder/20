export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  userId: number;
  theme: 'light' | 'dark' | 'system';
  language: 'ru' | 'en';
  notifications: boolean;
  emailNotifications: boolean;
}

export interface UserStats {
  userId: number;
  artworksCount: number;
  likesReceived: number;
  commentsReceived: number;
  followersCount: number;
  followingCount: number;
  tournamentsWon: number;
  collaborationsCount: number;
}