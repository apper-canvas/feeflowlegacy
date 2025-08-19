import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import FormField from "@/components/molecules/FormField";
import { clientService } from "@/services/api/clientService";

const ClientForm = ({ client, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "active"
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (client) {
setFormData({
        name: client.Name || "",
        email: client.email_c || "",
        phone: client.phone_c || "",
        status: client.status_c || "active"
      });
    }
  }, [client]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Client name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
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
      if (client) {
await clientService.update(client.Id, {
          Name: formData.name,
          email_c: formData.email,
          phone_c: formData.phone,
          status_c: formData.status
        });
        toast.success("Client updated successfully!");
      } else {
        await clientService.create(formData);
        toast.success("Client created successfully!");
      }
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to save client");
      console.error("Error saving client:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Client Name"
        required
        error={errors.name}
      >
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter client name"
          error={errors.name}
        />
      </FormField>

      <FormField
        label="Email Address"
        required
        error={errors.email}
      >
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="client@example.com"
          error={errors.email}
        />
      </FormField>

      <FormField
        label="Phone Number"
        error={errors.phone}
      >
        <Input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="(555) 123-4567"
        />
      </FormField>

      <FormField
        label="Status"
      >
        <Select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
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
          {client ? "Update Client" : "Create Client"}
        </Button>
      </div>
    </form>
  );
};

export default ClientForm;