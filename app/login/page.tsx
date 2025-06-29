"use client";

import Link from "next/link"
import { useState } from "react"; // Added useState
import { useRouter } from 'next/navigation'; // Added useRouter
import { ParticlesBackground } from "@/components/particles-background"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Github, Mail, AlertCircle } from "lucide-react" // Added AlertCircle
import { useLanguage, useLocalTranslation } from "@/components/language-context"
import { useAuth } from "@/components/auth-context" // Добавлен импорт useAuth
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added Alert components

export default function LoginPage() {
  const router = useRouter(); // Initialize router
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Define page-specific translations
  const pageTranslations = {
    en: {
      'login.title': 'Sign in to VisioMera',
      'login.description': 'Enter your email and password to access your account',
      'login.email': 'Email',
      'login.password': 'Password',
      'login.forgot_password': 'Forgot password?',
      'login.sign_in': 'Sign In',
      'login.register': 'Register',
      'login.name': 'Name',
      'login.confirm_password': 'Confirm Password',
      'login.create_account': 'Create Account',
      'login.or_continue_with': 'Or continue with',
      'login.terms_agreement': 'By signing in, you agree to our',
      'login.terms_of_service': 'Terms of Service',
      'login.and': 'and',
      'login.privacy_policy': 'Privacy Policy',
      'login.password_mismatch': 'Passwords do not match',
      'login.registration_success': 'Registration successful! Please log in.',
      'login.login_success': 'Login successful! Redirecting...', // Added login success message
      'login.error_occurred': 'An error occurred. Please try again.',
    },
    ru: {
      'login.title': 'Вход в ВизиоМера',
      'login.description': 'Введите ваш email и пароль для доступа к аккаунту',
      'login.email': 'Email',
      'login.password': 'Пароль',
      'login.forgot_password': 'Забыли пароль?',
      'login.sign_in': 'Войти',
      'login.register': 'Регистрация',
      'login.name': 'Имя',
      'login.confirm_password': 'Подтвердите пароль',
      'login.create_account': 'Создать аккаунт',
      'login.or_continue_with': 'Или продолжить с помощью',
      'login.terms_agreement': 'Входя в систему, вы соглашаетесь с нашими',
      'login.terms_of_service': 'Условиями использования',
      'login.and': 'и',
      'login.privacy_policy': 'Политикой конфиденциальности',
      'login.password_mismatch': 'Пароли не совпадают',
      'login.registration_success': 'Регистрация прошла успешно! Пожалуйста, войдите.',
      'login.login_success': 'Вход выполнен успешно! Перенаправление...', // Added login success message
      'login.error_occurred': 'Произошла ошибка. Пожалуйста, попробуйте еще раз.',
    }
  };

  // Use the local translation hook
  const { localT } = useLocalTranslation(pageTranslations);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (registerPassword !== registerConfirmPassword) {
      setError(localT('login.password_mismatch'));
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: registerName, // Use username for registration as per API
          email: registerEmail, 
          password: registerPassword,
          displayName: registerName // Also send displayName
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || localT('login.error_occurred'));
      }

      setSuccess(localT('login.registration_success'));
      // Optionally clear form or switch to login tab
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      // Consider switching tab: document.querySelector('[data-radix-collection-item][value="email"]')?.click();

    } catch (err: any) {
      setError(err.message || localT('login.error_occurred'));
    }
  };

  const { login } = useAuth();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await login(loginEmail, loginPassword);
      
      setSuccess(localT('login.login_success'));
      // Redirect to profile page after successful login
      router.push('/profile'); 

    } catch (err: any) {
      setError(err.message || localT('login.error_occurred'));
    }
  };

  return (
      <div className="container relative flex h-screen items-center justify-center">
        <ParticlesBackground />

        <div className="mx-auto w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">{localT('login.title')}</CardTitle>
              <CardDescription>{localT('login.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert variant="default" className="mb-4 bg-green-100 border-green-400 text-green-700">
                  {/* Using a generic success icon or none */}
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <Tabs defaultValue="email" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email">{localT('login.email')}</TabsTrigger>
                  <TabsTrigger value="register">{localT('login.register')}</TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="mt-4">
                  <form onSubmit={handleLoginSubmit}> {/* Added onSubmit */} 
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">{localT('login.email')}</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="name@example.com" 
                          value={loginEmail} // Added value
                          onChange={(e) => setLoginEmail(e.target.value)} // Added onChange
                          required // Added required
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">{localT('login.password')}</Label>
                          <Link href="/forgot-password" className="text-xs text-muted-foreground hover:underline">
                            {localT('login.forgot_password')}
                          </Link>
                        </div>
                        <Input 
                          id="password" 
                          type="password" 
                          value={loginPassword} // Added value
                          onChange={(e) => setLoginPassword(e.target.value)} // Added onChange
                          required // Added required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        {localT('login.sign_in')}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="mt-4">
                  <form onSubmit={handleRegisterSubmit}> {/* Added onSubmit */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-name">{localT('login.name')}</Label>
                        <Input 
                          id="register-name" 
                          placeholder={localT('login.name')} 
                          value={registerName} // Added value
                          onChange={(e) => setRegisterName(e.target.value)} // Added onChange
                          required // Added required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email">{localT('login.email')}</Label>
                        <Input 
                          id="register-email" 
                          type="email" 
                          placeholder="name@example.com" 
                          value={registerEmail} // Added value
                          onChange={(e) => setRegisterEmail(e.target.value)} // Added onChange
                          required // Added required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">{localT('login.password')}</Label>
                        <Input 
                          id="register-password" 
                          type="password" 
                          value={registerPassword} // Added value
                          onChange={(e) => setRegisterPassword(e.target.value)} // Added onChange
                          required // Added required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-confirm">{localT('login.confirm_password')}</Label>
                        <Input 
                          id="register-confirm" 
                          type="password" 
                          value={registerConfirmPassword} // Added value
                          onChange={(e) => setRegisterConfirmPassword(e.target.value)} // Added onChange
                          required // Added required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        {localT('login.create_account')}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">{localT('login.or_continue_with')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline">
                  <Github className="mr-2 h-4 w-4" />
                  Вконтакте (Скоро)
                </Button>
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Яндекс (Скоро)
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-xs text-muted-foreground">
                {localT('login.terms_agreement')}{" "}
                <Link href="#" className="underline">
                  {localT('login.terms_of_service')}
                </Link>{" "}
                {localT('login.and')}{" "}
                <Link href="#" className="underline">
                  {localT('login.privacy_policy')}
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
  )
}