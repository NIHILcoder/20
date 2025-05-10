import { NextRequest } from 'next/server';

// Расширение типа NextRequest для добавления свойства user
declare module 'next/server' {
  interface NextRequest {
    user: {
      id: number;
      username: string;
      email: string;
      display_name?: string;
      avatar_url?: string;
      bio?: string;
      credits?: number;
      created_at?: Date;
      updated_at?: Date;
      is_verified?: boolean;
    };
  }
}