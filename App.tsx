import React, { useState } from 'react';
import { User, Complaint, Role } from './types';
import CitizenView from './components/CitizenView';
import AdminView from './components/AdminView';
import { MOCK_COMPLAINTS } from './constants';
import { ShieldCheck, User as UserIcon } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [mobileInput, setMobileInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [step, setStep] = useState<'login' | 'otp' | 'app'>('login');
  const [selectedRole, setSelectedRole] = useState<Role>('citizen');

  // Simulated Authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileInput.length === 10) {
      setStep('otp');
    } else {
      alert("Please enter a valid 10-digit mobile number.");
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate OTP verification (any 4 digit code works for demo)
    if (otpInput.length === 4) {
      const user: User = {
        id: selectedRole === 'admin' ? 'admin-1' : 'u-new',
        name: selectedRole === 'admin' ? 'Municipal Officer' : 'Concerned Citizen',
        mobile: mobileInput,
        role: selectedRole
      };
      setCurrentUser(user);
      setStep('app');
    } else {
      alert("Invalid OTP");
    }
  };

  const handleAddComplaint = (newComplaint: Complaint) => {
    setComplaints([newComplaint, ...complaints]);
  };

  const handleUpdateStatus = (id: string, status: Complaint['status']) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setStep('login');
    setMobileInput('');
    setOtpInput('');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-blue-600 p-8 text-center">
            <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
              <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">CivicPulse</h1>
            <p className="text-blue-100 text-sm">Intelligent Grievance Management</p>
          </div>
          
          <div className="p-8">
            {step === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-6">
                
                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div 
                    onClick={() => setSelectedRole('citizen')}
                    className={`cursor-pointer border rounded-lg p-4 text-center transition-all ${selectedRole === 'citizen' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <UserIcon className={`w-6 h-6 mx-auto mb-2 ${selectedRole === 'citizen' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${selectedRole === 'citizen' ? 'text-blue-800' : 'text-gray-600'}`}>Citizen</span>
                  </div>
                  <div 
                    onClick={() => setSelectedRole('admin')}
                    className={`cursor-pointer border rounded-lg p-4 text-center transition-all ${selectedRole === 'admin' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <ShieldCheck className={`w-6 h-6 mx-auto mb-2 ${selectedRole === 'admin' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${selectedRole === 'admin' ? 'text-blue-800' : 'text-gray-600'}`}>Admin</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={mobileInput}
                    onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit number"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    autoFocus
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-blue-600/30"
                >
                  Get OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                 <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">OTP sent to +91 {mobileInput}</p>
                  <button type="button" onClick={() => setStep('login')} className="text-xs text-blue-600 hover:underline">Change Number</button>
                 </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">One Time Password</label>
                  <input
                    type="text"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="Enter 4-digit OTP (1234)"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-center tracking-widest text-lg"
                    autoFocus
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-blue-600/30"
                >
                  Verify & Login
                </button>
              </form>
            )}
            
            <p className="mt-8 text-center text-xs text-gray-400">
              Government of Smart City &copy; 2024
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentUser.role === 'citizen' ? (
        <CitizenView 
          user={currentUser} 
          complaints={complaints} 
          onAddComplaint={handleAddComplaint}
          onLogout={handleLogout}
        />
      ) : (
        <AdminView 
          user={currentUser} 
          complaints={complaints} 
          onUpdateStatus={handleUpdateStatus}
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

export default App;
