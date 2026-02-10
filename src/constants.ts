import { Complaint } from './types';

export const COMPLAINT_CATEGORIES = [
  'Sanitation',
  'Roads & Potholes',
  'Water Supply',
  'Electricity/Streetlights',
  'Garbage Collection',
  'Public Transport',
  'Other'
];

export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'c-101',
    userId: 'u-1',
    title: 'Overflowing Garbage Bin',
    description: 'The garbage bin near the central park entrance has been overflowing for 3 days. Bad smell.',
    imageBase64: null, 
    location: { latitude: 28.6139, longitude: 77.2090, address: 'Central Park Gate 2' },
    status: 'Pending',
    createdAt: Date.now() - 86400000 * 2,
    aiAnalysis: {
      category: 'Garbage Collection',
      priority: 'High',
      summary: 'Reports of overflowing garbage causing hygiene issues.',
      suggestedAction: 'Dispatch sanitation truck immediately.'
    }
  },
  {
    id: 'c-102',
    userId: 'u-2',
    title: 'Broken Streetlight',
    description: 'Streetlight pole #45 is flickering and mostly off at night.',
    imageBase64: null,
    location: { latitude: 28.6239, longitude: 77.2190, address: 'Market Road, Sector 4' },
    status: 'In Progress',
    createdAt: Date.now() - 86400000 * 5,
    aiAnalysis: {
      category: 'Electricity/Streetlights',
      priority: 'Medium',
      summary: 'Faulty street lighting reported affecting visibility.',
      suggestedAction: 'Assign electrical maintenance crew.'
    }
  }
];