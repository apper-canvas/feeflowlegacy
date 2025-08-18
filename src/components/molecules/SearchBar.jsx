import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Input from "@/components/atoms/Input";

const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  className,
  ...props
}) => {
  return (
    <div className={cn("relative", className)} {...props}>
      <ApperIcon
        name="Search"
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
      />
      <Input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pl-10"
      />
    </div>
  );
};

export default SearchBar;