import React from "react";
import { cn } from "@/utils/cn";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const MetricCard = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  iconColor = "text-primary-500",
  className,
  ...props
}) => {
  const changeColors = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-500"
  };

  const formatValue = (val) => {
    if (typeof val === "number") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val);
    }
    return val;
  };

  return (
    <Card
      gradient
      hover
      className={cn("p-6", className)}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
            {formatValue(value)}
          </p>
          {change && (
            <div className="flex items-center space-x-1">
              <ApperIcon
                name={changeType === "positive" ? "TrendingUp" : changeType === "negative" ? "TrendingDown" : "Minus"}
                className={cn("h-4 w-4", changeColors[changeType])}
              />
              <span className={cn("text-sm font-medium", changeColors[changeType])}>
                {change}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn("rounded-full bg-primary-100 p-3", iconColor)}>
            <ApperIcon name={icon} className="h-6 w-6" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;