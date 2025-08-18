import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import SearchBar from "@/components/molecules/SearchBar";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Modal from "@/components/organisms/Modal";
import PaymentForm from "@/components/organisms/PaymentForm";
import { paymentService } from "@/services/api/paymentService";
import { feeService } from "@/services/api/feeService";
import { clientService } from "@/services/api/clientService";
import { toast } from "react-toastify";
import { format } from "date-fns";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [fees, setFees] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, fees, clients, searchTerm]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [paymentsData, feesData, clientsData] = await Promise.all([
        paymentService.getAll(),
        feeService.getAll(),
        clientService.getAll()
      ]);
      
      setPayments(paymentsData);
      setFees(feesData);
      setClients(clientsData);
    } catch (err) {
      setError("Failed to load payments");
      console.error("Payments error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(payment => {
        const fee = fees.find(f => f.Id === payment.feeId);
        const client = fee ? clients.find(c => c.Id === fee.clientId) : null;
        return (
          payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fee?.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Sort by payment date (newest first)
    filtered.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    setFilteredPayments(filtered);
  };

  const handleAddPayment = () => {
    setSelectedPayment(null);
    setIsModalOpen(true);
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
    loadData();
  };

  const handleDeletePayment = async (payment) => {
    if (!confirm(`Are you sure you want to delete this payment?`)) {
      return;
    }

    try {
      await paymentService.delete(payment.Id);
      toast.success("Payment deleted successfully!");
      loadData();
    } catch (error) {
      toast.error("Failed to delete payment");
      console.error("Delete error:", error);
    }
  };

  const getPaymentDetails = (payment) => {
    const fee = fees.find(f => f.Id === payment.feeId);
    const client = fee ? clients.find(c => c.Id === fee.clientId) : null;
    
    return {
      clientName: client?.name || "Unknown Client",
      feeDescription: fee?.description || "Unknown Fee",
      feeCategory: fee?.category || "Unknown"
    };
  };

  const getMethodBadgeVariant = (method) => {
    const variants = {
      "Bank Transfer": "primary",
      "Credit Card": "success",
      "Check": "warning",
      "Cash": "default",
      "PayPal": "primary"
    };
    return variants[method] || "default";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        </div>
        <Loading type="table" count={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        </div>
        <Error
          title="Failed to load payments"
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
            Payments
          </h1>
          <p className="text-gray-600 mt-1">Track and manage payment records</p>
        </div>
        
        <Button
          variant="primary"
          icon="Plus"
          onClick={handleAddPayment}
        >
          Record Payment
        </Button>
      </div>

      {/* Search */}
      <Card gradient className="p-6">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search payments by reference, method, client, or fee..."
        />
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card gradient className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
            </div>
            <div className="rounded-full bg-primary-100 p-3">
              <ApperIcon name="CreditCard" className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card gradient className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                ${payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <ApperIcon name="DollarSign" className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card gradient className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {payments.filter(p => {
                  const paymentDate = new Date(p.paymentDate);
                  const now = new Date();
                  return paymentDate.getMonth() === now.getMonth() && 
                         paymentDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <div className="rounded-full bg-amber-100 p-3">
              <ApperIcon name="Calendar" className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <Empty
          title="No payments found"
          message={searchTerm 
            ? "Try adjusting your search criteria." 
            : "Get started by recording your first payment."
          }
          actionLabel="Record Payment"
          onAction={searchTerm ? undefined : handleAddPayment}
          icon="CreditCard"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4"
        >
          {filteredPayments.map((payment, index) => {
            const details = getPaymentDetails(payment);
            
            return (
              <motion.div
                key={payment.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card hover className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                        <ApperIcon name="CheckCircle" className="h-6 w-6 text-white" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-gray-900">
                            Payment from {details.clientName}
                          </h3>
                          <Badge variant={getMethodBadgeVariant(payment.method)}>
                            {payment.method}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <ApperIcon name="FileText" className="h-4 w-4" />
                            <span>{details.feeDescription}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ApperIcon name="Tag" className="h-4 w-4" />
                            <span>{details.feeCategory}</span>
                          </div>
                          {payment.reference && (
                            <div className="flex items-center space-x-1">
                              <ApperIcon name="Hash" className="h-4 w-4" />
                              <span>{payment.reference}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ${payment.amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {format(new Date(payment.paymentDate), "MMM dd, yyyy")}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="Edit2"
                          onClick={() => handleEditPayment(payment)}
                        >
                          <span className="sr-only">Edit payment</span>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="Trash2"
                          onClick={() => handleDeletePayment(payment)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <span className="sr-only">Delete payment</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPayment ? "Edit Payment" : "Record Payment"}
        size="lg"
      >
        <PaymentForm
          payment={selectedPayment}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Payments;