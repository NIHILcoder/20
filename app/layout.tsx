import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-context"
import { AuthProvider } from "@/components/auth-context"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="ru" suppressHydrationWarning>
        <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <LanguageProvider>
                <AuthProvider>
                    <TooltipProvider>
                        <AppSidebar />
                        <Header />
                        <main className="max-w-full">{children}</main>
                    </TooltipProvider>
                </AuthProvider>
            </LanguageProvider>
        </ThemeProvider>
        </body>
        </html>
    )
}
