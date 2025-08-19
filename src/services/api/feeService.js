import { toast } from "react-toastify";
import { clientService } from "./clientService.js";

const TABLE_NAME = 'fee_c';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

export const feeService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "client_id_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "note_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "is_recurring_c" } },
          { field: { Name: "status_c" } }
        ],
        orderBy: [{ fieldName: "due_date_c", sorttype: "DESC" }],
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
        console.error("Error fetching fees:", error?.response?.data?.message);
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
          { field: { Name: "client_id_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "note_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "is_recurring_c" } },
          { field: { Name: "status_c" } }
        ]
      };

      const response = await apperClient.getRecordById(TABLE_NAME, id, params);
      
      if (!response || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching fee with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return null;
    }
  },

  async getByClientId(clientId) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "client_id_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "note_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "is_recurring_c" } },
          { field: { Name: "status_c" } }
        ],
        where: [
          { FieldName: "client_id_c", Operator: "EqualTo", Values: [parseInt(clientId)] }
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
        console.error("Error fetching fees by client ID:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return [];
    }
  },

  async create(feeData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [{
          Name: feeData.description_c || feeData.description,
          client_id_c: parseInt(feeData.client_id_c || feeData.clientId),
          description_c: feeData.description_c || feeData.description,
          note_c: feeData.note_c || feeData.note || "",
          amount_c: parseFloat(feeData.amount_c || feeData.amount),
          due_date_c: feeData.due_date_c || feeData.dueDate,
          category_c: feeData.category_c || feeData.category,
          is_recurring_c: feeData.is_recurring_c || feeData.isRecurring || false,
          status_c: "pending"
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
        // Update client totals
        await this.updateClientTotals(params.records[0].client_id_c);
        return successfulRecords[0].data;
      }
      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating fee:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return null;
    }
  },

  async update(id, feeData) {
    try {
      const apperClient = getApperClient();
      
      // Get the current fee to track client changes
      const currentFee = await this.getById(id);
      const oldClientId = currentFee?.client_id_c?.Id || currentFee?.client_id_c;
      
      const params = {
        records: [{
          Id: parseInt(id),
          ...(feeData.Name !== undefined && { Name: feeData.Name }),
          ...(feeData.description_c !== undefined && { Name: feeData.description_c }),
          ...(feeData.description !== undefined && { Name: feeData.description }),
          ...(feeData.client_id_c !== undefined && { client_id_c: parseInt(feeData.client_id_c) }),
          ...(feeData.clientId !== undefined && { client_id_c: parseInt(feeData.clientId) }),
          ...(feeData.description_c !== undefined && { description_c: feeData.description_c }),
          ...(feeData.description !== undefined && { description_c: feeData.description }),
          ...(feeData.note_c !== undefined && { note_c: feeData.note_c }),
          ...(feeData.note !== undefined && { note_c: feeData.note }),
          ...(feeData.amount_c !== undefined && { amount_c: parseFloat(feeData.amount_c) }),
          ...(feeData.amount !== undefined && { amount_c: parseFloat(feeData.amount) }),
          ...(feeData.due_date_c !== undefined && { due_date_c: feeData.due_date_c }),
          ...(feeData.dueDate !== undefined && { due_date_c: feeData.dueDate }),
          ...(feeData.category_c !== undefined && { category_c: feeData.category_c }),
          ...(feeData.category !== undefined && { category_c: feeData.category }),
          ...(feeData.is_recurring_c !== undefined && { is_recurring_c: feeData.is_recurring_c }),
          ...(feeData.isRecurring !== undefined && { is_recurring_c: feeData.isRecurring }),
          ...(feeData.status_c !== undefined && { status_c: feeData.status_c }),
          ...(feeData.status !== undefined && { status_c: feeData.status })
        }]
      };

      const response = await apperClient.updateRecord(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      const successfulRecords = response.results?.filter(result => result.success) || [];
      if (successfulRecords.length > 0) {
        const newClientId = params.records[0].client_id_c;
        
        // Update client totals for old client
        if (oldClientId) {
          await this.updateClientTotals(oldClientId);
        }
        
        // Update client totals for new client if changed
        if (newClientId && newClientId !== oldClientId) {
          await this.updateClientTotals(newClientId);
        }
        
        return successfulRecords[0].data;
      }
      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating fee:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return null;
    }
  },

  async delete(id) {
    try {
      // Get the fee before deletion to update client totals
      const fee = await this.getById(id);
      const clientId = fee?.client_id_c?.Id || fee?.client_id_c;
      
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
      if (successfulDeletions.length > 0 && clientId) {
        await this.updateClientTotals(clientId);
      }
      
      return successfulDeletions.length > 0;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting fee:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return false;
    }
  },

  async updateClientTotals(clientId) {
    try {
      const clientFees = await this.getByClientId(clientId);
      const totalDue = clientFees
        .filter(f => (f.status_c === "pending" || f.status_c === "overdue"))
        .reduce((sum, f) => sum + (f.amount_c || 0), 0);
      const totalPaid = clientFees
        .filter(f => f.status_c === "paid")
        .reduce((sum, f) => sum + (f.amount_c || 0), 0);
      
      await clientService.update(clientId, { total_due_c: totalDue, total_paid_c: totalPaid });
    } catch (error) {
      console.error("Error updating client totals:", error);
    }
  }
};