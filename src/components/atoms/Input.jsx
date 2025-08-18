import React from "react";
import { cn } from "@/utils/cn";

const Input = React.forwardRef(({
  className,
  type = "text",
  error,
  ...props
}, ref) => {
  const baseClasses = "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-500 transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50";
  
  const errorClasses = error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "";

  return (
    <input
      type={type}
      className={cn(baseClasses, errorClasses, className)}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;