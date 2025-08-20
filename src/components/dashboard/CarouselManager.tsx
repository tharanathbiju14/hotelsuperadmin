import React, { useState, useEffect } from 'react';
import { Upload, X, Eye, Trash2, Plus, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface CarouselImage {
  id: number;
  url: string; // Base64 or blob URL for display
  state: string; // 'Active' or 'Inactive'
}

export const CarouselManager: React.FC = () => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const API_BASE = 'http://192.168.1.14:8080/hotel/super-admin';

  // Fetch all carousel images on component mount (public endpoint)
  useEffect(() => {
    fetchImages();
  }, []);

  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const fetchImages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/get-all-carousel-images`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[CarouselManager] Fetched images:', data);
      // Map backend response to CarouselImage
      const formattedImages: CarouselImage[] = data.map((img: any) => {
        if (!img.carouselImageId) {
          console.error('[CarouselManager] Missing carouselImageId in image data:', img);
          throw new Error('Invalid image data: Missing carouselImageId');
        }
        return {
          id: img.carouselImageId,
          url: `data:image/jpeg;base64,${img.carouselImage}`, // Assuming images are JPEG
          state: img.state || 'Inactive',
        };
      });
      setImages(formattedImages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch carousel images');
      console.error('[CarouselManager] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setNewImage(imageFiles[0]); // Take the first image
      uploadImage(imageFiles[0]);
    } else {
      alert('Please drop a valid image file (JPG, PNG, GIF).');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setNewImage(imageFiles[0]); // Take the first image
      uploadImage(imageFiles[0]);
    } else {
      alert('Please select a valid image file (JPG, PNG, GIF).');
    }
  };

  const uploadImage = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('token');
      console.log('[CarouselManager] Uploading image with token:', token ? 'Present' : 'Missing', 'File:', file.name);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/add-carousel-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Note: Content-Type is omitted as browser sets multipart/form-data automatically
        },
        body: formData,
      });

      const responseText = await response.text();
      console.log('[CarouselManager] Upload response:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(responseText || 'Failed to upload image');
      }

      alert('Image uploaded successfully!');
      await fetchImages(); // Refresh the image list
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
      console.error('[CarouselManager] Upload error:', err);
    } finally {
      setIsLoading(false);
      setNewImage(null);
    }
  };

  const toggleImageStatus = async (id: number, currentState: string) => {
    if (!id || id === 0) {
      setError('Cannot toggle state: Invalid image ID');
      console.error('[CarouselManager] Invalid id for toggle:', id);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const newState = currentState === 'Active' ? 'Inactive' : 'Active';
      console.log('[CarouselManager] Toggling state for id:', id, 'to', newState);
      const response = await fetch(
        `${API_BASE}/change-carousel-image-state?carouselImageId=${id}&newState=${newState}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
        }
      );

      const responseText = await response.text();
      console.log('[CarouselManager] Toggle response:', response.status, responseText);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(responseText || 'Failed to update image state');
      }

      alert('Image state updated successfully!');
      await fetchImages(); // Refresh the image list
    } catch (err: any) {
      setError(err.message || 'Failed to update image state');
      console.error('[CarouselManager] Toggle state error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteImage = async (id: number) => {
    if (!id || id === 0) {
      setError('Cannot delete image: Invalid image ID');
      console.error('[CarouselManager] Invalid id for delete:', id);
      return;
    }

    if (!confirm('Are you sure you want to delete this image?')) return;

    setIsLoading(true);
    setError(null);
    try {
      console.log('[CarouselManager] Deleting image with id:', id);
      const response = await fetch(`${API_BASE}/delete-carousel-image?carouselImageId=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const responseText = await response.text();
      console.log('[CarouselManager] Delete response:', response.status, responseText);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(responseText || 'Failed to delete image');
      }

      alert('Image deleted successfully!');
      await fetchImages(); // Refresh the image list
    } catch (err: any) {
      setError(err.message || 'Failed to delete image');
      console.error('[CarouselManager] Delete error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const viewImage = (url: string) => {
    setSelectedImageUrl(url);
  };

  const closeImageModal = () => {
    setSelectedImageUrl(null);
  };

  const activeImages = images.filter(img => img.state === 'Active');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Update Carousel</h1>
          <p className="text-gray-600">Manage images displayed on the main website carousel</p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
          <ImageIcon className="h-5 w-5 text-blue-500" />
          <span className="text-sm font-medium text-blue-700">{activeImages.length} active images</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload New Images</h2>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            dragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Drag and drop images here
          </h3>
          <p className="text-gray-500 mb-4">or click to browse files</p>
          
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            disabled={isLoading}
          />
          <label
            htmlFor="file-upload"
            className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors duration-200 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 cursor-pointer'
            }`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Choose Files
          </label>
          
          <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
            <AlertCircle className="h-4 w-4 mr-1" />
            Supported formats: JPG, PNG, GIF (Max 5MB each)
          </div>
        </div>
      </div>

      {/* Current Images */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Current Carousel Images</h2>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading images...</p>
          </div>
        )}

        {!isLoading && images.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Images</h3>
            <p className="text-gray-500">Upload your first carousel image to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div key={image.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="relative">
                  <img
                    src={image.url}
                    alt={`Carousel Image ${image.id}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                    image.state === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {image.state}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewImage(image.url)}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200"
                        disabled={isLoading}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => toggleImageStatus(image.id, image.state)}
                        className={`inline-flex items-center px-3 py-1 rounded-md transition-colors duration-200 ${
                          image.state === 'Active'
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        disabled={isLoading}
                      >
                        {image.state === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                    <button
                      onClick={() => deleteImage(image.id)}
                      className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image View Modal */}
      {selectedImageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex justify-center">
              <img
                src={selectedImageUrl}
                alt="Full-size carousel image"
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarouselManager;