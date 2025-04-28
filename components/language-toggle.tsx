'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useLanguage, Language } from './language-context';

interface LanguageOption {
    value: Language;
    label: string;
    flag: string;
}

export function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    const languages: LanguageOption[] = [
        { value: 'en', label: 'English', flag: '🇬🇧' },
        { value: 'ru', label: 'Русский', flag: '🇷🇺' },
    ];

    // Find the current language option
    const currentLanguage = languages.find(l => l.value === language) || languages[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Globe className="h-4 w-4" />
                    <span className="sr-only">Switch language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.value}
                        onClick={() => setLanguage(lang.value)}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <span className="text-base">{lang.flag}</span>
                        <span>{lang.label}</span>
                        {language === lang.value && (
                            <span className="ml-auto h-2 w-2 rounded-full bg-primary"></span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}