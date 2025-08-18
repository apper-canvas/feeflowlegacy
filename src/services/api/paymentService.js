import paymentsData from "@/services/mockData/payments.json";
import { feeService } from "./feeService.js";

let payments = [...paymentsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const paymentService = {
  async getAll() {
    await delay(300);
    return payments.map(payment => ({ ...payment }));
  },

  async getById(id) {
    await delay(200);
    const payment = payments.find(p => p.Id === parseInt(id));
    return payment ? { ...payment } : null;
  },

  async getByFeeId(feeId) {
    await delay(250);
    return payments.filter(p => p.feeId === parseInt(feeId)).map(payment => ({ ...payment }));
  },

  async create(paymentData) {
    await delay(400);
    const newPayment = {
      ...paymentData,
      Id: Math.max(...payments.map(p => p.Id)) + 1,
      paymentDate: paymentData.paymentDate || new Date().toISOString().split("T")[0]
    };
    payments.push(newPayment);
    
    // Update fee status to paid
    await feeService.update(newPayment.feeId, { status: "paid" });
    
    return { ...newPayment };
  },

  async update(id, paymentData) {
    await delay(400);
    const index = payments.findIndex(p => p.Id === parseInt(id));
    if (index !== -1) {
      payments[index] = { ...payments[index], ...paymentData };
      return { ...payments[index] };
    }
    return null;
  },

  async delete(id) {
    await delay(300);
    const index = payments.findIndex(p => p.Id === parseInt(id));
    if (index !== -1) {
      const deleted = payments.splice(index, 1)[0];
      // Update fee status back to pending
      await feeService.update(deleted.feeId, { status: "pending" });
      return { ...deleted };
    }
    return null;
  }
};