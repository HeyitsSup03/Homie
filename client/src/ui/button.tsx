import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  bgColor?: string;
  textColor?: string;
  hoverBgColor?: string;
  hoverTextColor?: string;
  width?: string;
  height?: string;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  text = 'Click Me',
  bgColor = '#1f1f1f',
  textColor = '#eeeeed',
  hoverBgColor = '#a855f7',
  hoverTextColor = '#ffffff',
  width = '160px',
  height = '50px',
  children,
  className = '',
  style,
  ...props
}) => {
  return (
    <div
      className="inline-block"
      style={{ width }}
    >
      <button
        className={`btn-base ${className}`}
        style={{
          height,
          backgroundColor: bgColor,
          color: textColor,
          // CSS custom properties for hover state (handled via inline style + CSS class)
          ['--hover-bg' as string]: hoverBgColor,
          ['--hover-text' as string]: hoverTextColor,
          ...style,
        }}
        {...props}
      >
        <span className="btn-label">{children || text}</span>
      </button>
    </div>
  );
};

export default Button;
