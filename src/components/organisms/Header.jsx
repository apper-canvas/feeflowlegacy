import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Header = ({ onMenuClick }) => {
  return (
    <header className="bg-white/70 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden"
              icon="Menu"
            >
              <span className="sr-only">Open sidebar</span>
            </Button>
            
            <div className="ml-4 lg:ml-0">
              <h1 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                Fee Management
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" icon="Bell">
              <span className="sr-only">Notifications</span>
            </Button>
            
            <Button variant="ghost" size="sm" icon="Settings">
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;