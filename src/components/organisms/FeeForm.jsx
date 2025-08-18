import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import FormField from "@/components/molecules/FormField";
import { feeService } from "@/services/api/feeService";
import { clientService } from "@/services/api/clientService";

const FeeForm = ({ fee, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    clientId: "",
    description: "",
    amount: "",
    dueDate: "",
    category: "Consulting",
    isRecurring: false
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (fee) {
      setFormData({
        clientId: fee.clientId?.toString() || "",
        description: fee.description || "",
        amount: fee.amount?.toString() || "",
        dueDate: fee.dueDate || "",
        category: fee.category || "Consulting",
        isRecurring: fee.isRecurring || false
      });
    }
  }, [fee]);

  const loadClients = async () => {
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (error) {
      toast.error("Failed to load clients");
      console.error("Error loading clients:", error);
    } finally {
      setLoadingClients(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.clientId) {
      newErrors.clientId = "Client is required";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    
    if (!formData.amount) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be a positive number";
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const feeData = {
        ...formData,
        clientId: parseInt(formData.clientId),
        amount: parseFloat(formData.amount)
      };

      if (fee) {
        await feeService.update(fee.Id, feeData);
        toast.success("Fee updated successfully!");
      } else {
        await feeService.create(feeData);
        toast.success("Fee created successfully!");
      }
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to save fee");
      console.error("Error saving fee:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Client"
        required
        error={errors.clientId}
      >
        <Select
          name="clientId"
          value={formData.clientId}
          onChange={handleChange}
          error={errors.clientId}
          disabled={loadingClients}
        >
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.Id} value={client.Id}>
              {client.name}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField
        label="Description"
        required
        error={errors.description}
      >
        <Input
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Fee description"
          error={errors.description}
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Amount"
          required
          error={errors.amount}
        >
          <Input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            error={errors.amount}
          />
        </FormField>

        <FormField
          label="Due Date"
          required
          error={errors.dueDate}
        >
          <Input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            error={errors.dueDate}
          />
        </FormField>
      </div>

      <FormField
        label="Category"
      >
        <Select
          name="category"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="Consulting">Consulting</option>
          <option value="License">License</option>
          <option value="Setup">Setup</option>
          <option value="Training">Training</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Design">Design</option>
          <option value="Support">Support</option>
          <option value="Other">Other</option>
        </Select>
      </FormField>

      <FormField>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isRecurring"
            checked={formData.isRecurring}
            onChange={handleChange}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-700">Recurring Fee</span>
        </label>
      </FormField>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          {fee ? "Update Fee" : "Create Fee"}
        </Button>
      </div>
    </form>
  );
};

export default FeeForm;