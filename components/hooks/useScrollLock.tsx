import { useEffect, useRef } from "react";

/**
 * Хук для предотвращения "прыжка" контента при открытии/закрытии модальных окон
 */
export function useScrollLock(isLocked: boolean) {
    // Сохраняем позицию прокрутки
    const scrollPositionRef = useRef(0);

    useEffect(() => {
        // Хранение оригинальных стилей для восстановления
        const originalStyles = window.getComputedStyle(document.body);
        const originalOverflow = originalStyles.overflow;

        if (isLocked) {
            // Сохраняем текущую позицию прокрутки
            scrollPositionRef.current = window.scrollY;

            // Добавляем класс к html и body
            document.documentElement.classList.add('dialog-open');
            document.body.classList.add('dialog-open');

            // Фиксация позиции для предотвращения прокрутки фона
            document.body.style.top = `-${scrollPositionRef.current}px`;
        }

        return () => {
            if (isLocked) {
                // Восстанавливаем оригинальные стили
                document.documentElement.classList.remove('dialog-open');
                document.body.classList.remove('dialog-open');
                document.body.style.top = '';
                document.body.style.overflow = originalOverflow;

                // Восстанавливаем позицию прокрутки
                window.scrollTo(0, scrollPositionRef.current);
            }
        };
    }, [isLocked]);
}