import React from 'react';
import styled from 'styled-components';

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
  ...props
}) => {
  return (
    <StyledWrapper
      $bgColor={bgColor}
      $textColor={textColor}
      $hoverBgColor={hoverBgColor}
      $hoverTextColor={hoverTextColor}
      $width={width}
      $height={height}
    >
      <button className={`btn ${className}`} {...props}>
        <span>{children || text}</span>
      </button>
    </StyledWrapper>
  );
};

interface StyledProps {
  $bgColor: string;
  $textColor: string;
  $hoverBgColor: string;
  $hoverTextColor: string;
  $width: string;
  $height: string;
}

const StyledWrapper = styled.div<StyledProps>`
  width: ${props => props.$width};
  display: inline-block;

  .btn {
    position: relative;
    display: inline-flex;
    overflow: hidden;
    cursor: pointer;
    width: 100%;
    height: ${props => props.$height};
    background-color: ${props => props.$bgColor};
    border-radius: 80px;
    border: none;
    outline: none;
    padding: 0 20px;
    transition: all 0.3s ease;
    justify-content: center;
    align-items: center;
    box-shadow: none;
  }

  .btn:focus,
  .btn:active,
  .btn:focus-visible {
    outline: none;
    box-shadow: none;
  }

  .btn:hover {
    transform: translateY(-2px) scale(1.04);
    background-color: ${props => props.$hoverBgColor};
    box-shadow: none;
  }

  .btn span {
    z-index: 2;
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    font-weight: 600;
    font-size: 15px;
    text-align: center;
    letter-spacing: 0.5px;
    color: ${props => props.$textColor};
    transition: color 0.3s ease;
  }

  .btn:hover span {
    color: ${props => props.$hoverTextColor};
  }
`;

export default Button;
