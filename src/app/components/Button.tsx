import React from 'react';

export enum ButtonVariant {
    Primary = 'primary',
    Secondary = 'secondary',
    Danger = 'danger',
    Success = 'success',
    White = 'white',
    Login = 'login',
    Transparent = 'transparent',
    Tab = 'tab'
}

interface ButtonProps {
    children: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
    onChange?: () => void;
    disabled?: boolean;
    className?: string;
    variant?: ButtonVariant;
}

const Button: React.FC<ButtonProps> = (props: ButtonProps) => {
    const {
        variant = ButtonVariant.Primary,
        size = 'md',
        children,
        onClick,
        onChange,
        className
    } = props;

    const baseStyles = 'px-4 py-2 rounded cursor-pointer';
    const sizeStyles = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };
    const variantStyles = {
        [ButtonVariant.Primary]: 'bg-primary text-text hover:bg-blue-600',
        [ButtonVariant.Secondary]: 'bg-gray-500 text-text hover:bg-gray-600',
        [ButtonVariant.Danger]: 'bg-red-500 text-text hover:bg-red-600',
        [ButtonVariant.Success]: 'bg-green-500 text-text hover:bg-green-600',
        [ButtonVariant.White]: 'bg-white text-black hover:bg-gray-200',
        [ButtonVariant.Login]: 'bg-background text-text hover:bg-gray-200',
        [ButtonVariant.Transparent]: 'bg-transparent text-text hover:bg-neutral-100',
        [ButtonVariant.Tab]: 'bg-transparent text-text hover:bg-gray-700 border-b-2 border-transparent hover:border-primary'
    };

    return (
        <button
            onClick={onClick}
            onChange={onChange}
            type={props.type || 'button'}
            disabled={props.disabled}
            className={`${baseStyles} ${sizeStyles[size]} ${props.disabled ? variantStyles[ButtonVariant.Secondary] : variantStyles[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
