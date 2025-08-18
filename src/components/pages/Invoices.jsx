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
import { feeService } from "@/services/api/feeService";
import { clientService } from "@/services/api/clientService";
import { toast } from "react-toastify";
import { format } from "date-fns";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm]);

  const loadInvoices = async () => {
    setLoading(true);
    setError("");
    try {
      const [feesData, clientsData] = await Promise.all([
        feeService.getAll(),
        clientService.getAll()
      ]);
      
      // Create invoice data from fees and clients
      const invoiceData = feesData.map(fee => {
        const client = clientsData.find(c => c.Id === fee.clientId);
        return {
          Id: fee.Id,
          invoiceNumber: `INV-${fee.Id.toString().padStart(4, "0")}`,
          clientId: fee.clientId,
          clientName: client?.name || "Unknown Client",
          clientEmail: client?.email || "",
          description: fee.description,
          amount: fee.amount,
          dueDate: fee.dueDate,
          status: fee.status,
          category: fee.category,
          isRecurring: fee.isRecurring,
          createdDate: new Date().toISOString().split("T")[0]
        };
      });
      
      setInvoices(invoiceData);
    } catch (err) {
      setError("Failed to load invoices");
      console.error("Invoices error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by due date (newest first)
    filtered.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));

    setFilteredInvoices(filtered);
  };

  const handlePreviewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsPreviewOpen(true);
  };

  const handlePrintInvoice = (invoice) => {
    // In a real app, this would generate a PDF or open print dialog
    toast.info("Print functionality would be implemented here");
    console.log("Printing invoice:", invoice);
  };

  const handleSendInvoice = (invoice) => {
    // In a real app, this would send email
    toast.success(`Invoice ${invoice.invoiceNumber} sent to ${invoice.clientEmail}`);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        </div>
        <Loading type="table" count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        </div>
        <Error
          title="Failed to load invoices"
          message={error}
          onRetry={loadInvoices}
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
            Invoices
          </h1>
          <p className="text-gray-600 mt-1">Generate and manage client invoices</p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            icon="Download"
          >
            Export All
          </Button>
          <Button
            variant="primary"
            icon="FileText"
          >
            New Invoice
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card gradient className="p-6">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search invoices by number, client, or description..."
        />
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card gradient className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
            </div>
            <div className="rounded-full bg-primary-100 p-3">
              <ApperIcon name="FileText" className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card gradient className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {invoices.filter(i => i.status === "paid").length}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <ApperIcon name="CheckCircle" className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card gradient className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-amber-600">
                {invoices.filter(i => i.status === "pending").length}
              </p>
            </div>
            <div className="rounded-full bg-amber-100 p-3">
              <ApperIcon name="Clock" className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card gradient className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">
                {invoices.filter(i => i.status === "overdue").length}
              </p>
            </div>
            <div className="rounded-full bg-red-100 p-3">
              <ApperIcon name="AlertTriangle" className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <Empty
          title="No invoices found"
          message={searchTerm 
            ? "Try adjusting your search criteria." 
            : "Invoices are automatically generated from your fees."
          }
          icon="FileText"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4"
        >
          {filteredInvoices.map((invoice, index) => (
            <motion.div
              key={invoice.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card hover className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      <ApperIcon name="FileText" className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">
                          {invoice.invoiceNumber}
                        </h3>
                        {invoice.isRecurring && (
                          <Badge variant="primary" size="sm" icon="RotateCcw">
                            Recurring
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="User" className="h-4 w-4" />
                          <span>{invoice.clientName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="FileText" className="h-4 w-4" />
                          <span>{invoice.description}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="Calendar" className="h-4 w-4" />
                          <span>Due: {format(new Date(invoice.dueDate), "MMM dd, yyyy")}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${invoice.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {invoice.category}
                      </div>
                    </div>

                    <Badge 
                      variant={getBadgeVariant(invoice.status)}
                      icon={getBadgeIcon(invoice.status)}
                    >
                      {invoice.status}
                    </Badge>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="Eye"
                        onClick={() => handlePreviewInvoice(invoice)}
                      >
                        <span className="sr-only">Preview invoice</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="Printer"
                        onClick={() => handlePrintInvoice(invoice)}
                      >
                        <span className="sr-only">Print invoice</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="Send"
                        onClick={() => handleSendInvoice(invoice)}
                        disabled={!invoice.clientEmail}
                      >
                        <span className="sr-only">Send invoice</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Invoice Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Invoice Preview"
        size="xl"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Invoice {selectedInvoice.invoiceNumber}
                </h2>
                <p className="text-gray-600">
                  Date: {format(new Date(selectedInvoice.createdDate), "MMMM dd, yyyy")}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">FeeFlow</div>
                <p className="text-sm text-gray-600">Professional Fee Management</p>
              </div>
            </div>

            {/* Bill To */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bill To:</h3>
              <div className="text-gray-700">
                <p className="font-medium">{selectedInvoice.clientName}</p>
                {selectedInvoice.clientEmail && <p>{selectedInvoice.clientEmail}</p>}
              </div>
            </div>

            {/* Invoice Details */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">Description</span>
                  <span className="font-medium text-gray-900">Amount</span>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{selectedInvoice.description}</p>
                    <p className="text-sm text-gray-600">
                      Category: {selectedInvoice.category}
                      {selectedInvoice.isRecurring && " (Recurring)"}
                    </p>
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    ${selectedInvoice.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Due:</span>
                <span className="text-2xl font-bold text-primary-600">
                  ${selectedInvoice.amount.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Due Date: {format(new Date(selectedInvoice.dueDate), "MMMM dd, yyyy")}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                icon="Printer"
                onClick={() => handlePrintInvoice(selectedInvoice)}
              >
                Print
              </Button>
              <Button
                variant="primary"
                icon="Send"
                onClick={() => handleSendInvoice(selectedInvoice)}
                disabled={!selectedInvoice.clientEmail}
              >
                Send to Client
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Invoices;