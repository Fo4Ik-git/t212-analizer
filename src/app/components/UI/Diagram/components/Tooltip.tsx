import { ReactNode, useEffect, useRef, useState } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string;
  className?: string;
}

export function Tooltip({ children, content, className = '' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: false, left: false, right: false });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && containerRef.current) {
      const tooltip = tooltipRef.current;
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Сначала измеряем tooltip с максимальной шириной
      tooltip.style.maxWidth = `${Math.min(500, viewportWidth - 20)}px`;
      tooltip.style.minWidth = '200px';
      tooltip.style.whiteSpace = 'normal';

      const tooltipRect = tooltip.getBoundingClientRect();

      // Проверяем, выходит ли tooltip за правый край экрана
      const rightOverflow = rect.left + tooltipRect.width / 2 > viewportWidth - 10;
      // Проверяем, выходит ли tooltip за левый край экрана
      const leftOverflow = rect.left - tooltipRect.width / 2 < 10;
      // Проверяем, выходит ли tooltip за верхний край экрана
      const topOverflow = rect.top - tooltipRect.height - 10 < 0;

      setPosition({
        top: topOverflow,
        left: leftOverflow,
        right: rightOverflow
      });
    }
  }, [isVisible]);

  const getTooltipStyles = () => {
    if (!containerRef.current) return {};

    const viewportWidth = window.innerWidth;
    const containerRect = containerRef.current.getBoundingClientRect();

    let maxWidth = 400; // Базовая максимальная ширина

    if (position.left) {
      // Если выравниваем по левому краю, ширина ограничена правым краем экрана
      maxWidth = Math.min(maxWidth, viewportWidth - containerRect.left - 20);
    } else if (position.right) {
      // Если выравниваем по правому краю, ширина ограничена левым краем экрана
      maxWidth = Math.min(maxWidth, containerRect.right - 20);
    } else {
      // Если центрируем, ширина ограничена расстоянием до ближайшего края
      const leftSpace = containerRect.left;
      const rightSpace = viewportWidth - containerRect.right;
      maxWidth = Math.min(maxWidth, Math.min(leftSpace, rightSpace) * 2 + containerRect.width);
    }

    return {
      maxWidth: `${Math.max(200, maxWidth)}px`, // Минимум 200px
      whiteSpace: 'normal' as const,
      wordWrap: 'break-word' as const,
      lineHeight: '1.4'
    };
  };

  const getTooltipClasses = () => {
    let classes = 'absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-xl border border-gray-700';

    if (position.top) {
      // Показываем снизу
      classes += ' top-full mt-2';
    } else {
      // Показываем сверху (по умолчанию)
      classes += ' bottom-full mb-2';
    }

    if (position.left) {
      // Выравниваем по левому краю
      classes += ' left-0';
    } else if (position.right) {
      // Выравниваем по правому краю
      classes += ' right-0';
    } else {
      // Центрируем (по умолчанию)
      classes += ' left-1/2 transform -translate-x-1/2';
    }

    return classes;
  };

  const getArrowClasses = () => {
    let classes = 'absolute w-0 h-0 border-l-4 border-r-4 border-transparent';

    if (position.top) {
      // Стрелочка сверху tooltip'а
      classes += ' border-b-4 border-b-gray-900 -top-1';
    } else {
      // Стрелочка снизу tooltip'а
      classes += ' border-t-4 border-t-gray-900 -bottom-1';
    }

    if (position.left) {
      classes += ' left-4';
    } else if (position.right) {
      classes += ' right-4';
    } else {
      classes += ' left-1/2 transform -translate-x-1/2';
    }

    return classes;
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={getTooltipClasses()}
          style={getTooltipStyles()}
        >
          {content}
          <div className={getArrowClasses()}></div>
        </div>
      )}
    </div>
  );
}
