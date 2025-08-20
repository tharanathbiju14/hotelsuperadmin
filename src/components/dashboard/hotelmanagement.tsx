import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Search,
  Filter,
  Edit,
  MapPin,
  Star,
  Mail,
  Phone,
  DollarSign,
  Image as ImageIcon,
  X,
  Clock,
  Calendar,
} from "lucide-react";
import { Hotel, Amenity } from "../App";
import HotelEditModal from "./HotelEditModal";
import HotelImageEditModal from "./HotelImageEditModal";

interface HotelManagementProps {
  amenities: Amenity[];
  onHotelUpdate: (id: string, updatedHotel: Partial<Hotel>) => void;
  onBack: () => void;
}

const API_BASE = "http://192.168.1.4:8080/hotel";

// Grab token from any of these keys
const getStoredToken = () =>
  localStorage.getItem("jwt_token") ??
  localStorage.getItem("token") ??
  localStorage.getItem("accessToken") ??
  "";

// Ensure we only keep the raw JWT (no "Bearer " prefix)
const getAuthToken = () => {
  const raw = getStoredToken();
  return raw.replace(/^Bearer\s+/i, "").trim();
};

// Minimal JWT payload decode (base64url → JSON)
type JWTPayload = Record<string, any> | null;
const parseJwt = (token: string): JWTPayload => {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    // base64url → base64
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    // pad base64 if needed
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

// Extract adminEmail from token (cached in localStorage once found)
const getAdminEmail = (): string => {
  const fromStorage = localStorage.getItem("adminEmail");
  if (fromStorage) return fromStorage;

  const token = getAuthToken();
  if (!token) return "";

  const payload = parseJwt(token);
  if (!payload) return "";

  // Adjust keys to match token claims; 'sub' or 'email' likely used by authentication.getName()
  const keys = [
    "email",
    "sub",
    "adminEmail",
    "admin_email",
    "userEmail",
    "username",
  ];

  for (const k of keys) {
    const v = payload[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      const adminEmail = String(v);
      localStorage.setItem("adminEmail", adminEmail);
      return adminEmail;
    }
  }

  return "";
};

const HotelManagement: React.FC<HotelManagementProps> = ({
  amenities,
  onHotelUpdate,
  onBack,
}) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [districts, setDistricts] = useState<string[]>(["All Districts"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [adminOnly, setAdminOnly] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [editingImagesForHotel, setEditingImagesForHotel] =
    useState<Hotel | null>(null);
  const [openImage, setOpenImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const authToken = getAuthToken();

  const formatDateTime = (date: Date | null | undefined) => {
    if (!date) return "Not updated yet";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date);
  };

  const mapHotels = (data: any[]): Hotel[] => {
    return (data || []).map((h: any) => ({
      ...h,
      id: h.hotelId?.toString() || h.id?.toString(),
      createdAt: h.createdAt ? new Date(h.createdAt) : new Date(),
      updatedAt: h.updatedAt ? new Date(h.updatedAt) : null,
      amenities: h.amenities
        ? h.amenities.map((a: any) => (typeof a === "string" ? a : a.name))
        : [],
    }));
  };

  const fetchDistricts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/districts`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const districtNames = (res.data || []).map((d: any) => d.name);
      setDistricts(["All Districts", ...districtNames]);
    } catch (err) {
      console.error("Failed to load districts", err);
    }
  };

  const loadHotels = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${authToken}` };
      let data: any[] = [];

      if (adminOnly) {
        const adminEmail = getAdminEmail();
        if (!adminEmail) {
          alert("Admin email not found in token. Please log in again.");
          setAdminOnly(false);
          // Fallback to all hotels
          const res = await axios.get(`${API_BASE}/fetch-all-hotels`, {
            headers,
          });
          data = res.data || [];
        } else {
          // Use the new endpoint; backend extracts adminEmail from token
          const res = await axios.get(
            `${API_BASE}/added-hotel-by-admin-email`,
            { headers }
          );
          data = res.data || [];

          // If a district is selected, filter locally
          if (selectedDistrict !== "All Districts") {
            const sel = selectedDistrict.toLowerCase();
            data = data.filter(
              (h: any) => (h.district || "").toLowerCase() === sel
            );
          }
        }
      } else {
        if (selectedDistrict !== "All Districts") {
          const res = await axios.get(`${API_BASE}/fetch-hotels-by-district`, {
            headers,
            params: { districtName: selectedDistrict },
          });
          data = res.data || [];
        } else {
          const res = await axios.get(`${API_BASE}/fetch-all-hotels`, {
            headers,
          });
          data = res.data || [];
        }
      }

      setHotels(mapHotels(data));
    } catch (error) {
      console.error("Error loading hotels:", error);
      alert("Failed to load hotels. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, []);

  useEffect(() => {
    loadHotels();
  }, [selectedDistrict, adminOnly, authToken]);

  const filteredHotels = hotels.filter((hotel) => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return true;
    return (
      (hotel.hotelName || "").toLowerCase().includes(s) ||
      (hotel.hotelAddress || "").toLowerCase().includes(s)
    );
  });

  const handleEdit = async (hotel: Hotel) => setEditingHotel(hotel);

  const handleEditImages = (hotel: Hotel) => setEditingImagesForHotel(hotel);

  const handleSaveEdit = async (updatedHotel: Partial<Hotel>) => {
    if (editingHotel) {
      const hotelWithUpdate = { ...updatedHotel, updatedAt: new Date() };
      setHotels((prev) =>
        prev.map((hotel) =>
          hotel.id === editingHotel.id
            ? { ...hotel, ...hotelWithUpdate }
            : hotel
        )
      );
      onHotelUpdate(editingHotel.id, hotelWithUpdate);
      setEditingHotel(null);
    }
  };

  const getAmenityNames = (amenitiesArr: (string | { name: string })[]) =>
    (amenitiesArr || [])
      .map((a) => (typeof a === "string" ? a : a.name))
      .join(", ");

  const GridImageCarousel: React.FC<{
    images: string[];
    onImageClick?: (img: string) => void;
  }> = ({ images, onImageClick }) => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
      if (!images || images.length <= 1) return;
      const interval = setInterval(
        () => setCurrent((prev) => (prev + 1) % images.length),
        2500
      );
      return () => clearInterval(interval);
    }, [images]);

    useEffect(() => {
      setCurrent(0);
    }, [images]);

    if (!images || images.length === 0) {
      return (
        <div className="aspect-[16/9] bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-4xl mb-2">🏨</div>
            <p className="text-sm opacity-90">No Images</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative aspect-[16/9] bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer group">
        <img
          src={images[current]}
          alt={`Hotel ${current + 1}`}
          className="object-cover w-full h-full transition-transform group-hover:scale-105"
          onClick={() => onImageClick && onImageClick(images[current])}
        />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`block w-2 h-2 rounded-full ${
                idx === current ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  const OpenImageModal = ({
    image,
    onClose,
  }: {
    image: string;
    onClose: () => void;
  }) => (
    <div className="fixed inset-0 z-[60] bg-black bg-opacity-80 flex items-center justify-center">
      <div className="relative">
        <img
          src={image}
          alt="Full"
          className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
        />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-2"
        >
          <X className="w-6 h-6 text-gray-800" />
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Hotel Management
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage all registered hotels
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hotels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Hotel Management
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage all registered hotels
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search hotels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <label className="inline-flex items-center space-x-2 text-sm text-gray-700 select-none">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={adminOnly}
              onChange={(e) => {
                const checked = e.target.checked;
                if (checked) {
                  const email = getAdminEmail();
                  if (!email) {
                    alert(
                      "Admin email not found in token. Please log in again."
                    );
                    return;
                  }
                }
                setAdminOnly(checked);
              }}
            />
            <span>Added by me</span>
          </label>

          <div className="text-sm text-gray-600">
            Showing {filteredHotels.length} of {hotels.length} hotels
          </div>
        </div>
      </div>

      {filteredHotels.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => {
            const uploadedImages = (hotel.hotelImageUploadBase64 || []).map(
              (b) => `data:image/jpeg;base64,${b}`
            );
            const urlImages = hotel.hotelImageUrls || [];
            const allImages = [...uploadedImages, ...urlImages];

            return (
              <div
                key={hotel.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <GridImageCarousel
                  images={allImages}
                  onImageClick={(img) => img && setOpenImage(img)}
                />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 flex-1">
                      {hotel.hotelName}
                    </h3>
                    {hotel.hotelRating !== undefined &&
                      Number(hotel.hotelRating) > 0 && (
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium">
                            {hotel.hotelRating}
                          </span>
                        </div>
                      )}
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {hotel.hotelDescription}
                  </p>
                  <div className="flex items-center space-x-2 text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{hotel.district}</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm truncate">
                        {hotel.hotelEmail}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{hotel.hotelPhoneNumber}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mb-4">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-lg font-semibold text-green-600">
                      ₹{hotel.hotelBasicPricePerNight}
                    </span>
                    <span className="text-sm text-gray-600">per night</span>
                  </div>
                  <div className="mb-4 space-y-1">
                    {hotel.hotelTypeName && (
                      <p className="text-xs text-gray-500">
                        Type:{" "}
                        <span className="text-gray-700">
                          {hotel.hotelTypeName}
                        </span>
                      </p>
                    )}
                    {hotel.landscapeTypeName && (
                      <p className="text-xs text-gray-500">
                        Landscape:{" "}
                        <span className="text-gray-700">
                          {hotel.landscapeTypeName}
                        </span>
                      </p>
                    )}
                    <p className="text-xs text-gray-500 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Created:{" "}
                      <span className="text-gray-700 ml-1">
                        {formatDateTime(hotel.createdAt)}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Updated:{" "}
                      <span className="text-gray-700 ml-1">
                        {formatDateTime(hotel.updatedAt)}
                      </span>
                    </p>
                  </div>
                  {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Amenities:</p>
                      <p className="text-sm text-gray-700 line-clamp-1">
                        {getAmenityNames(hotel.amenities)}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditImages(hotel)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">Images</span>
                    </button>
                    <button
                      onClick={() => handleEdit(hotel)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm font-medium">Details</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hotels found
          </h3>
          <p className="text-gray-600">
            {searchTerm || selectedDistrict !== "All Districts" || adminOnly
              ? "Try adjusting your search criteria"
              : "No hotels have been registered yet"}
          </p>
        </div>
      )}

      {editingHotel && (
        <HotelEditModal
          hotel={editingHotel}
          onSave={handleSaveEdit}
          onClose={() => setEditingHotel(null)}
          authToken={authToken}
        />
      )}

      {editingImagesForHotel && (
        <HotelImageEditModal
          hotel={editingImagesForHotel}
          onClose={() => setEditingImagesForHotel(null)}
          authToken={authToken}
        />
      )}

      {openImage && (
        <OpenImageModal image={openImage} onClose={() => setOpenImage(null)} />
      )}
    </div>
  );
};

export default HotelManagement;