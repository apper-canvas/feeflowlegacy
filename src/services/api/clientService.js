import { toast } from "react-toastify";
import React from "react";

const TABLE_NAME = 'client_c';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

export const clientService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "total_due_c" } },
          { field: { Name: "total_paid_c" } }
        ],
        orderBy: [{ fieldName: "Name", sorttype: "ASC" }],
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
        console.error("Error fetching clients:", error?.response?.data?.message);
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
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "total_due_c" } },
          { field: { Name: "total_paid_c" } }
        ]
      };

      const response = await apperClient.getRecordById(TABLE_NAME, id, params);
      
      if (!response || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching client with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return null;
    }
  },

  async create(clientData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [{
          Name: clientData.Name || clientData.name,
          email_c: clientData.email_c || clientData.email,
          phone_c: clientData.phone_c || clientData.phone,
          status_c: clientData.status_c || clientData.status || "active",
          total_due_c: 0,
          total_paid_c: 0
        }]
      };

      const response = await apperClient.createRecord(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      const successfulRecords = response.results?.filter(result => result.success) || [];
      return successfulRecords.length > 0 ? successfulRecords[0].data : null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating client:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return null;
    }
  },

  async update(id, clientData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [{
          Id: parseInt(id),
          ...(clientData.Name !== undefined && { Name: clientData.Name }),
          ...(clientData.name !== undefined && { Name: clientData.name }),
          ...(clientData.email_c !== undefined && { email_c: clientData.email_c }),
          ...(clientData.email !== undefined && { email_c: clientData.email }),
          ...(clientData.phone_c !== undefined && { phone_c: clientData.phone_c }),
          ...(clientData.phone !== undefined && { phone_c: clientData.phone }),
          ...(clientData.status_c !== undefined && { status_c: clientData.status_c }),
          ...(clientData.status !== undefined && { status_c: clientData.status }),
          ...(clientData.total_due_c !== undefined && { total_due_c: clientData.total_due_c }),
          ...(clientData.totalDue !== undefined && { total_due_c: clientData.totalDue }),
          ...(clientData.total_paid_c !== undefined && { total_paid_c: clientData.total_paid_c }),
          ...(clientData.totalPaid !== undefined && { total_paid_c: clientData.totalPaid })
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
        console.error("Error updating client:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return null;
    }
  },

  async delete(id) {
    try {
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
      return successfulDeletions.length > 0;
    } catch (error) {
if (error?.response?.data?.message) {
        console.error("Error deleting client:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return false;
    }
  }
};