import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Расширение типа User для включения дополнительных полей
   */
  interface User extends DefaultUser {
    username?: string;
  }

  /**
   * Расширение типа Session для включения дополнительных полей пользователя
   */
  interface Session {
    user?: {
      id?: string;
      username?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  /**
   * Расширение типа JWT для включения дополнительных полей
   */
  interface JWT {
    id?: string;
    username?: string;
  }
}