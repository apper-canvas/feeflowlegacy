import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Badge = React.forwardRef(({
  children,
  className,
  variant = "default",
  size = "md",
  icon,
  ...props
}, ref) => {
  const baseClasses = "inline-flex items-center rounded-full font-medium";
  
  const variants = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-primary-100 text-primary-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-amber-100 text-amber-800",
    error: "bg-red-100 text-red-800",
    paid: "bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200",
    pending: "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border border-amber-200",
    overdue: "bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200",
    active: "bg-gradient-to-r from-primary-100 to-primary-50 text-primary-800 border border-primary-200"
  };
  
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm"
  };

  return (
    <span
      ref={ref}
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {icon && <ApperIcon name={icon} className="mr-1 h-3 w-3" />}
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

export default Badge;