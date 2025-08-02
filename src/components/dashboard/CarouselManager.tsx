import React, { useState } from 'react';
import { Upload, X, Eye, Trash2, Plus, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface CarouselImage {
  id: number;
  url: string;
  title: string;
  description: string;
  isActive: boolean;
}

export const CarouselManager: React.FC = () => {
  const [images, setImages] = useState<CarouselImage[]>([
    {
      id: 1,
      url: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg',
      title: 'Luxury Hotel Suite',
      description: 'Experience ultimate comfort in our premium suites',
      isActive: true
    },
    {
      id: 2,
      url: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
      title: 'Hotel Lobby',
      description: 'Welcome to our elegant reception area',
      isActive: true
    },
    {
      id: 3,
      url: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
      title: 'Restaurant Dining',
      description: 'Fine dining experience with world-class cuisine',
      isActive: false
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newImage, setNewImage] = useState({
    title: '',
    description: '',
    url: ''
  });
  const [dragOver, setDragOver] = useState(false);

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
      // In a real app, you would upload these files to a server
      console.log('Files to upload:', imageFiles);
      alert(`${imageFiles.length} image(s) ready for upload. In a real app, these would be uploaded to your server.`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      console.log('Files to upload:', imageFiles);
      alert(`${imageFiles.length} image(s) selected. In a real app, these would be uploaded to your server.`);
    }
  };

  const toggleImageStatus = (id: number) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, isActive: !img.isActive } : img
    ));
  };

  const deleteImage = (id: number) => {
    if (confirm('Are you sure you want to delete this image?')) {
      setImages(prev => prev.filter(img => img.id !== id));
    }
  };

  const addNewImage = () => {
    if (newImage.title && newImage.description && newImage.url) {
      const newId = Math.max(...images.map(img => img.id)) + 1;
      setImages(prev => [...prev, {
        id: newId,
        ...newImage,
        isActive: true
      }]);
      setNewImage({ title: '', description: '', url: '' });
      setShowAddModal(false);
    }
  };

  const activeImages = images.filter(img => img.isActive);

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
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors duration-200"
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
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Image URL
          </button>
        </div>

        {images.length === 0 ? (
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
                    alt={image.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                    image.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {image.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{image.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{image.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(image.url, '_blank')}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => toggleImageStatus(image.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-md transition-colors duration-200 ${
                          image.isActive
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {image.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                    <button
                      onClick={() => deleteImage(image.id)}
                      className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200"
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

      {/* Add Image Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add New Image</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Title
                </label>
                <input
                  type="text"
                  value={newImage.title}
                  onChange={(e) => setNewImage(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter image title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newImage.description}
                  onChange={(e) => setNewImage(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter image description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={newImage.url}
                  onChange={(e) => setNewImage(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={addNewImage}
                disabled={!newImage.title || !newImage.description || !newImage.url}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Add Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};