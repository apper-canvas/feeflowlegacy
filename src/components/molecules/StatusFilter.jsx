import React from "react";
import { cn } from "@/utils/cn";
import Button from "@/components/atoms/Button";

const StatusFilter = ({
  options = [],
  value,
  onChange,
  className,
  ...props
}) => {
  return (
    <div className={cn("flex flex-wrap gap-2", className)} {...props}>
      {options.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? "primary" : "outline"}
          size="sm"
          onClick={() => onChange(option.value)}
          className="text-xs"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export default StatusFilter;