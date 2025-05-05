declare module 'bcryptjs' {
  /**
   * Compares a plain text password with a hashed password
   */
  export function compare(plaintext: string, hash: string): Promise<boolean>;

  /**
   * Generates a hash from a plain text password
   */
  export function hash(plaintext: string, saltRounds: number): Promise<string>;

  /**
   * Generates a salt
   */
  export function genSalt(rounds?: number): Promise<string>;
}