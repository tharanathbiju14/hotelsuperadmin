import React from 'react';
import { 
  LayoutDashboard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  LogOut,
  Shield,
  Image,
  UserCheck,
  Building2
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, onLogout }) => {
  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'pending', label: 'Pending Approvals', icon: Clock },
    { id: 'approved-admins', label: 'Approved Admins', icon: UserCheck },
    { id: 'hotel-management', label: 'Hotel Management', icon: Building2 },
    // { id: 'approved', label: 'Approved admins', icon: CheckCircle },
    // { id: 'all-users', label: 'All admins', icon: Users },
    { id: 'carousel', label: 'Update Carousel', icon: Image },
  ];

  return (
    <div className="bg-white h-screen w-64 shadow-lg flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">SuperAdmin</h1>
            <p className="text-xs text-gray-500">Hotel Management</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">A</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">admin@hotel.com</p>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center px-4 py-2 text-left text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
        >
          <LogOut className="h-4 w-4 mr-3" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};