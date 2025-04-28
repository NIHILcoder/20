"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

interface Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
    color: string;
    pulse: number;
    pulseSpeed: number;
}

interface EnhancedParticlesBackgroundProps {
    density?: number;
    interactive?: boolean;
    colors?: string[];
    variant?: "default" | "waves" | "bubbles" | "sparkles";
    className?: string;
}

export function EnhancedParticlesBackground({
                                                density = 100,
                                                interactive = true,
                                                colors,
                                                variant = "default",
                                                className,
                                            }: EnhancedParticlesBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef<{ x: number; y: number; radius: number }>({
        x: 0,
        y: 0,
        radius: 200,
    });
    const animationFrameIdRef = useRef<number>(0);
    const particlesRef = useRef<Particle[]>([]);
    const { theme } = useTheme();
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [isThemeInitialized, setIsThemeInitialized] = useState(false);

    // Initialize particles
    const initParticles = (width: number, height: number, currentTheme: string) => {
        const particleCount = Math.min(Math.floor(width / (900 / density)), density);
        const particles: Particle[] = [];

        // Define colors based on theme if not provided
        const defaultLightColors = ["#e1e1e1", "#d1d1e0", "#c2c2d6"];
        const defaultDarkColors = ["#2a2a3c", "#3a3a4c", "#4a4a5c"];

        const themeColors = colors || (currentTheme === "dark" ? defaultDarkColors : defaultLightColors);

        for (let i = 0; i < particleCount; i++) {
            const size = variant === "bubbles"
                ? Math.random() * 5 + 2
                : Math.random() * 2 + 0.5;

            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.3 + 0.1,
                color: themeColors[Math.floor(Math.random() * themeColors.length)],
                pulse: Math.random() * 2 * Math.PI,
                pulseSpeed: Math.random() * 0.02 + 0.01,
            });
        }

        particlesRef.current = particles;
    };

    // Handle mouse move for interactive particles
    const handleMouseMove = (e: MouseEvent) => {
        if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            mouseRef.current.x = e.clientX - rect.left;
            mouseRef.current.y = e.clientY - rect.top;
        }
    };

    const handleMouseLeave = () => {
        mouseRef.current.x = 0;
        mouseRef.current.y = 0;
    };

    // Update canvas size when window resizes
    const handleResize = () => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            setCanvasSize({ width: canvas.width, height: canvas.height });
            initParticles(canvas.width, canvas.height, theme || "light");
        }
    };

    // Draw particles on canvas
    useEffect(() => {
        if (!canvasRef.current || !isThemeInitialized) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Handle resize
        handleResize();
        window.addEventListener("resize", handleResize);

        // Handle mouse events for interactivity
        if (interactive) {
            window.addEventListener("mousemove", handleMouseMove);
            canvas.addEventListener("mouseleave", handleMouseLeave);
        }

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawParticles(ctx, canvas.width, canvas.height);
            animationFrameIdRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameIdRef.current);
            window.removeEventListener("resize", handleResize);
            if (interactive) {
                window.removeEventListener("mousemove", handleMouseMove);
                canvas.removeEventListener("mouseleave", handleMouseLeave);
            }
        };
    }, [isThemeInitialized, interactive, variant, density]);

    // Initialize particles when theme changes
    useEffect(() => {
        if (!theme) return;

        if (canvasRef.current) {
            const canvas = canvasRef.current;
            initParticles(canvas.width, canvas.height, theme);
            setIsThemeInitialized(true);
        }
    }, [theme, density, colors]);

    // Draw particles based on the selected variant
    const drawParticles = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        const particles = particlesRef.current;
        const isDark = theme === "dark";
        const particleColor = isDark ? "255, 255, 255" : "0, 0, 0";
        const lineColor = isDark ? "255, 255, 255" : "0, 0, 0";

        // Draw and update particles
        particles.forEach((particle) => {
            // Update position and handle bounce
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Boundary check with bounce
            if (particle.x < 0 || particle.x > width) {
                particle.speedX *= -1;
            }

            if (particle.y < 0 || particle.y > height) {
                particle.speedY *= -1;
            }

            // Update pulse for size/opacity animation
            particle.pulse += particle.pulseSpeed;

            // Draw particle based on variant
            switch (variant) {
                case "waves":
                    drawWaveParticle(ctx, particle);
                    break;
                case "bubbles":
                    drawBubbleParticle(ctx, particle);
                    break;
                case "sparkles":
                    drawSparkleParticle(ctx, particle);
                    break;
                default:
                    drawDefaultParticle(ctx, particle);
            }
        });

        // Draw connections between particles for default and waves variants
        if (variant === "default" || variant === "waves") {
            drawConnections(ctx, particles, lineColor);
        }

        // Handle mouse interactivity
        if (interactive && (mouseRef.current.x || mouseRef.current.y)) {
            handleMouseInteraction(ctx, particles);
        }
    };

    // Draw standard particle
    const drawDefaultParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
        const pulseFactor = variant === "default" ? 0 : Math.sin(particle.pulse) * 0.5 + 0.5;
        const size = particle.size * (1 + pulseFactor * 0.3);

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${hexToRgb(particle.color)}, ${particle.opacity})`;
        ctx.fill();
    };

    // Draw wave-style particle
    const drawWaveParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
        const pulseFactor = Math.sin(particle.pulse) * 0.5 + 0.5;
        const size = particle.size * (1 + pulseFactor * 0.5);

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${hexToRgb(particle.color)}, ${particle.opacity * (0.7 + pulseFactor * 0.3)})`;
        ctx.fill();

        // Add a subtle glow effect
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${hexToRgb(particle.color)}, ${particle.opacity * 0.1})`;
        ctx.fill();
    };

    // Draw bubble-style particle
    const drawBubbleParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
        const pulseFactor = Math.sin(particle.pulse) * 0.5 + 0.5;
        const size = particle.size * (1 + pulseFactor * 0.2);

        // Main bubble
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${hexToRgb(particle.color)}, ${particle.opacity * 0.8})`;
        ctx.fill();

        // Highlight
        ctx.beginPath();
        ctx.arc(
            particle.x - size * 0.3,
            particle.y - size * 0.3,
            size * 0.4,
            0, Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * 0.5})`;
        ctx.fill();
    };

    // Draw sparkle-style particle
    const drawSparkleParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
        const pulseFactor = Math.sin(particle.pulse) * 0.5 + 0.5;
        const size = particle.size * (0.8 + pulseFactor * 0.5);

        // Draw star-like shape
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.pulse);

        ctx.beginPath();
        const spikes = 4;
        const outerRadius = size;
        const innerRadius = size * 0.4;

        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI * i) / spikes;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();
        ctx.fillStyle = `rgba(${hexToRgb(particle.color)}, ${particle.opacity * (0.6 + pulseFactor * 0.4)})`;
        ctx.fill();

        // Add glow effect
        const gradient = ctx.createRadialGradient(0, 0, innerRadius, 0, 0, outerRadius * 2);
        gradient.addColorStop(0, `rgba(${hexToRgb(particle.color)}, ${particle.opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(${hexToRgb(particle.color)}, 0)`);

        ctx.beginPath();
        ctx.arc(0, 0, outerRadius * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = "lighter";
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";

        ctx.restore();
    };

    // Draw connections between particles
    const drawConnections = (ctx: CanvasRenderingContext2D, particles: Particle[], lineColor: string) => {
        const maxDistance = variant === "waves" ? 120 : 100;

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);

                    const opacity = variant === "waves"
                        ? 0.15 * (1 - distance / maxDistance) * (0.8 + Math.sin(particles[i].pulse) * 0.2)
                        : 0.1 * (1 - distance / maxDistance);

                    ctx.strokeStyle = `rgba(${lineColor}, ${opacity})`;
                    ctx.lineWidth = variant === "waves" ? 0.8 : 0.5;
                    ctx.stroke();
                }
            }
        }
    };

    // Handle mouse interaction with particles
    const handleMouseInteraction = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
        const { x, y, radius } = mouseRef.current;
        const mouseActiveRadius = radius * (variant === "waves" ? 1.5 : 1);

        particles.forEach((particle) => {
            const dx = particle.x - x;
            const dy = particle.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouseActiveRadius) {
                // Different interaction behavior based on variant
                switch (variant) {
                    case "waves":
                        // Create ripple effect
                        const rippleFactor = 1 - distance / mouseActiveRadius;
                        const angle = Math.atan2(dy, dx);

                        particle.x += Math.cos(angle) * rippleFactor * 2;
                        particle.y += Math.sin(angle) * rippleFactor * 2;

                        // Draw special interaction visual
                        ctx.beginPath();
                        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(${hexToRgb(particle.color)}, ${particle.opacity * 1.5})`;
                        ctx.fill();
                        break;

                    case "bubbles":
                        // Bubbles move away from mouse
                        const bubbleFactor = 1 - distance / mouseActiveRadius;
                        const bubbleAngle = Math.atan2(dy, dx);

                        particle.x += Math.cos(bubbleAngle) * bubbleFactor * 1.5;
                        particle.y += Math.sin(bubbleAngle) * bubbleFactor * 1.5;
                        particle.opacity = Math.min(0.8, particle.opacity * 1.1);
                        break;

                    case "sparkles":
                        // Sparkles get brighter near mouse
                        const sparkFactor = 1 - distance / mouseActiveRadius;
                        particle.pulse += 0.1; // Speed up animation

                        // Draw bright spot
                        ctx.beginPath();
                        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(${hexToRgb(particle.color)}, ${sparkFactor * 0.3})`;
                        ctx.fill();
                        break;

                    default:
                        // Default - repel particles
                        if (distance > 0) { // Avoid division by zero
                            const pushFactor = (mouseActiveRadius - distance) / mouseActiveRadius;
                            const pushX = (dx / distance) * pushFactor * 2;
                            const pushY = (dy / distance) * pushFactor * 2;

                            particle.x += pushX;
                            particle.y += pushY;
                        }
                }
            }
        });
    };

    // Helper to convert hex color to RGB
    const hexToRgb = (hex: string) => {
        // Remove # if present
        hex = hex.replace(/^#/, '');

        // Parse as hex and extract RGB components
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;

        return `${r}, ${g}, ${b}`;
    };

    return (
        <canvas
            ref={canvasRef}
            className={`particles-container animate-fade-in ${className || ""}`}
            aria-hidden="true"
            style={{
                opacity: isThemeInitialized ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out'
            }}
        />
    );
}