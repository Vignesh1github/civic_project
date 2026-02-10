import React, { useState } from 'react';
import { Complaint, User, LocationData } from '../types';
import { analyzeGrievance } from '../services/geminiService';
import { MapPin, Camera, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CitizenViewProps {
  user: User;
  complaints: Complaint[];
  onAddComplaint: (c: Complaint) => void;
  onLogout: () => void;
}

const CitizenView: React.FC<CitizenViewProps> = ({ user, complaints, onAddComplaint, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'my-complaints'>('report');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const myComplaints = complaints.filter(c => c.userId === user.id).sort((a, b) => b.createdAt - a.createdAt);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
          });
          setIsLocating(false);
        },
        (error) => {
          alert('Unable to retrieve location.');
          setIsLocating(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    
    setIsSubmitting(true);

    try {
      // AI Processing
      const analysis = await analyzeGrievance(description, image);

      const newComplaint: Complaint = {
        id: `c-${Date.now()}`,
        userId: user.id,
        title,
        description,
        imageBase64: image,
        location,
        status: 'Pending',
        createdAt: Date.now(),
        aiAnalysis: analysis
      };

      onAddComplaint(newComplaint);
      
      // Reset Form
      setTitle('');
      setDescription('');
      setImage(null);
      setLocation(null);
      setActiveTab('my-complaints');
    } catch (err) {
      console.error(err);
      alert("Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.name}</h1>
          <p className="text-sm text-gray-500">Intelligent Civic Portal</p>
        </div>
        <button onClick={onLogout} className="text-sm text-red-600 font-medium hover:underline">Logout</button>
      </header>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 bg-white p-1 rounded-lg shadow-sm border border-gray-100">
        <button
          onClick={() => setActiveTab('report')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'report' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Report Grievance
        </button>
        <button
          onClick={() => setActiveTab('my-complaints')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'my-complaints' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          My Complaints
        </button>
      </div>

      {activeTab === 'report' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">New Grievance Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Overflowing Drain"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition h-32 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Image Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition cursor-pointer relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {image ? (
                  <div className="relative w-full h-32">
                    <img src={image} alt="Preview" className="w-full h-full object-cover rounded-md" />
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setImage(null); }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Tap to upload photo</span>
                  </>
                )}
              </div>

              {/* Location */}
              <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50">
                <button
                  type="button"
                  onClick={getLocation}
                  disabled={isLocating}
                  className="flex items-center space-x-2 text-blue-600 font-medium hover:text-blue-700 transition"
                >
                  {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                  <span>{location ? 'Update Location' : 'Detect Location'}</span>
                </button>
                {location && (
                  <p className="mt-2 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                    Lat: {location.latitude.toFixed(4)}, Long: {location.longitude.toFixed(4)}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all flex justify-center items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing with AI...</span>
                </>
              ) : (
                <span>Submit Grievance</span>
              )}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'my-complaints' && (
        <div className="space-y-4">
          {myComplaints.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No complaints filed yet.</p>
            </div>
          ) : (
            myComplaints.map(complaint => (
              <div key={complaint.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  {complaint.imageBase64 ? (
                    <img src={complaint.imageBase64} alt="Proof" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs text-center p-2">No Image</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-800">{complaint.title}</h3>
                      <p className="text-xs text-gray-500">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      complaint.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                      complaint.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {complaint.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{complaint.description}</p>
                  
                  {/* AI Analysis Badge */}
                  {complaint.aiAnalysis && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-md p-2 mt-2">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-xs font-bold text-indigo-700 uppercase">AI Insight</span>
                         <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                           complaint.aiAnalysis.priority === 'High' ? 'border-red-200 bg-red-50 text-red-600' : 
                           'border-gray-200 bg-gray-50 text-gray-600'
                         }`}>Priority: {complaint.aiAnalysis.priority}</span>
                      </div>
                      <p className="text-xs text-indigo-900">{complaint.aiAnalysis.summary}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CitizenView;
