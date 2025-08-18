import clientsData from "@/services/mockData/clients.json";

let clients = [...clientsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const clientService = {
  async getAll() {
    await delay(300);
    return clients.map(client => ({ ...client }));
  },

  async getById(id) {
    await delay(200);
    const client = clients.find(c => c.Id === parseInt(id));
    return client ? { ...client } : null;
  },

  async create(clientData) {
    await delay(400);
    const newClient = {
      ...clientData,
      Id: Math.max(...clients.map(c => c.Id)) + 1,
      totalDue: 0,
      totalPaid: 0,
      status: "active"
    };
    clients.push(newClient);
    return { ...newClient };
  },

  async update(id, clientData) {
    await delay(400);
    const index = clients.findIndex(c => c.Id === parseInt(id));
    if (index !== -1) {
      clients[index] = { ...clients[index], ...clientData };
      return { ...clients[index] };
    }
    return null;
  },

  async delete(id) {
    await delay(300);
    const index = clients.findIndex(c => c.Id === parseInt(id));
    if (index !== -1) {
      const deleted = clients.splice(index, 1)[0];
      return { ...deleted };
    }
    return null;
  }
};