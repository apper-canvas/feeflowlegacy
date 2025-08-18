import React from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({
  title = "No data found",
  message = "Get started by adding your first item.",
  actionLabel = "Add Item",
  onAction,
  icon = "Package",
  className,
  ...props
}) => {
  return (
    <Card className={`p-8 text-center ${className}`} {...props}>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-50">
        <ApperIcon name={icon} className="h-8 w-8 text-primary-600" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{message}</p>
      {onAction && (
        <Button
          onClick={onAction}
          variant="primary"
          className="mt-6"
          icon="Plus"
        >
          {actionLabel}
        </Button>
      )}
    </Card>
  );
};

export default Empty;