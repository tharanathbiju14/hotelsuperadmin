import React, { useEffect, useState } from 'react';
import { CheckCircle, Eye, Phone, Mail, User, Calendar } from 'lucide-react';
import { AdminDetailsModal } from './AdminDetailsModal';

interface ApprovedAdmin {
  adminId: number;
  adminName: string;
  adminEmail: string;
  adminPhoneNumber: string;
  approvedDate?: string;
}

interface ApprovedAdminsProps {
  // We'll handle the modal internally now
}

const BASE_URL = 'http://192.168.1.14:8080';

export const ApprovedAdmins: React.FC<ApprovedAdminsProps> = () => {
  const [admins, setAdmins] = useState<ApprovedAdmin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<ApprovedAdmin | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleViewDetails = (admin: ApprovedAdmin) => {
    setSelectedAdmin(admin);
    setShowModal(true);
  };

  useEffect(() => {
    const fetchApprovedAdmins = async () => {
      const token = sessionStorage.getItem('token');
      const url = `${BASE_URL}/hotel/super-admin/approved-admins`;

      console.group('API Call: Fetch Approved Admins');
      console.log(`[1/4] Initiating API call to: ${url}`);
      console.log(`  > Using token: ${token ? 'Found' : 'Not Found'}`);

      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('[2/4] Received raw response. Status:', response.status, response.statusText);

        if (!response.ok) {
          console.warn('  > Response was not successful (status not 2xx).');
          const errorText = await response.text();
          console.log('  > Error response body:', errorText);
          setError(`Failed to fetch approved admins: ${response.status} ${response.statusText}`);
          setLoading(false);
          console.groupEnd();
          return;
        }

        const data = await response.json();
        console.log('[3/4] Parsed JSON data:', data);

        // Handle different response formats
        let processedData: ApprovedAdmin[] = [];
        
        if (Array.isArray(data)) {
          console.log(`  > Data is an array with ${data.length} items`);
          processedData = data;
        } else if (data && typeof data === 'object') {
          console.log('  > Data is an object, converting to array format');
          console.log('  > Object properties:', Object.keys(data));
          
          // If it's a single object with admin properties, wrap it in an array
          if (data.adminId || data.adminEmail || data.adminName) {
            console.log('  > Detected single admin object, wrapping in array');
            processedData = [data];
          } else {
            console.warn('  > Object does not contain expected admin properties');
            processedData = [];
          }
        } else {
          console.warn('  > Received data is neither array nor object. Setting state to empty array.');
          processedData = [];
        }

        console.log(`[4/4] Setting ${processedData.length} approved admins in state:`, processedData);
        setAdmins(processedData);
        setError(null);
        setLoading(false);
        console.groupEnd();

      } catch (err) {
        console.error('[FAILED] Error fetching approved admins:', err);
        console.log('  > Error details:', {
          message: err.message,
          stack: err.stack
        });
        setError('Network error. Please try again.');
        setLoading(false);
        setAdmins([]);
        console.groupEnd();
      }
    };

    fetchApprovedAdmins();
  }, []);

  if (loading) {
    console.log("Component Status: Rendering 'Loading...' view.");
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Approved Admins</h1>
          <p className="text-gray-600">View all approved hotel administrators</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gray-300 animate-pulse" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
          <p className="text-gray-500">Fetching approved admins...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log("Component Status: Rendering error view.");
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Approved Admins</h1>
          <p className="text-gray-600">View all approved hotel administrators</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-red-500 mb-4">
            <CheckCircle className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (admins.length === 0) {
    console.log("Component Status: Rendering 'No Approved Admins' view.");
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Approved Admins</h1>
          <p className="text-gray-600">View all approved hotel administrators</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Admins</h3>
          <p className="text-gray-500">No administrators have been approved yet</p>
        </div>
      </div>
    );
  }

  console.log(`Component Status: Rendering table with ${admins.length} approved admins.`);
  console.log('Approved admins data:', admins);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Approved Admins</h1>
          <p className="text-gray-600">View all approved hotel administrators</p>
        </div>
        <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-sm font-medium text-green-700">{admins.length} approved</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.adminId} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {admin.adminName ? admin.adminName.charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          ID: {admin.adminId}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {admin.adminName || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">
                        {admin.adminEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">
                        {admin.adminPhoneNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approved
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(admin)}
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

      <AdminDetailsModal
        admin={selectedAdmin}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};