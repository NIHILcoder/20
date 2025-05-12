"use client";

import React, { useState, useEffect, useRef } from "react";
import type { Variants, HTMLMotionProps } from "framer-motion";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

// Properly defined interfaces for component props
interface AnimatedContainerProps extends HTMLMotionProps<"div"> {
    delay?: number;
}

// Animated container that reveals content with a fade-in animation
export function AnimatedContainer({
                                      children,
                                      className,
                                      delay = 0,
                                      ...props
                                  }: AnimatedContainerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// Interface for StaggeredContainer props
interface StaggeredContainerProps {
    children: React.ReactNode;
    className?: string;
    staggerDelay?: number;
}

// Staggered children animation container
export function StaggeredContainer({
                                       children,
                                       className,
                                       staggerDelay = 0.1,
                                       ...props
                                   }: StaggeredContainerProps) {
    const childrenArray = React.Children.toArray(children);

    return (
        <div className={className} {...props}>
            {childrenArray.map((child, index) => (
                <AnimatedContainer key={index} delay={index * staggerDelay}>
                    {child}
                </AnimatedContainer>
            ))}
        </div>
    );
}

// Animated Button with hover effects
export function AnimatedButton({
                                   children,
                                   className,
                                   variant = "default",
                                   size = "default",
                                   ...props
                               }: React.ComponentProps<typeof Button>) {
    return (
        <Button
            className={cn(
                "relative overflow-hidden transition-all duration-300",
                className
            )}
            variant={variant}
            size={size}
            {...props}
        >
            <motion.div
                className="absolute inset-0 bg-white/10 pointer-events-none"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.5, opacity: 0.2 }}
                transition={{ duration: 0.4 }}
            />
            {children}
        </Button>
    );
}

// Animated Call-to-Action Button
export function AnimatedCTAButton({
                                      children,
                                      className,
                                      ...props
                                  }: React.ComponentProps<typeof Button>) {
    return (
        <AnimatedButton
            className={cn(
                "group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary",
                className
            )}
            {...props}
        >
            <span className="flex items-center gap-2">
                {children}
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <ArrowRight className="h-4 w-4" />
                </motion.div>
            </span>
        </AnimatedButton>
    );
}

// Sparkle Button - Button with animated sparkles
export function SparkleButton({
                                  children,
                                  className,
                                  ...props
                              }: React.ComponentProps<typeof Button>) {
    return (
        <AnimatedButton
            className={cn("group", className)}
            {...props}
        >
            <span className="flex items-center gap-2">
                <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Sparkles className="h-4 w-4" />
                </motion.div>
                {children}
            </span>
        </AnimatedButton>
    );
}

// Interface for TypewriterText props
interface TypewriterTextProps {
    text: string;
    className?: string;
    speed?: number;
    delay?: number;
}

// Text that reveals itself by typing
export function TypewriterText({
                                   text,
                                   className,
                                   speed = 50,
                                   delay = 0,
                                   ...props
                               }: TypewriterTextProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Reset on text change
        setDisplayedText("");
        setCurrentIndex(0);

        // Clear previous interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Start typing after delay
        const startTimeout = setTimeout(() => {
            intervalRef.current = setInterval(() => {
                setCurrentIndex(prevIndex => {
                    const nextIndex = prevIndex + 1;
                    if (nextIndex > text.length) {
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        return prevIndex;
                    }
                    setDisplayedText(text.substring(0, nextIndex));
                    return nextIndex;
                });
            }, speed);
        }, delay);

        return () => {
            clearTimeout(startTimeout);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [text, speed, delay]);

    return (
        <div className={className} {...props}>
            {displayedText}
            <span className="inline-block w-[2px] h-[1em] bg-primary animate-blink ml-0.5"></span>
        </div>
    );
}

// Interface for AnimatedCollapsible props
interface AnimatedCollapsibleProps {
    title: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    defaultOpen?: boolean;
}

// Animated collapsible section
export function AnimatedCollapsible({
                                        title,
                                        children,
                                        className,
                                        defaultOpen = false,
                                        ...props
                                    }: AnimatedCollapsibleProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={cn("border rounded-md overflow-hidden", className)} {...props}>
            <button
                className="flex w-full items-center justify-between p-4 font-medium transition-colors hover:bg-muted/50"
                onClick={() => setIsOpen(!isOpen)}
            >
                {title}
                <div>
                    {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="p-4 pt-0 border-t">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Interface for AnimatedCounter props
interface AnimatedCounterProps {
    value: number;
    className?: string;
    duration?: number;
}

// Animated number counter
export function AnimatedCounter({
                                    value,
                                    className,
                                    duration = 1,
                                    ...props
                                }: AnimatedCounterProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const previousValue = useRef(0);

    useEffect(() => {
        // Store the previous value for animation reference
        previousValue.current = displayValue;

        // Animate to new value
        const step = 1000 / 60 / duration; // 60fps
        const diff = value - previousValue.current;
        const steps = Math.abs(Math.ceil(diff / step)) || 1;
        const increment = diff / steps;

        let currentStep = 0;

        const interval = setInterval(() => {
            currentStep++;
            setDisplayValue(prev => {
                const newValue = prev + increment;
                // Ensure we don't overshoot the target value
                if ((increment > 0 && newValue >= value) ||
                    (increment < 0 && newValue <= value)) {
                    clearInterval(interval);
                    return value;
                }
                return newValue;
            });

            if (currentStep >= steps) {
                clearInterval(interval);
                setDisplayValue(value);
            }
        }, 1000 / 60); // 60fps

        return () => clearInterval(interval);
    }, [value, duration]);

    return (
        <span className={className} {...props}>
            {Math.round(displayValue)}
        </span>
    );
}

// Interface for AnimatedProgressBar props
interface AnimatedProgressBarProps {
    value: number;
    className?: string;
    duration?: number;
}

// Animated progress bar that fills up
export function AnimatedProgressBar({
                                        value,
                                        className,
                                        duration = 1,
                                        ...props
                                    }: AnimatedProgressBarProps) {
    return (
        <div className={cn("w-full h-2 bg-secondary rounded-full overflow-hidden", className)} {...props}>
            <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration }}
            />
        </div>
    );
}

// Interface for AnimatedBadge props
interface AnimatedBadgeProps {
    children: React.ReactNode;
    className?: string;
    animation?: "pulse" | "bounce" | "none";
    style?: React.CSSProperties;
}

// Animated badge that can pulse or bounce
export function AnimatedBadge({
                                  children,
                                  className,
                                  animation = "pulse",
                                  ...props
                              }: AnimatedBadgeProps) {
    return (
        <motion.div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                className
            )}
            animate={
                animation === "pulse"
                    ? { scale: [1, 1.05, 1] }
                    : animation === "bounce"
                        ? { y: [0, -3, 0] }
                        : {}
            }
            transition={
                animation !== "none"
                    ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                    : {}
            }
            {...props}
        >
            {children}
        </motion.div>
    );
}

// Interface for RevealOnScroll props
interface RevealOnScrollProps {
    children: React.ReactNode;
    className?: string;
    animation?: "fadeIn" | "slideUp" | "slideIn" | "zoom";
    threshold?: number;
}

// Reveal on scroll component
export function RevealOnScroll({
                                   children,
                                   className,
                                   animation = "fadeIn",
                                   threshold = 0.1,
                                   ...props
                               }: RevealOnScrollProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [threshold]);

    const getAnimationProps = () => {
        switch (animation) {
            case "fadeIn":
                return {
                    initial: { opacity: 0 },
                    animate: isVisible ? { opacity: 1 } : { opacity: 0 },
                    transition: { duration: 0.6 }
                };
            case "slideUp":
                return {
                    initial: { opacity: 0, y: 50 },
                    animate: isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 },
                    transition: { duration: 0.6 }
                };
            case "slideIn":
                return {
                    initial: { opacity: 0, x: -50 },
                    animate: isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 },
                    transition: { duration: 0.6 }
                };
            case "zoom":
                return {
                    initial: { opacity: 0, scale: 0.9 },
                    animate: isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 },
                    transition: { duration: 0.6 }
                };
            default:
                return {};
        }
    };

    return (
        <motion.div
            ref={ref}
            className={className}
            {...getAnimationProps()}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// Interface for AnimatedGradientText props
interface AnimatedGradientTextProps {
    children: React.ReactNode;
    className?: string;
}

// Animated gradient text
export function AnimatedGradientText({
                                         children,
                                         className,
                                         ...props
                                     }: AnimatedGradientTextProps) {
    return (
        <motion.h1
            className={cn(
                "bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-gradient-size animate-gradient",
                className
            )}
            {...props}
        >
            {children}
        </motion.h1>
    );
}

// Interface for FloatingElement props
interface FloatingElementProps {
    children: React.ReactNode;
    className?: string;
    amplitude?: number;
    duration?: number;
}

// Floating element that hovers gently
export function FloatingElement({
                                    children,
                                    className,
                                    amplitude = 10,
                                    duration = 3,
                                    ...props
                                }: FloatingElementProps) {
    return (
        <motion.div
            className={className}
            animate={{
                y: [`-${amplitude}px`, `${amplitude}px`, `-${amplitude}px`]
            }}
            transition={{
                duration,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// Interface for AnimatedCard props
interface AnimatedCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

// Animated card with hover effects
export function AnimatedCard({
                                 children,
                                 className,
                                 ...props
                             }: AnimatedCardProps) {
    return (
        <motion.div
            className={cn(
                "rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden",
                className
            )}
            whileHover={{
                y: -5,
                boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)"
            }}
            transition={{ duration: 0.2 }}
            {...props}
        >
            {children}
        </motion.div>
    );
}