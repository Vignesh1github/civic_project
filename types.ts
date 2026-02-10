export type Role = 'citizen' | 'admin' | null;

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';

export type Priority = 'High' | 'Medium' | 'Low';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface AIAnalysis {
  category: string;
  priority: Priority;
  summary: string;
  suggestedAction: string;
}

export interface Complaint {
  id: string;
  userId: string;
  title: string;
  description: string;
  imageBase64: string | null;
  location: LocationData | null;
  status: ComplaintStatus;
  createdAt: number;
  aiAnalysis?: AIAnalysis;
  adminNotes?: string;
  resolvedImageBase64?: string | null;
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  role: Role;
}
