import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import SearchBar from "@/components/molecules/SearchBar";
import StatusFilter from "@/components/molecules/StatusFilter";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Modal from "@/components/organisms/Modal";
import FeeForm from "@/components/organisms/FeeForm";
import { feeService } from "@/services/api/feeService";
import { clientService } from "@/services/api/clientService";
import { toast } from "react-toastify";
import { format, isAfter } from "date-fns";

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredFees, setFilteredFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);

  const statusOptions = [
    { label: "All", value: "all" },
    { label: "Paid", value: "paid" },
    { label: "Pending", value: "pending" },
    { label: "Overdue", value: "overdue" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterFees();
  }, [fees, clients, searchTerm, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [feesData, clientsData] = await Promise.all([
        feeService.getAll(),
        clientService.getAll()
      ]);
      
      // Update fee status based on due date
      const updatedFees = feesData.map(fee => {
        if (fee.status === "pending" && isAfter(new Date(), new Date(fee.dueDate))) {
          return { ...fee, status: "overdue" };
        }
        return fee;
      });
      
      setFees(updatedFees);
      setClients(clientsData);
    } catch (err) {
      setError("Failed to load fees");
      console.error("Fees error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterFees = () => {
    let filtered = [...fees];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(fee => {
        const client = clients.find(c => c.Id === fee.clientId);
        return (
          fee.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fee.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(fee => fee.status === statusFilter);
    }

    setFilteredFees(filtered);
  };

  const handleAddFee = () => {
    setSelectedFee(null);
    setIsModalOpen(true);
  };

  const handleEditFee = (fee) => {
    setSelectedFee(fee);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setSelectedFee(null);
    loadData();
  };

  const handleDeleteFee = async (fee) => {
    if (!confirm(`Are you sure you want to delete this fee?`)) {
      return;
    }

    try {
      await feeService.delete(fee.Id);
      toast.success("Fee deleted successfully!");
      loadData();
    } catch (error) {
      toast.error("Failed to delete fee");
      console.error("Delete error:", error);
    }
  };

  const getBadgeVariant = (status) => {
    const variants = {
      paid: "paid",
      pending: "pending",
      overdue: "overdue"
    };
    return variants[status] || "default";
  };

  const getBadgeIcon = (status) => {
    const icons = {
      paid: "CheckCircle",
      pending: "Clock",
      overdue: "AlertTriangle"
    };
    return icons[status];
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.Id === clientId);
    return client ? client.name : "Unknown Client";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Fees</h1>
        </div>
        <Loading type="table" count={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Fees</h1>
        </div>
        <Error
          title="Failed to load fees"
          message={error}
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
            Fees
          </h1>
          <p className="text-gray-600 mt-1">Manage fee structures and track payment status</p>
        </div>
        
        <Button
          variant="primary"
          icon="Plus"
          onClick={handleAddFee}
        >
          Add Fee
        </Button>
      </div>

      {/* Filters */}
      <Card gradient className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search fees by description, category, or client..."
            />
          </div>
          <StatusFilter
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
      </Card>

      {/* Fees List */}
      {filteredFees.length === 0 ? (
        <Empty
          title="No fees found"
          message={searchTerm || statusFilter !== "all" 
            ? "Try adjusting your search or filter criteria." 
            : "Get started by creating your first fee."
          }
          actionLabel="Add Fee"
          onAction={searchTerm || statusFilter !== "all" ? undefined : handleAddFee}
          icon="DollarSign"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4"
        >
          {filteredFees.map((fee, index) => (
            <motion.div
              key={fee.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card hover className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      <ApperIcon name="DollarSign" className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">{fee.description}</h3>
                        {fee.isRecurring && (
                          <Badge variant="primary" size="sm" icon="RotateCcw">
                            Recurring
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="User" className="h-4 w-4" />
                          <span>{getClientName(fee.clientId)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="Tag" className="h-4 w-4" />
                          <span>{fee.category}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="Calendar" className="h-4 w-4" />
                          <span>Due: {format(new Date(fee.dueDate), "MMM dd, yyyy")}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${fee.amount.toLocaleString()}
                      </div>
                    </div>

                    <Badge 
                      variant={getBadgeVariant(fee.status)}
                      icon={getBadgeIcon(fee.status)}
                    >
                      {fee.status}
                    </Badge>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="Edit2"
                        onClick={() => handleEditFee(fee)}
                      >
                        <span className="sr-only">Edit fee</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="Trash2"
                        onClick={() => handleDeleteFee(fee)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <span className="sr-only">Delete fee</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedFee ? "Edit Fee" : "Add Fee"}
        size="lg"
      >
        <FeeForm
          fee={selectedFee}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Fees;