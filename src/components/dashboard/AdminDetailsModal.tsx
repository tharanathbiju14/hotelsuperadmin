import React, { useState, useEffect } from 'react';
import { X, Building2, Phone, MapPin, Star, Calendar, Mail, User, Hotel, Loader } from 'lucide-react';

interface Hotel {
  hotelId: number;
  hotelName: string;
  hotelAddress: string;
  hotelPhoneNumber: string;
  hotelEmail: string;
  hotelDescription?: string;
  hotelRating?: number;
  createdDate?: string;
  // Add other hotel properties as needed based on your Hotel entity
}

interface ApprovedAdmin {
  adminId: number;
  adminName: string;
  adminEmail: string;
  adminPhoneNumber: string;
}

interface AdminDetailsModalProps {
  admin: ApprovedAdmin | null;
  isOpen: boolean;
  onClose: () => void;
}

const BASE_URL = 'http://192.168.1.14:8080';

export const AdminDetailsModal: React.FC<AdminDetailsModalProps> = ({ admin, isOpen, onClose }) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && admin) {
      fetchAdminHotels(admin.adminId);
    }
  }, [isOpen, admin]);

  const fetchAdminHotels = async (adminId: number) => {
    setLoading(true);
    setError(null);
    
    const token = sessionStorage.getItem('token');
    const url = `${BASE_URL}/hotel/super-admin/added-hotel-by-admin?adminId=${adminId}`;

    console.group(`API Call: Fetch Hotels for Admin ID ${adminId}`);
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
        setError(`Failed to fetch hotels: ${response.status} ${response.statusText}`);
        setLoading(false);
        console.groupEnd();
        return;
      }

      const data = await response.json();
      console.log('[3/4] Parsed JSON data:', data);

      // Handle different response formats
      let processedData: Hotel[] = [];
      
      if (Array.isArray(data)) {
        console.log(`  > Data is an array with ${data.length} items`);
        processedData = data;
      } else if (data && typeof data === 'object') {
        console.log('  > Data is an object, converting to array format');
        console.log('  > Object properties:', Object.keys(data));
        
        // If it's a single object with hotel properties, wrap it in an array
        if (data.hotelId || data.hotelName) {
          console.log('  > Detected single hotel object, wrapping in array');
          processedData = [data];
        } else {
          console.warn('  > Object does not contain expected hotel properties');
          processedData = [];
        }
      } else {
        console.warn('  > Received data is neither array nor object. Setting state to empty array.');
        processedData = [];
      }

      console.log(`[4/4] Setting ${processedData.length} hotels in state:`, processedData);
      setHotels(processedData);
      setError(null);
      setLoading(false);
      console.groupEnd();

    } catch (err) {
      console.error('[FAILED] Error fetching admin hotels:', err);
      console.log('  > Error details:', {
        message: err.message,
        stack: err.stack
      });
      setError('Network error. Please try again.');
      setLoading(false);
      setHotels([]);
      console.groupEnd();
    }
  };

  if (!isOpen || !admin) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Admin Details & Hotels</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Admin Information */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {admin.adminName.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{admin.adminName}</h3>
                <div className="flex items-center text-gray-600 mt-1">
                  <Mail className="h-4 w-4 mr-2" />
                  {admin.adminEmail}
                </div>
                <div className="flex items-center text-gray-600 mt-1">
                  <Phone className="h-4 w-4 mr-2" />
                  {admin.adminPhoneNumber}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Admin ID</div>
                <div className="text-lg font-semibold text-gray-900">#{admin.adminId}</div>
              </div>
            </div>
          </div>

          {/* Hotels Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Hotels Added by This Admin</h3>
              {!loading && !error && (
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-lg">
                  <Hotel className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700">{hotels.length} hotels</span>
                </div>
              )}
            </div>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-blue-500 mr-3" />
                <span className="text-gray-600">Loading hotels...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-red-600 mb-2">{error}</div>
                <button
                  onClick={() => fetchAdminHotels(admin.adminId)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && hotels.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Hotel className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Hotels Found</h4>
                <p className="text-gray-500">This admin hasn't added any hotels yet</p>
              </div>
            )}

            {!loading && !error && hotels.length > 0 && (
              <div className="space-y-4">
                {hotels.map((hotel) => (
                  <div key={hotel.hotelId} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Building2 className="h-5 w-5 text-gray-500 mr-2" />
                          <h4 className="text-lg font-semibold text-gray-900">{hotel.hotelName}</h4>
                          {hotel.hotelRating && (
                            <div className="flex items-center ml-3">
                              {Array.from({ length: hotel.hotelRating }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span className="font-medium">Address:</span>
                            </div>
                            <p className="text-gray-900 ml-6">{hotel.hotelAddress}</p>
                          </div>
                          
                          <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <Phone className="h-4 w-4 mr-2" />
                              <span className="font-medium">Phone:</span>
                            </div>
                            <p className="text-gray-900 ml-6">{hotel.hotelPhoneNumber}</p>
                          </div>
                          
                          <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <Mail className="h-4 w-4 mr-2" />
                              <span className="font-medium">Email:</span>
                            </div>
                            <p className="text-gray-900 ml-6">{hotel.hotelEmail}</p>
                          </div>
                          
                          {hotel.createdDate && (
                            <div>
                              <div className="flex items-center text-sm text-gray-600 mb-1">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span className="font-medium">Added:</span>
                              </div>
                              <p className="text-gray-900 ml-6">
                                {new Date(hotel.createdDate).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          )}
                        </div>

                        {hotel.hotelDescription && (
                          <div className="mt-3">
                            <div className="text-sm text-gray-600 mb-1 font-medium">Description:</div>
                            <p className="text-gray-900 text-sm">{hotel.hotelDescription}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        <div className="text-sm text-gray-500">Hotel ID</div>
                        <div className="text-lg font-semibold text-gray-900">#{hotel.hotelId}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
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