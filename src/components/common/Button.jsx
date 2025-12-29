// src/components/common/Button.jsx
import { Loader2 } from "lucide-react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  type = "button",
  disabled = false,
  isLoading = false,
  className = "",
  icon: Icon,
  iconLeft: IconLeft,
  iconRight: IconRight,
  rotateIcon = false, // <--- NEW: Add rotateIcon prop, default to false
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
    "ghost-success":
      "bg-transparent text-green-600 font-bold hover:bg-green-50 focus:ring-green-500",
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

  // NEW: Add rotation class if rotateIcon is true
  const iconBaseClasses = iconSize[size];
  const iconRotationClass = rotateIcon
    ? "rotate-180 transition-transform duration-300"
    : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseStyles} ${variants[variant] || ""} ${
        sizes[size]
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className={`animate-spin ${iconBaseClasses} mr-2`} />
          <span>{children || "Loading..."}</span>
        </>
      ) : (
        <>
          {/* Apply rotation class to all icon props */}
          {Icon && (
            <Icon className={`${iconBaseClasses} ${iconRotationClass} mr-2`} />
          )}
          {IconLeft && (
            <IconLeft className={`${iconBaseClasses} ${iconRotationClass}`} />
          )}
          {children && <span>{children}</span>}
          {IconRight && (
            <IconRight className={`${iconBaseClasses} ${iconRotationClass}`} />
          )}
        </>
      )}
    </button>
  );
};

export default Button;
