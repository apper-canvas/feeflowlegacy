import React from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Error = ({
  title = "Something went wrong",
  message = "We encountered an error while loading the data. Please try again.",
  onRetry,
  className,
  ...props
}) => {
  return (
    <Card className={`p-8 text-center ${className}`} {...props}>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <ApperIcon name="AlertTriangle" className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="primary"
          className="mt-6"
          icon="RefreshCw"
        >
          Try Again
        </Button>
      )}
    </Card>
  );
};

export default Error;