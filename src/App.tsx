import React, { useState } from 'react';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { Sidebar } from './components/dashboard/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { PendingApprovals } from './components/dashboard/PendingApprovals';
import { ApprovedAdmins } from './components/dashboard/ApprovedAdmins';
import { UserList } from './components/dashboard/UserList';
import { UserModal } from './components/dashboard/UserModal';
import { CarouselManager } from './components/dashboard/CarouselManager';
import HotelManagement from './components/dashboard/hotelmanagement';
import { Hotel, Amenity } from './App';

// Mock data for demonstration
const mockData = {
  pendingUsers: [
    { id: 1, name: 'John Smith', hotelName: 'Grand Plaza Hotel', email: 'john@grandplaza.com', phone: '+1234567890', address: '123 Main St, NYC', registeredDate: '2024-01-15', stars: 4 },
    { id: 2, name: 'Sarah Johnson', hotelName: 'Ocean View Resort', email: 'sarah@oceanview.com', phone: '+1234567891', address: '456 Beach Ave, Miami', registeredDate: '2024-01-16', stars: 5 },
    { id: 3, name: 'Mike Chen', hotelName: 'Mountain Lodge', email: 'mike@mountainlodge.com', phone: '+1234567892', address: '789 Peak Rd, Denver', registeredDate: '2024-01-17', stars: 3 }
  ],
  approvedUsers: [
    { id: 4, name: 'Lisa Brown', hotelName: 'City Center Hotel', email: 'lisa@citycenter.com', phone: '+1234567893', address: '321 Urban St, LA', registeredDate: '2024-01-10', stars: 4 },
    { id: 5, name: 'David Wilson', hotelName: 'Luxury Suites', email: 'david@luxurysuites.com', phone: '+1234567894', address: '654 Elite Ave, SF', registeredDate: '2024-01-12', stars: 5 }
  ],
  rejectedUsers: [
    { id: 6, name: 'Tom Anderson', hotelName: 'Budget Inn', email: 'tom@budgetinn.com', phone: '+1234567895', address: '987 Cheap St, Vegas', registeredDate: '2024-01-08', stars: 2, rejectionReason: 'Incomplete documentation' }
  ]
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeSection, setActiveSection] = useState('overview');
  const [users, setUsers] = useState(mockData);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);

  const handleLogin = (email: string, password: string) => {
    // Simple validation - in real app, this would be API call
    if (email && password) {
      setIsAuthenticated(true);
    }
  };

  const handleSignup = (name: string, email: string, password: string) => {
    // Simple validation - in real app, this would be API call
    if (name && email && password) {
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveSection('overview');
  };

  const handleApprove = (userId: number) => {
    const userToApprove = users.pendingUsers.find(user => user.id === userId);
    if (userToApprove) {
      setUsers(prev => ({
        ...prev,
        pendingUsers: prev.pendingUsers.filter(user => user.id !== userId),
        approvedUsers: [...prev.approvedUsers, userToApprove]
      }));
    }
  };

  const handleReject = (userId: number) => {
    const userToReject = users.pendingUsers.find(user => user.id === userId);
    if (userToReject) {
      setUsers(prev => ({
        ...prev,
        pendingUsers: prev.pendingUsers.filter(user => user.id !== userId),
        rejectedUsers: [...prev.rejectedUsers, { ...userToReject, rejectionReason: 'Admin decision' }]
      }));
    }
  };

  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const renderContent = () => {
    const stats = {
      approved: users.approvedUsers.length,
      pending: users.pendingUsers.length,
      rejected: users.rejectedUsers.length
    };

    switch (activeSection) {
      case 'overview':
        return <DashboardOverview stats={stats} />;
      case 'pending':
        return (
          <PendingApprovals
            onViewDetails={handleViewDetails}
          />
        );
      case 'approved-admins':
        return <ApprovedAdmins />;
      case 'hotel-management':
        return <HotelManagement
          amenities={amenities}
          onHotelUpdate={(id, updatedHotel) => {
            setHotels(hotels.map(h => h.id === id ? { ...h, ...updatedHotel } : h));
          } }
          onBack={() => setActiveSection('overview')} />;
      case 'approved':
        return (
          <UserList
            users={users.approvedUsers}
            title="Approved Users"
            description="Hotels that have been approved and are active"
            type="approved"
            onViewDetails={handleViewDetails}
          />
        );
      case 'all-users':
        return (
          <UserList
            users={[...users.approvedUsers]}
            title="All Registered Users"
            description="Complete list of all hotel registrations"
            type="all"
            onViewDetails={handleViewDetails}
          />
        );
      case 'carousel':
        return <CarouselManager />;
      default:
        return <DashboardOverview stats={stats} />;
    }
  };

  if (!isAuthenticated) {
    if (authMode === 'login') {
      return (
        <LoginForm
          onLogin={handleLogin}
          onSwitchToSignup={() => setAuthMode('signup')}
        />
      );
    } else {
      return (
        <SignupForm
          onSignup={handleSignup}
          onSwitchToLogin={() => setAuthMode('login')}
        />
      );
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>

      <UserModal
        user={selectedUser}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}

export default App;