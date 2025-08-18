import React from "react";
import { cn } from "@/utils/cn";

const Card = React.forwardRef(({
  className,
  children,
  gradient = false,
  hover = false,
  ...props
}, ref) => {
  const baseClasses = "rounded-xl border border-gray-200 bg-white shadow-sm";
  const gradientClasses = gradient ? "bg-gradient-to-br from-white to-gray-50/50" : "";
  const hoverClasses = hover ? "hover:shadow-md transition-all duration-200 hover:scale-[1.01]" : "";

  return (
    <div
      ref={ref}
      className={cn(baseClasses, gradientClasses, hoverClasses, className)}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;