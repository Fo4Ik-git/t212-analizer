'use client';

import React, {ReactNode, useState, useRef, useEffect, useCallback} from 'react';

interface DialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
    title?: string;
    footer?: ReactNode;
    isDraggable?: boolean;
    isResizable?: boolean;
    width?: number | string;
    height?: number | string;
}

const Dialog = (
    {
        isOpen,
        onOpenChange,
        children,
        title,
        footer,
        isDraggable = false,
        isResizable = false,
        width = 800,
        height = 'auto'
    }: DialogProps) => {
    const [position, setPosition] = useState({x: 0, y: 0});
    const [size, setSize] = useState({
        width: typeof width === 'number' ? width : width,
        height: typeof height === 'number' ? height : height
    });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);
    const initialPositionRef = useRef({x: 0, y: 0});
    const dialogPositionRef = useRef({x: 0, y: 0});
    const initialSizeRef = useRef({width: 0, height: 0});
    const resizeStartPosRef = useRef({x: 0, y: 0});

    // Центрирование диалога при открытии
    useEffect(() => {
        if (isOpen && dialogRef.current) {
            const dialogWidth = typeof width === 'number' ? width : dialogRef.current.offsetWidth;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Ограничиваем максимальную высоту диалога
            const maxHeight = viewportHeight * 0.9;

            setPosition({
                x: (viewportWidth - dialogWidth) / 2,
                y: viewportHeight * 0.05 // 5% отступ сверху
            });

            setSize({
                width: dialogWidth,
                height: typeof height === 'number'
                    ? Math.min(height, maxHeight)
                    : height === 'auto' ? 'auto' : height
            });
        }
    }, [isOpen, width, height]);

    const startDrag = (e: React.MouseEvent) => {
        if (!isDraggable) return;

        setIsDragging(true);
        initialPositionRef.current = {x: e.clientX, y: e.clientY};
        dialogPositionRef.current = {...position};

        e.preventDefault();
    };

    const onDrag = useCallback((e: MouseEvent) => {
        if (isDragging) {
            const deltaX = e.clientX - initialPositionRef.current.x;
            const deltaY = e.clientY - initialPositionRef.current.y;

            setPosition({
                x: dialogPositionRef.current.x + deltaX,
                y: dialogPositionRef.current.y + deltaY
            });
        }

        if (isResizing && dialogRef.current) {
            const deltaX = e.clientX - resizeStartPosRef.current.x;
            const deltaY = e.clientY - resizeStartPosRef.current.y;

            const newWidth = Math.max(200, initialSizeRef.current.width + deltaX);
            const newHeight = Math.max(100, initialSizeRef.current.height + deltaY);

            setSize({
                width: newWidth,
                height: newHeight
            });
        }
    }, [isDragging, isResizing]);

    const stopDrag = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    const startResize = (e: React.MouseEvent) => {
        if (!isResizable || !dialogRef.current) return;

        setIsResizing(true);
        resizeStartPosRef.current = {x: e.clientX, y: e.clientY};
        initialSizeRef.current = {
            width: dialogRef.current.offsetWidth,
            height: dialogRef.current.offsetHeight
        };

        e.preventDefault();
        e.stopPropagation();
    };

    useEffect(() => {
        if (isDraggable || isResizable) {
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('mouseup', stopDrag);

            return () => {
                document.removeEventListener('mousemove', onDrag);
                document.removeEventListener('mouseup', stopDrag);
            };
        }
    }, [isDraggable, isDragging, isResizable, isResizing, onDrag]);

    useEffect(() => {
        if (isOpen) {
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onOpenChange(false);
                }
            };

            // Блокировка прокрутки основного документа при открытом диалоге
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleKeyDown);

            return () => {
                document.body.style.overflow = '';
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isOpen, onOpenChange]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-hidden">
            <div
                className="fixed inset-0 bg-black/50"
                onClick={() => onOpenChange(false)}
            />
            <div
                ref={dialogRef}
                className="relative z-50 bg-background rounded-lg shadow-lg max-h-[90vh]"
                style={{
                    position: 'absolute',
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    width: typeof size.width === 'number' ? `${size.width}px` : size.width,
                    height: typeof size.height === 'number' ? `${size.height}px` : size.height,
                    maxHeight: '90vh',
                    transform: 'none',
                    cursor: isDragging ? 'grabbing' : 'default',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {isDraggable && (
                    <div
                        className="absolute top-0 left-0 right-0 h-10 cursor-grab bg-neutral-100 rounded-t-lg flex items-center justify-center"
                        onMouseDown={startDrag}
                    >
                        <div className="w-16 h-1 bg-neutral-300 rounded-full"></div>
                    </div>
                )}

                <div
                    style={{
                        marginTop: isDraggable ? '2.5rem' : '0',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        overflow: 'hidden'
                    }}
                >
                    {title && (
                        <div className="p-6 pb-0 flex-shrink-0">
                            <h2 className="text-xl font-bold">{title}</h2>
                        </div>
                    )}
                    <div className="p-6 overflow-y-auto flex-grow">
                        {children}
                    </div>

                    {footer && (
                        <div className="p-2 border-t rounded-b-lg">
                            {footer}
                        </div>
                    )}
                </div>

                {isResizable && (
                    <div
                        className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize"
                        style={{
                            background: 'transparent',
                            borderRight: '8px solid #888',
                            borderBottom: '8px solid #888',
                            borderBottomRightRadius: '4px'
                        }}
                        onMouseDown={startResize}
                    />
                )}
            </div>
        </div>
    );
};

export default Dialog;
