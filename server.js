import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
// Increase payload limit for base64 images
app.use(express.json({ limit: '50mb' })); 

// In-Memory Database
// We pre-populate with some data so the admin view isn't empty on first load
let complaints = [
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

// Gemini Setup
const apiKey = process.env.API_KEY;
let ai = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.warn("WARNING: API_KEY is missing in .env file. AI features will use mock responses.");
}

// --- ROUTES ---

// 1. Get all complaints
app.get('/api/complaints', (req, res) => {
  res.json(complaints);
});

// 2. Submit a new complaint (with AI Analysis)
app.post('/api/complaints', async (req, res) => {
  try {
    const { title, description, imageBase64, userId, location } = req.body;

    console.log(`Processing complaint from User: ${userId}`);

    // Default Fallback Analysis
    let analysis = {
      category: 'General',
      priority: 'Medium',
      summary: 'Processing pending...',
      suggestedAction: 'Manual review required'
    };

    // Perform AI Analysis if API key exists
    if (ai) {
      try {
        const parts = [{ text: description }];
        
        // Append image if provided
        if (imageBase64 && imageBase64.includes('base64,')) {
          const cleanBase64 = imageBase64.split(',')[1];
          parts.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          });
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: { parts },
          config: {
            systemInstruction: `You are an intelligent civic grievance assistant. Analyze the user's complaint (text and optional image).
            Categorize the issue into one of: Sanitation, Roads, Water Supply, Electricity, Garbage, Public Transport, Other.
            Assign a priority (High, Medium, Low) based on urgency and public impact.
            Provide a short 1-sentence summary.
            Suggest a short 1-sentence action for the municipal team.`,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                summary: { type: Type.STRING },
                suggestedAction: { type: Type.STRING }
              },
              required: ['category', 'priority', 'summary', 'suggestedAction']
            }
          }
        });

        if (response.text) {
          analysis = JSON.parse(response.text);
        }
      } catch (aiError) {
        console.error("AI Analysis failed:", aiError.message);
        // We continue without crashing, using the default analysis object
      }
    }

    const newComplaint = {
      id: `c-${Date.now()}`,
      userId,
      title,
      description,
      imageBase64,
      location,
      status: 'Pending',
      createdAt: Date.now(),
      aiAnalysis: analysis
    };

    // Add to in-memory store (newest first)
    complaints.unshift(newComplaint); 
    
    res.status(201).json(newComplaint);

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: 'Server error processing complaint' });
  }
});

// 3. Update Status
app.patch('/api/complaints/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const complaint = complaints.find(c => c.id === id);
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  complaint.status = status;
  res.json(complaint);
});

// Start Server
app.listen(PORT, () => {
  console.log(`--------------------------------------------------`);
  console.log(`Backend Server running on http://localhost:${PORT}`);
  console.log(`--------------------------------------------------`);
});