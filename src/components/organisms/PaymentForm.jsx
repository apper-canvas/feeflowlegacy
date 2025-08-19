import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { paymentService } from "@/services/api/paymentService";
import { feeService } from "@/services/api/feeService";
import { clientService } from "@/services/api/clientService";
import FormField from "@/components/molecules/FormField";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Select from "@/components/atoms/Select";

const PaymentForm = ({ payment, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
feeId: "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    method: "Bank Transfer",
    reference: ""
  });
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFees, setLoadingFees] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadUnpaidFees();
  }, []);

  useEffect(() => {
    if (payment) {
setFormData({
        feeId: (payment.fee_id_c?.Id || payment.fee_id_c)?.toString() || "",
        amount: payment.amount_c?.toString() || "",
        paymentDate: payment.payment_date_c || new Date().toISOString().split("T")[0],
        method: payment.method_c || "Bank Transfer",
        reference: payment.reference_c || ""
      });
    }
  }, [payment]);

  const loadUnpaidFees = async () => {
    try {
      const [feesData, clientsData] = await Promise.all([
        feeService.getAll(),
        clientService.getAll()
      ]);
      
const unpaidFees = feesData
        .filter(fee => fee.status_c === "pending" || fee.status_c === "overdue")
        .map(fee => {
          const client = clientsData.find(c => c.Id === (fee.client_id_c?.Id || fee.client_id_c));
          return {
            ...fee,
            clientName: client ? client.Name : "Unknown Client"
          };
        });
      
      setFees(unpaidFees);
    } catch (error) {
      toast.error("Failed to load fees");
      console.error("Error loading fees:", error);
    } finally {
      setLoadingFees(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.feeId) {
      newErrors.feeId = "Fee is required";
    }
    
    if (!formData.amount) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be a positive number";
    }
    
    if (!formData.paymentDate) {
      newErrors.paymentDate = "Payment date is required";
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
      const paymentData = {
        fee_id_c: parseInt(formData.feeId),
        amount_c: parseFloat(formData.amount),
        payment_date_c: formData.paymentDate,
        method_c: formData.method,
        reference_c: formData.reference,
        feeId: parseInt(formData.feeId),
        amount: parseFloat(formData.amount)
      };

      if (payment) {
        await paymentService.update(payment.Id, paymentData);
        toast.success("Payment updated successfully!");
      } else {
        await paymentService.create(paymentData);
        toast.success("Payment recorded successfully!");
      }
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to save payment");
      console.error("Error saving payment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-fill amount when fee is selected
if (name === "feeId" && value) {
      const selectedFee = fees.find(f => f.Id === parseInt(value));
      if (selectedFee) {
        setFormData(prev => ({ ...prev, amount: selectedFee.amount_c?.toString() || "" }));
      }
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Fee"
        required
        error={errors.feeId}
      >
        <Select
          name="feeId"
          value={formData.feeId}
          onChange={handleChange}
          error={errors.feeId}
          disabled={loadingFees}
        >
          <option value="">Select a fee</option>
{fees.map((fee) => (
            <option key={fee.Id} value={fee.Id}>
              {fee.clientName} - {fee.description_c} (${fee.amount_c})
            </option>
          ))}
        </Select>
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
          label="Payment Date"
          required
          error={errors.paymentDate}
        >
          <Input
            type="date"
            name="paymentDate"
            value={formData.paymentDate}
            onChange={handleChange}
            error={errors.paymentDate}
          />
        </FormField>
      </div>

      <FormField
        label="Payment Method"
      >
        <Select
          name="method"
          value={formData.method}
          onChange={handleChange}
        >
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Credit Card">Credit Card</option>
          <option value="Check">Check</option>
          <option value="Cash">Cash</option>
          <option value="PayPal">PayPal</option>
          <option value="Other">Other</option>
        </Select>
      </FormField>

      <FormField
        label="Reference Number"
      >
        <Input
          name="reference"
          value={formData.reference}
          onChange={handleChange}
          placeholder="TXN-2024-001"
        />
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
          {payment ? "Update Payment" : "Record Payment"}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;