import { Complaint } from "../types";

const API_URL = 'http://localhost:3001/api';

export const api = {
  // Fetch all complaints
  getComplaints: async (): Promise<Complaint[]> => {
    try {
      const response = await fetch(`${API_URL}/complaints`);
      if (!response.ok) throw new Error('Failed to fetch complaints');
      return await response.json();
    } catch (error) {
      console.error("API Error (getComplaints):", error);
      return []; // Return empty array on failure to prevent app crash
    }
  },

  // Submit a new complaint
  createComplaint: async (data: Partial<Complaint>): Promise<Complaint> => {
    const response = await fetch(`${API_URL}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to submit complaint');
    return await response.json();
  },

  // Update status
  updateStatus: async (id: string, status: string): Promise<Complaint> => {
    const response = await fetch(`${API_URL}/complaints/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update status');
    return await response.json();
  }
};