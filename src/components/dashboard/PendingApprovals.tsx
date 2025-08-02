import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, Eye, Phone } from 'lucide-react';

interface User {
  adminId: number;
  adminName: string;
  adminEmail: string;
  adminPhoneNumber: string;
  hotelName?: string;
  address?: string;
  registeredDate?: string;
  stars?: number;
}

interface PendingApprovalsProps {
  onViewDetails: (user: User) => void;
}

const BASE_URL = 'http://192.168.1.4:8080';

export const PendingApprovals: React.FC<PendingApprovalsProps> = ({
  onViewDetails
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const url = `${BASE_URL}/hotel/super-admin/pending-request`;

    console.group('API Call: Fetch Pending Requests');
    console.log(`[1/4] Initiating API call to: ${url}`);
    console.log(`  > Using token: ${token ? 'Found' : 'Not Found'}`);

    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        console.log('[2/4] Received raw response. Status:', res.status, res.statusText);
        if (!res.ok) {
          console.warn('  > Response was not successful (status not 2xx).');
        }
        return res.json();
      })
      .then(data => {
        console.log('[3/4] Parsed JSON data:', data);
        
        // Handle different response formats
        let processedData: User[] = [];
        
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
        
        console.log(`[4/4] Setting ${processedData.length} users in state:`, processedData);
        setUsers(processedData);
        setLoading(false);
        console.groupEnd();
      })
      .catch((err) => {
        console.error('[FAILED] Error fetching pending requests:', err);
        console.log('  > Error details:', {
          message: err.message,
          stack: err.stack
        });
        setLoading(false);
        setUsers([]);
        console.groupEnd();
      });
  }, []);

  const handleApprove = async (userId: number) => {
    const token = sessionStorage.getItem('token');
    const url = `${BASE_URL}/hotel/super-admin/approve-admin?adminId=${userId}`;

    console.group(`API Call: Approve User ID ${userId}`);
    console.log(`[1/5] Initiating API call to: ${url}`);
    console.log(`  > Using token: ${token ? 'Found' : 'Not Found'}`);
    console.log(`  > Request method: POST with adminId as query parameter`);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('[2/5] Received raw response. Status:', res.status, res.statusText);
      console.log('  > Response headers:', Object.fromEntries(res.headers.entries()));

      if (!res.ok) {
        console.warn('  > Approval response was not successful (status not 2xx).');
        const errorText = await res.text();
        console.log('  > Error response body:', errorText);
        console.groupEnd();
        return;
      }

      // Check if response has content before trying to parse JSON
      const contentType = res.headers.get('content-type');
      let data = null;
      
      if (contentType && contentType.includes('application/json')) {
        const responseText = await res.text();
        console.log('[3/5] Raw response text:', responseText);
        
        if (responseText.trim()) {
          try {
            data = JSON.parse(responseText);
            console.log('[3/5] Parsed JSON response:', data);
          } catch (parseError) {
            console.warn('  > Failed to parse JSON, treating as text:', parseError);
            data = responseText;
          }
        } else {
          console.log('[3/5] Empty response body (successful operation)');
          data = { success: true };
        }
      } else {
        const responseText = await res.text();
        console.log('[3/5] Non-JSON response:', responseText);
        data = { success: true, message: responseText };
      }

      console.log(`[4/5] Approval successful. Removing user ${userId} from local state.`);
      setUsers(prevUsers => {
        const newUsers = prevUsers.filter(u => u.adminId !== userId);
        console.log(`  > Updated users count: ${newUsers.length}`);
        return newUsers;
      });
      console.log('[5/5] State updated successfully.');
      console.groupEnd();
    } catch (err) {
      console.error(`[FAILED] Error during approval process for user ${userId}:`, err);
      console.log('  > Error details:', {
        message: err.message,
        stack: err.stack
      });
      console.groupEnd();
    }
  };

  const handleReject = async (userId: number) => {
    const token = sessionStorage.getItem('token');
    const url = `${BASE_URL}/hotel/super-admin/reject-admin?adminId=${userId}`;

    console.group(`API Call: Reject User ID ${userId}`);
    console.log(`[1/5] Initiating API call to: ${url}`);
    console.log(`  > Using token: ${token ? 'Found' : 'Not Found'}`);
    console.log(`  > Request method: POST with adminId as query parameter`);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('[2/5] Received raw response. Status:', res.status, res.statusText);
      console.log('  > Response headers:', Object.fromEntries(res.headers.entries()));

      if (!res.ok) {
        console.warn('  > Rejection response was not successful (status not 2xx).');
        const errorText = await res.text();
        console.log('  > Error response body:', errorText);
        console.groupEnd();
        return;
      }

      // Check if response has content before trying to parse JSON
      const contentType = res.headers.get('content-type');
      let data = null;
      
      if (contentType && contentType.includes('application/json')) {
        const responseText = await res.text();
        console.log('[3/5] Raw response text:', responseText);
        
        if (responseText.trim()) {
          try {
            data = JSON.parse(responseText);
            console.log('[3/5] Parsed JSON response:', data);
          } catch (parseError) {
            console.warn('  > Failed to parse JSON, treating as text:', parseError);
            data = responseText;
          }
        } else {
          console.log('[3/5] Empty response body (successful operation)');
          data = { success: true };
        }
      } else {
        const responseText = await res.text();
        console.log('[3/5] Non-JSON response:', responseText);
        data = { success: true, message: responseText };
      }

      console.log(`[4/5] Rejection successful. Removing user ${userId} from local state.`);
      setUsers(prevUsers => {
        const newUsers = prevUsers.filter(u => u.adminId !== userId);
        console.log(`  > Updated users count: ${newUsers.length}`);
        return newUsers;
      });
      console.log('[5/5] State updated successfully.');
      console.groupEnd();
    } catch (err) {
      console.error(`[FAILED] Error during rejection process for user ${userId}:`, err);
      console.log('  > Error details:', {
        message: err.message,
        stack: err.stack
      });
      console.groupEnd();
    }
  };

  if (loading) {
    console.log("Component Status: Rendering 'Loading...' view.");
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pending Approvals</h1>
          <p className="text-gray-600">Review and approve hotel registrations</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    console.log("Component Status: Rendering 'No Pending Approvals' view.");
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pending Approvals</h1>
          <p className="text-gray-600">Review and approve hotel registrations</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
          <p className="text-gray-500">All registrations have been processed</p>
        </div>
      </div>
    );
  }
  
  console.log(`Component Status: Rendering table with ${users.length} users.`);
  console.log('Users data:', users);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pending Approvals</h1>
          <p className="text-gray-600">Review and approve hotel registrations</p>
        </div>
        <div className="flex items-center space-x-2 bg-yellow-50 px-4 py-2 rounded-lg">
          <Clock className="h-5 w-5 text-yellow-500" />
          <span className="text-sm font-medium text-yellow-700">{users.length} pending</span>
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.adminId} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user.adminName ? user.adminName.charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          ID: {user.adminId}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.adminName || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {user.adminEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">
                        {user.adminPhoneNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => onViewDetails(user)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm rounded-lg text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleApprove(user.adminId)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm rounded-lg text-green-600 bg-green-100 hover:bg-green-200 transition-colors duration-200"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(user.adminId)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm rounded-lg text-red-600 bg-red-100 hover:bg-red-200 transition-colors duration-200"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
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