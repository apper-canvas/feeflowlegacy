import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Button = React.forwardRef(({
  children,
  className,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  disabled = false,
  loading = false,
  ...props
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 focus:ring-primary-500 shadow-sm hover:shadow-md transform hover:scale-[1.02]",
    secondary: "bg-white text-primary-700 border border-primary-200 hover:bg-primary-50 focus:ring-primary-500 shadow-sm hover:shadow-md",
    outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-primary-500 shadow-sm hover:shadow-md",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <>
          <ApperIcon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <ApperIcon name={icon} className="mr-2 h-4 w-4" />
          )}
          {children}
          {icon && iconPosition === "right" && (
            <ApperIcon name={icon} className="ml-2 h-4 w-4" />
          )}
        </>
      )}
    </button>
  );
});

Button.displayName = "Button";

export default Button;