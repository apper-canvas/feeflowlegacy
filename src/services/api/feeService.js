import feesData from "@/services/mockData/fees.json";
import { clientService } from "./clientService.js";

let fees = [...feesData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const feeService = {
  async getAll() {
    await delay(300);
    return fees.map(fee => ({ ...fee }));
  },

  async getById(id) {
    await delay(200);
    const fee = fees.find(f => f.Id === parseInt(id));
    return fee ? { ...fee } : null;
  },

  async getByClientId(clientId) {
    await delay(250);
    return fees.filter(f => f.clientId === parseInt(clientId)).map(fee => ({ ...fee }));
  },

  async create(feeData) {
    await delay(400);
    const newFee = {
      ...feeData,
      Id: Math.max(...fees.map(f => f.Id)) + 1,
      status: "pending"
    };
    fees.push(newFee);
    
    // Update client totals
    await this.updateClientTotals(newFee.clientId);
    
    return { ...newFee };
  },

  async update(id, feeData) {
    await delay(400);
    const index = fees.findIndex(f => f.Id === parseInt(id));
    if (index !== -1) {
      const oldClientId = fees[index].clientId;
      fees[index] = { ...fees[index], ...feeData };
      
      // Update client totals for both old and new client if changed
      await this.updateClientTotals(oldClientId);
      if (feeData.clientId && feeData.clientId !== oldClientId) {
        await this.updateClientTotals(feeData.clientId);
      }
      
      return { ...fees[index] };
    }
    return null;
  },

  async delete(id) {
    await delay(300);
    const index = fees.findIndex(f => f.Id === parseInt(id));
    if (index !== -1) {
      const deleted = fees.splice(index, 1)[0];
      await this.updateClientTotals(deleted.clientId);
      return { ...deleted };
    }
    return null;
  },

  async updateClientTotals(clientId) {
    const clientFees = fees.filter(f => f.clientId === parseInt(clientId));
    const totalDue = clientFees
      .filter(f => f.status === "pending" || f.status === "overdue")
      .reduce((sum, f) => sum + f.amount, 0);
    const totalPaid = clientFees
      .filter(f => f.status === "paid")
      .reduce((sum, f) => sum + f.amount, 0);
    
    await clientService.update(clientId, { totalDue, totalPaid });
  }
};