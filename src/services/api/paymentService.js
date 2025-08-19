import { toast } from "react-toastify";
import { feeService } from "./feeService.js";

const TABLE_NAME = 'payment_c';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

export const paymentService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "fee_id_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "payment_date_c" } },
          { field: { Name: "method_c" } },
          { field: { Name: "reference_c" } }
        ],
        orderBy: [{ fieldName: "payment_date_c", sorttype: "DESC" }],
        pagingInfo: { limit: 100, offset: 0 }
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching payments:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "fee_id_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "payment_date_c" } },
          { field: { Name: "method_c" } },
          { field: { Name: "reference_c" } }
        ]
      };

      const response = await apperClient.getRecordById(TABLE_NAME, id, params);
      
      if (!response || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching payment with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return null;
    }
  },

  async getByFeeId(feeId) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "fee_id_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "payment_date_c" } },
          { field: { Name: "method_c" } },
          { field: { Name: "reference_c" } }
        ],
        where: [
          { FieldName: "fee_id_c", Operator: "EqualTo", Values: [parseInt(feeId)] }
        ],
        pagingInfo: { limit: 100, offset: 0 }
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching payments by fee ID:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return [];
    }
  },

  async create(paymentData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [{
          Name: `Payment for Fee ${paymentData.fee_id_c || paymentData.feeId}`,
          fee_id_c: parseInt(paymentData.fee_id_c || paymentData.feeId),
          amount_c: parseFloat(paymentData.amount_c || paymentData.amount),
          payment_date_c: paymentData.payment_date_c || paymentData.paymentDate || new Date().toISOString().split("T")[0],
          method_c: paymentData.method_c || paymentData.method || "Bank Transfer",
          reference_c: paymentData.reference_c || paymentData.reference || ""
        }]
      };

      const response = await apperClient.createRecord(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      const successfulRecords = response.results?.filter(result => result.success) || [];
      if (successfulRecords.length > 0) {
        // Update fee status to paid
        const feeId = params.records[0].fee_id_c;
        await feeService.update(feeId, { status_c: "paid" });
        
        return successfulRecords[0].data;
      }
      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating payment:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return null;
    }
  },

  async update(id, paymentData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [{
          Id: parseInt(id),
          ...(paymentData.Name !== undefined && { Name: paymentData.Name }),
          ...(paymentData.fee_id_c !== undefined && { fee_id_c: parseInt(paymentData.fee_id_c) }),
          ...(paymentData.feeId !== undefined && { fee_id_c: parseInt(paymentData.feeId) }),
          ...(paymentData.amount_c !== undefined && { amount_c: parseFloat(paymentData.amount_c) }),
          ...(paymentData.amount !== undefined && { amount_c: parseFloat(paymentData.amount) }),
          ...(paymentData.payment_date_c !== undefined && { payment_date_c: paymentData.payment_date_c }),
          ...(paymentData.paymentDate !== undefined && { payment_date_c: paymentData.paymentDate }),
          ...(paymentData.method_c !== undefined && { method_c: paymentData.method_c }),
          ...(paymentData.method !== undefined && { method_c: paymentData.method }),
          ...(paymentData.reference_c !== undefined && { reference_c: paymentData.reference_c }),
          ...(paymentData.reference !== undefined && { reference_c: paymentData.reference })
        }]
      };

      const response = await apperClient.updateRecord(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      const successfulRecords = response.results?.filter(result => result.success) || [];
      return successfulRecords.length > 0 ? successfulRecords[0].data : null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating payment:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return null;
    }
  },

  async delete(id) {
    try {
      // Get the payment before deletion to update fee status
      const payment = await this.getById(id);
      const feeId = payment?.fee_id_c?.Id || payment?.fee_id_c;
      
      const apperClient = getApperClient();
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      const successfulDeletions = response.results?.filter(result => result.success) || [];
      if (successfulDeletions.length > 0 && feeId) {
        // Update fee status back to pending
        await feeService.update(feeId, { status_c: "pending" });
      }
      
      return successfulDeletions.length > 0;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting payment:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return false;
    }
  }
};