import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = () => {
  const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Clients", href: "/clients", icon: "Users" },
    { name: "Fees", href: "/fees", icon: "DollarSign" },
    { name: "Payments", href: "/payments", icon: "CreditCard" },
    { name: "Invoices", href: "/invoices", icon: "FileText" },
  ];

  return (
    <div className="flex grow flex-col overflow-y-auto bg-gradient-to-b from-primary-900 via-primary-800 to-primary-700 border-r border-primary-600">
      <div className="flex h-16 shrink-0 items-center px-6">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-white/10 p-2 backdrop-blur-sm">
            <ApperIcon name="Banknote" className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FeeFlow</span>
        </div>
      </div>
      
      <nav className="flex flex-1 flex-col px-4 pb-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "group flex gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/20"
                      : "text-primary-100 hover:bg-white/5 hover:text-white"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <ApperIcon
                      name={item.icon}
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors duration-200",
                        isActive ? "text-white" : "text-primary-200 group-hover:text-white"
                      )}
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
        
        <div className="mt-auto pt-6">
          <div className="rounded-lg bg-white/5 p-4 backdrop-blur-sm border border-white/10">
            <div className="text-xs text-primary-200 mb-1">Total Revenue</div>
            <div className="text-lg font-bold text-white">$127,350</div>
            <div className="flex items-center mt-1">
              <ApperIcon name="TrendingUp" className="h-3 w-3 text-green-400 mr-1" />
              <span className="text-xs text-green-400">+12.5%</span>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;