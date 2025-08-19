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
import ClientForm from "@/components/organisms/ClientForm";
import { clientService } from "@/services/api/clientService";
import { toast } from "react-toastify";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const statusOptions = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Pending", value: "pending" },
    { label: "Overdue", value: "overdue" },
  ];

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, statusFilter]);

  const loadClients = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (err) {
      setError("Failed to load clients");
      console.error("Clients error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = [...clients];

    // Filter by search term
    if (searchTerm) {
filtered = filtered.filter(
        client =>
          client.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email_c?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
if (statusFilter !== "all") {
      filtered = filtered.filter(client => client.status_c === statusFilter);
    }

    setFilteredClients(filtered);
  };

  const handleAddClient = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
    loadClients();
  };

  const handleDeleteClient = async (client) => {
    if (!confirm(`Are you sure you want to delete ${client.name}?`)) {
      return;
    }

    try {
      await clientService.delete(client.Id);
      toast.success("Client deleted successfully!");
      loadClients();
    } catch (error) {
      toast.error("Failed to delete client");
      console.error("Delete error:", error);
    }
  };

  const getBadgeVariant = (status) => {
    const variants = {
      active: "active",
      pending: "pending",
      overdue: "overdue"
    };
    return variants[status] || "default";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        </div>
        <Loading type="table" count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        </div>
        <Error
          title="Failed to load clients"
          message={error}
          onRetry={loadClients}
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
            Clients
          </h1>
          <p className="text-gray-600 mt-1">Manage your client information and payment status</p>
        </div>
        
        <Button
          variant="primary"
          icon="Plus"
          onClick={handleAddClient}
        >
          Add Client
        </Button>
      </div>

      {/* Filters */}
      <Card gradient className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clients by name or email..."
            />
          </div>
          <StatusFilter
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
      </Card>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <Empty
          title="No clients found"
          message={searchTerm || statusFilter !== "all" 
            ? "Try adjusting your search or filter criteria." 
            : "Get started by adding your first client."
          }
          actionLabel="Add Client"
          onAction={searchTerm || statusFilter !== "all" ? undefined : handleAddClient}
          icon="Users"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4"
        >
          {filteredClients.map((client, index) => (
            <motion.div
              key={client.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
<div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {client.Name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
<div className="space-y-1">
                      <h3 className="font-semibold text-gray-900">{client.Name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="Mail" className="h-4 w-4" />
                          <span>{client.email_c}</span>
                        </div>
                        {client.phone_c && (
                          <div className="flex items-center space-x-1">
                            <ApperIcon name="Phone" className="h-4 w-4" />
                            <span>{client.phone_c}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
<div className="text-right">
                      <div className="text-sm text-gray-600">Total Due</div>
                      <div className="font-semibold text-gray-900">
                        ${(client.total_due_c || 0).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Total Paid</div>
                      <div className="font-semibold text-green-600">
                        ${(client.total_paid_c || 0).toLocaleString()}
                      </div>
                    </div>

<Badge variant={getBadgeVariant(client.status_c)}>
                      {client.status_c}
                    </Badge>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="Edit2"
                        onClick={() => handleEditClient(client)}
                      >
                        <span className="sr-only">Edit client</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="Trash2"
                        onClick={() => handleDeleteClient(client)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <span className="sr-only">Delete client</span>
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
        title={selectedClient ? "Edit Client" : "Add Client"}
        size="md"
      >
        <ClientForm
          client={selectedClient}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Clients;