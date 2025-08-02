import React from 'react';
import { Eye, Building2, Phone, MapPin, Star, Calendar, CheckCircle, XCircle, Users } from 'lucide-react';

interface User {
  id: number;
  name: string;
  hotelName: string;
  email: string;
  phone: string;
  address: string;
  registeredDate: string;
  stars: number;
  rejectionReason?: string;
}

interface UserListProps {
  users: User[];
  title: string;
  description: string;
  type: 'approved' | 'rejected' | 'all';
  onViewDetails: (user: User) => void;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  title,
  description,
  type,
  onViewDetails
}) => {
  const getStatusIcon = () => {
    switch (type) {
      case 'approved':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Users className="h-6 w-6 text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    switch (type) {
      case 'approved':
        return 'bg-green-50 text-green-700';
      case 'rejected':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-blue-50 text-blue-700';
    }
  };

  if (users.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          {getStatusIcon()}
          <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">No Users Found</h3>
          <p className="text-gray-500">No users in this category yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-sm font-medium">{users.length} users</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hotel
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration
                </th>
                {type === 'rejected' && (
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                )}
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.hotelName}</div>
                        <div className="flex items-center">
                          {Array.from({ length: user.stars }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 text-gray-400 mr-2" />
                        {user.phone}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 text-gray-400 mr-2" />
                        <span className="truncate max-w-xs">{user.address}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      {new Date(user.registeredDate).toLocaleDateString()}
                    </div>
                  </td>
                  {type === 'rejected' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {user.rejectionReason || 'No reason provided'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onViewDetails(user)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm rounded-lg text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};