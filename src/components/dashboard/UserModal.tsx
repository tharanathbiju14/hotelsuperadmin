import React from 'react';
import { X, Building2, Phone, MapPin, Star, Calendar, Mail, XCircle } from 'lucide-react';

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

interface UserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Hotel Registration Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
                <p className="text-gray-600 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {user.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <Building2 className="h-5 w-5 text-gray-500" />
                    <p className="text-sm font-medium text-gray-500">Hotel Information</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{user.hotelName}</p>
                  <div className="flex items-center mt-2">
                    {Array.from({ length: user.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">{user.stars} star rating</span>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <p className="text-sm font-medium text-gray-500">Contact Number</p>
                  </div>
                  <p className="text-gray-900 font-medium">{user.phone}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <p className="text-sm font-medium text-gray-500">Address</p>
                  </div>
                  <p className="text-gray-900">{user.address}</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <p className="text-sm font-medium text-gray-500">Registration Date</p>
                  </div>
                  <p className="text-gray-900 font-medium">
                    {new Date(user.registeredDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {user.rejectionReason && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <p className="text-sm font-medium text-red-700">Rejection Reason</p>
                    </div>
                    <p className="text-red-800">{user.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Additional Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">User ID:</span>
                  <span className="ml-2 text-blue-900 font-medium">#{user.id}</span>
                </div>
                <div>
                  <span className="text-blue-700">Status:</span>
                  <span className="ml-2 text-blue-900 font-medium">
                    {user.rejectionReason ? 'Rejected' : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};