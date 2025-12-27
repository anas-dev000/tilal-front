// src/components/common/Button.jsx
import { Loader2 } from "lucide-react"; // ← add this import (or use any spinner icon you prefer)

const Button = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  type = "button",
  disabled = false,
  isLoading = false,          // ← NEW: loading state prop
  className = "",
  icon: Icon,
  iconLeft: IconLeft,
  iconRight: IconRight,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    outline:
      "border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500",
    // You can add more variants if needed
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const iconSize = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  // Disable button when loading OR explicitly disabled
  const isDisabled = isLoading || disabled;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseStyles} ${variants[variant] || ""} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 
            className={`animate-spin ${iconSize[size]} mr-2`} 
          />
          <span>{children || "Loading..."}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className={`${iconSize[size]} mr-2`} />}
          
          {IconLeft && <IconLeft className={iconSize[size]} />}
          
          {children && <span>{children}</span>}
          
          {IconRight && <IconRight className={iconSize[size]} />}
        </>
      )}
    </button>
  );
};

export default Button;