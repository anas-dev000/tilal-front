// src/components/common/FloatingActionButton.jsx
import React from "react";
import Button from "./Button";
import { useLanguage } from "../../contexts/LanguageContext";

const FloatingActionButton = ({ children, className, ...buttonProps }) => {
  const { isRTL } = useLanguage();

  const baseFloatingStyles = `
    fixed
    top-2   // Changed from bottom-6
    z-50
    transition-all
    duration-300
    ease-in-out
    md:top-2 // Changed from md:bottom-8
  `;

  // Position based on RTL/LTR:
  // If RTL (Arabic), position on the right.
  // If LTR (English), position on the left.
  const positionStyles = isRTL ? "right-12 md:right-76" : "left-12 md:left-76";

  return (
    <div className={`${baseFloatingStyles} ${positionStyles} ${className}`}>
      <Button
        size="lg"
        rotateIcon={isRTL} // NEW: Pass rotateIcon prop based on RTL
        {...buttonProps}
      >
        {children}
      </Button>
    </div>
  );
};

export default FloatingActionButton;
