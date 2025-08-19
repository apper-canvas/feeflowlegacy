import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MetricCard from "@/components/molecules/MetricCard";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { clientService } from "@/services/api/clientService";
import { feeService } from "@/services/api/feeService";
import { paymentService } from "@/services/api/paymentService";
import { format } from "date-fns";

const Dashboard = () => {
  const [data, setData] = useState({
    clients: [],
    fees: [],
    payments: [],
    metrics: {
      totalCollected: 0,
      totalPending: 0,
      totalOverdue: 0,
      totalClients: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [clients, fees, payments] = await Promise.all([
        clientService.getAll(),
        feeService.getAll(),
        paymentService.getAll()
      ]);

const totalCollected = payments.reduce((sum, payment) => sum + (payment.amount_c || 0), 0);
      const totalPending = fees
        .filter(fee => fee.status_c === "pending")
        .reduce((sum, fee) => sum + (fee.amount_c || 0), 0);
      const totalOverdue = fees
        .filter(fee => fee.status_c === "overdue")
        .reduce((sum, fee) => sum + (fee.amount_c || 0), 0);

      setData({
        clients,
        fees,
        payments,
        metrics: {
          totalCollected,
          totalPending,
          totalOverdue,
          totalClients: clients.length
        }
      });
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRecentActivities = () => {
    const activities = [];
// Recent payments
    data.payments
      .sort((a, b) => new Date(b.payment_date_c) - new Date(a.payment_date_c))
      .slice(0, 3)
      .forEach(payment => {
        const fee = data.fees.find(f => f.Id === (payment.fee_id_c?.Id || payment.fee_id_c));
        const client = data.clients.find(c => c.Id === (fee?.client_id_c?.Id || fee?.client_id_c));
        activities.push({
          id: `payment-${payment.Id}`,
          id: `payment-${payment.Id}`,
description: `Payment received from ${client?.Name || "Unknown Client"}`,
          amount: payment.amount_c,
          date: payment.payment_date_c,
          icon: "CreditCard",
          color: "text-green-600"
        });
      });

// Recent overdue fees
    data.fees
      .filter(fee => fee.status_c === "overdue")
      .sort((a, b) => new Date(a.due_date_c) - new Date(b.due_date_c))
      .slice(0, 2)
      .forEach(fee => {
        const client = data.clients.find(c => c.Id === (fee.client_id_c?.Id || fee.client_id_c));
        activities.push({
          id: `overdue-${fee.Id}`,
          type: "overdue",
          description: `Overdue fee from ${client?.Name || "Unknown Client"}`,
          amount: fee.amount_c,
          date: fee.due_date_c,
          icon: "AlertTriangle",
          color: "text-red-600"
        });
      });

    return activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

const getPendingActions = () => {
    const actions = [];
    
    const overdueCount = data.fees.filter(fee => fee.status_c === "overdue").length;
    const pendingCount = data.fees.filter(fee => fee.status_c === "pending").length;
    
    if (overdueCount > 0) {
      actions.push({
        id: "overdue-fees",
        title: `${overdueCount} Overdue Fee${overdueCount > 1 ? "s" : ""}`,
        description: "Require immediate attention",
        action: "View Fees",
        onClick: () => navigate("/fees"),
        priority: "high"
      });
    }
    
    if (pendingCount > 0) {
      actions.push({
        id: "pending-fees",
        title: `${pendingCount} Pending Fee${pendingCount > 1 ? "s" : ""}`,
        description: "Awaiting payment",
        action: "View Fees",
        onClick: () => navigate("/fees"),
        priority: "medium"
      });
    }

    return actions;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <Loading type="metrics" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Loading />
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <Error
          title="Dashboard Error"
          message={error}
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  const recentActivities = getRecentActivities();
  const pendingActions = getPendingActions();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Overview of your fee management system</p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            icon="FileText"
            onClick={() => navigate("/invoices")}
          >
            Create Invoice
          </Button>
          <Button
            variant="primary"
            icon="Plus"
            onClick={() => navigate("/fees")}
          >
            Add Fee
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <MetricCard
          title="Total Collected"
          value={data.metrics.totalCollected}
          change="+12.5%"
          changeType="positive"
          icon="TrendingUp"
          iconColor="text-green-600"
        />
        <MetricCard
          title="Pending Payments"
          value={data.metrics.totalPending}
change={`${data.fees.filter(f => f.status_c === "pending").length} fees`}
          changeType="neutral"
          icon="Clock"
          iconColor="text-amber-600"
        />
        <MetricCard
          title="Overdue Amount"
          value={data.metrics.totalOverdue}
change={`${data.fees.filter(f => f.status_c === "overdue").length} fees`}
          changeType="negative"
          icon="AlertTriangle"
          iconColor="text-red-600"
        />
        <MetricCard
          title="Total Clients"
          value={data.metrics.totalClients}
change={`${data.clients.filter(c => c.status_c === "active").length} active`}
          changeType="positive"
          icon="Users"
          iconColor="text-primary-600"
        />
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card gradient className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
              <ApperIcon name="Activity" className="h-5 w-5 text-primary-600" />
            </div>
            
            {recentActivities.length === 0 ? (
              <Empty
                title="No recent activities"
                message="Activities will appear here as you manage fees and payments."
                icon="Activity"
                className="border-0 shadow-none bg-transparent"
              />
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-sm transition-all duration-200"
                  >
                    <div className={`rounded-full p-2 bg-gray-100 ${activity.color}`}>
                      <ApperIcon name={activity.icon} className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(activity.date), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      ${activity.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Pending Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card gradient className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Pending Actions</h2>
              <ApperIcon name="CheckSquare" className="h-5 w-5 text-primary-600" />
            </div>
            
            {pendingActions.length === 0 ? (
              <Empty
                title="All caught up!"
                message="No pending actions at the moment. Great work!"
                icon="CheckCircle"
                className="border-0 shadow-none bg-transparent"
              />
            ) : (
              <div className="space-y-4">
                {pendingActions.map((action) => (
                  <div
                    key={action.id}
                    className="p-4 rounded-lg border border-gray-200 bg-gradient-to-r from-white to-gray-50 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={action.priority === "high" ? "error" : "warning"}
                          size="sm"
                        >
                          {action.priority}
                        </Badge>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {action.title}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {action.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={action.onClick}
                      >
                        {action.action}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;