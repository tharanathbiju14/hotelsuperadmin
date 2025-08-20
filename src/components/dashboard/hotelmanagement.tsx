import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Search,
  Filter,
  MapPin,
  Star,
  Mail,
  Phone,
  DollarSign,
  X,
  Clock,
  Calendar,
} from "lucide-react";
import { Hotel, Amenity } from "../../App";

// Create an Axios instance
const apiClient = axios.create({
  baseURL: "http://192.168.1.14:8080/hotel",
});

// Add a request interceptor to include the token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle expired tokens
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 403) {
      console.error("Authentication error: Token might be expired. Logging out.");
      // Clear user session
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("adminEmail");
      // Redirect to login page
      window.location.href = '/'; // Or your login route
    }
    return Promise.reject(error);
  }
);


interface HotelManagementProps {
  amenities: Amenity[];
  onHotelUpdate: (id: string, updatedHotel: Partial<Hotel>) => void;
  onBack: () => void;
}

const API_BASE = "http://192.168.1.14:8080/hotel";

// Grab token from any of these keys
const getStoredToken = () => {
  console.log("🔍 [DEBUG] Checking localStorage for tokens...");

  const jwtToken = localStorage.getItem("jwt_token");
  const token = localStorage.getItem("token");
  const accessToken = localStorage.getItem("accessToken");

  console.log("🔍 [DEBUG] Token sources:", {
    jwt_token: jwtToken ? `${jwtToken.substring(0, 20)}...` : null,
    token: token ? `${token.substring(0, 20)}...` : null,
    accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : null,
  });

  const selectedToken = jwtToken ?? token ?? accessToken ?? "";
  console.log("✅ [DEBUG] Selected token:", selectedToken ? `${selectedToken.substring(0, 20)}...` : "No token found");

  return selectedToken;
};

// Ensure we only keep the raw JWT (no "Bearer " prefix)
const getAuthToken = () => {
  console.log("🔐 [DEBUG] Getting auth token...");
  const raw = getStoredToken();
  const cleaned = raw.replace(/^Bearer\s+/i, "").trim();

  console.log("🔐 [DEBUG] Token processing:", {
    hasRawToken: !!raw,
    rawLength: raw.length,
    hadBearerPrefix: raw !== cleaned,
    finalLength: cleaned.length,
  });

  return cleaned;
};

// Minimal JWT payload decode (base64url → JSON)
type JWTPayload = Record<string, any> | null;
const parseJwt = (token: string): JWTPayload => {
  console.log("🔓 [DEBUG] Parsing JWT token...");

  if (!token) {
    console.warn("⚠️ [DEBUG] No token provided for parsing");
    return null;
  }

  try {
    const parts = token.split(".");
    console.log("🔓 [DEBUG] JWT parts count:", parts.length);

    if (parts.length !== 3) {
      console.error("❌ [DEBUG] Invalid JWT format - should have 3 parts");
      return null;
    }

    const part = parts[1];
    if (!part) {
      console.error("❌ [DEBUG] Missing JWT payload part");
      return null;
    }

    // base64url → base64
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    // pad base64 if needed
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json = atob(padded);
    const payload = JSON.parse(json);

    console.log("✅ [DEBUG] JWT parsed successfully:", {
      payloadKeys: Object.keys(payload),
      exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
      iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : null,
    });

    // Check if token is expired
    if (payload.exp) {
      const isExpired = Date.now() >= payload.exp * 1000;
      console.log(isExpired ? "⚠️ [DEBUG] Token is EXPIRED" : "✅ [DEBUG] Token is valid");
    }

    return payload;
  } catch (error) {
    console.error("❌ [DEBUG] JWT parsing failed:", error);
    return null;
  }
};

// Extract adminEmail from token (cached in localStorage once found)
const getAdminEmail = (): string => {
  console.log("👤 [DEBUG] Getting admin email...");

  const fromStorage = localStorage.getItem("adminEmail");
  if (fromStorage) {
    console.log("✅ [DEBUG] Admin email from cache:", fromStorage);
    return fromStorage;
  }

  const token = getAuthToken();
  if (!token) {
    console.warn("⚠️ [DEBUG] No token available for admin email extraction");
    return "";
  }

  const payload = parseJwt(token);
  if (!payload) {
    console.warn("⚠️ [DEBUG] Could not parse token for admin email");
    return "";
  }

  // Adjust keys to match token claims; 'sub' or 'email' likely used by authentication.getName()
  const keys = [
    "email",
    "sub",
    "adminEmail",
    "admin_email",
    "userEmail",
    "username",
  ];

  console.log("👤 [DEBUG] Searching for admin email in payload keys:", keys);

  for (const k of keys) {
    const v = payload[k];
    console.log(`👤 [DEBUG] Checking key '${k}':`, v);

    if (v !== undefined && v !== null && String(v).trim() !== "") {
      const adminEmail = String(v);
      console.log("✅ [DEBUG] Found admin email:", adminEmail);
      localStorage.setItem("adminEmail", adminEmail);
      return adminEmail;
    }
  }

  console.warn("⚠️ [DEBUG] No admin email found in token payload");
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
  const [openImage, setOpenImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const authToken = getAuthToken();

  console.log("🏨 [DEBUG] HotelManagement component initialized with:", {
    amenitiesCount: amenities?.length || 0,
    hasAuthToken: !!authToken,
    authTokenLength: authToken?.length || 0,
  });

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
    console.log("🗺️ [DEBUG] Mapping hotel data:", {
      inputDataLength: data?.length || 0,
      isArray: Array.isArray(data),
    });

    if (!Array.isArray(data)) {
      console.error("❌ [DEBUG] Hotel data is not an array:", typeof data);
      return [];
    }

    const mappedHotels = data.map((h: any, index: number) => {
      console.log(`🗺️ [DEBUG] Mapping hotel ${index}:`, {
        hotelId: h.hotelId,
        id: h.id,
        name: h.hotelName,
        hasCreatedAt: !!h.createdAt,
        hasUpdatedAt: !!h.updatedAt,
        amenitiesCount: h.amenities?.length || 0,
      });

      const mapped = {
        ...h,
        id: h.hotelId?.toString() || h.id?.toString(),
        createdAt: h.createdAt ? new Date(h.createdAt) : new Date(),
        updatedAt: h.updatedAt ? new Date(h.updatedAt) : null,
        amenities: h.amenities
          ? h.amenities.map((a: any) => (typeof a === "string" ? a : a.name))
          : [],
      };

      return mapped;
    });

    console.log("✅ [DEBUG] Hotels mapped successfully:", mappedHotels.length);
    return mappedHotels;
  };

  const fetchDistricts = async () => {
    console.log("🏘️ [DEBUG] Fetching districts...");

    try {
      const res = await apiClient.get("/districts");

      console.log("🏘️ [DEBUG] Districts response:", {
        status: res.status,
        dataType: typeof res.data,
        dataLength: res.data?.length || 0,
        data: res.data,
      });

      const districtNames = (res.data || []).map((d: any) => {
        console.log("🏘️ [DEBUG] Processing district:", d);
        return d.name;
      });

      const finalDistricts = ["All Districts", ...districtNames];
      console.log("✅ [DEBUG] Districts processed:", finalDistricts);

      setDistricts(finalDistricts);
    } catch (err: any) {
      console.error("❌ [DEBUG] Failed to load districts:", {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          headers: err.config?.headers,
        },
      });
    }
  };

  const loadHotels = async () => {
    console.log("🏨 [DEBUG] Loading hotels...", {
      selectedDistrict,
      hasAuthToken: !!authToken,
    });

    try {
      setLoading(true);
      let data: any[] = [];
      let requestInfo = {};

      if (selectedDistrict !== "All Districts") {
        console.log("🏘️ [DEBUG] Loading hotels by district:", selectedDistrict);

        requestInfo = {
          endpoint: "fetch-hotels-by-district",
          url: `${API_BASE}/fetch-hotels-by-district`,
          params: { districtName: selectedDistrict },
        };

        const res = await apiClient.get("/fetch-hotels-by-district", {
          params: { districtName: selectedDistrict },
        });
        data = res.data || [];
      } else {
        console.log("🏨 [DEBUG] Loading all hotels...");

        requestInfo = {
          endpoint: "fetch-all-hotels",
          url: `${API_BASE}/fetch-all-hotels`,
        };

        const res = await apiClient.get("/fetch-all-hotels");
        data = res.data || [];
      }


      console.log("🏨 [DEBUG] Hotels API response:", {
        ...requestInfo,
        responseDataType: typeof data,
        responseDataLength: data?.length || 0,
        isArray: Array.isArray(data),
      });

      const mappedHotels = mapHotels(data);
      setHotels(mappedHotels);

      console.log("✅ [DEBUG] Hotels loaded successfully:", {
        totalHotels: mappedHotels.length,
      });

    } catch (error: any) {
      console.error("❌ [DEBUG] Error loading hotels:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params,
          headers: error.config?.headers,
        },
        stack: error.stack,
      });
      alert("Failed to load hotels. Please try again.");
    } finally {
      setLoading(false);
      console.log("🏨 [DEBUG] Hotels loading completed");
    }
  };

  useEffect(() => {
    console.log("🔄 [DEBUG] useEffect: Fetching districts on component mount");
    fetchDistricts();
  }, []);

  useEffect(() => {
    console.log("🔄 [DEBUG] useEffect: Loading hotels due to dependency change:", {
      selectedDistrict,
      hasAuthToken: !!authToken,
    });
    loadHotels();
  }, [selectedDistrict, authToken]);

  const filteredHotels = hotels.filter((hotel) => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return true;

    const nameMatch = (hotel.hotelName || "").toLowerCase().includes(s);
    const addressMatch = (hotel.hotelAddress || "").toLowerCase().includes(s);
    const matches = nameMatch || addressMatch;

    if (s.length > 0) {
      console.log("🔍 [DEBUG] Search filtering hotel:", {
        hotelName: hotel.hotelName,
        searchTerm: s,
        nameMatch,
        addressMatch,
        matches,
      });
    }

    return matches;
  });

  console.log("📊 [DEBUG] Current component state:", {
    totalHotels: hotels.length,
    filteredHotels: filteredHotels.length,
    loading,
    searchTerm: searchTerm || "(empty)",
    selectedDistrict,
    districts: districts.length,
  });

  const getAmenityNames = (amenitiesArr: (string | { name: string })[]) => {
    const names = (amenitiesArr || [])
      .map((a) => (typeof a === "string" ? a : a.name))
      .join(", ");

    console.log("🏪 [DEBUG] Processing amenities:", {
      input: amenitiesArr,
      output: names,
    });

    return names;
  };

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
    console.log("⏳ [DEBUG] Rendering loading state");
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

  console.log("✅ [DEBUG] Rendering main component with hotels:", filteredHotels.length);

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
              onChange={(e) => {
                console.log("🔍 [DEBUG] Search term changed:", e.target.value);
                setSearchTerm(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              value={selectedDistrict}
              onChange={(e) => {
                console.log("🏘️ [DEBUG] District filter changed:", e.target.value);
                setSelectedDistrict(e.target.value);
              }}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredHotels.length} of {hotels.length} hotels
          </div>
        </div>
      </div>

      {filteredHotels.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredHotels.map((hotel, index) => {
            console.log(`🏨 [DEBUG] Rendering hotel ${index}:`, {
              id: hotel.id,
              name: hotel.hotelName,
              imagesCount: {
                uploaded: hotel.hotelImageUploadBase64?.length || 0,
                urls: hotel.hotelImageUrls?.length || 0,
              },
            });

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
                  onImageClick={(img) => {
                    console.log("🖼️ [DEBUG] Image clicked:", img?.substring(0, 50) + "...");
                    img && setOpenImage(img);
                  }}
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
            {searchTerm || selectedDistrict !== "All Districts"
              ? "Try adjusting your search criteria"
              : "No hotels have been registered yet"}
          </p>
        </div>
      )}

      {openImage && (
        <OpenImageModal
          image={openImage}
          onClose={() => {
            console.log("🖼️ [DEBUG] Closing image modal");
            setOpenImage(null);
          }}
        />
      )}
    </div>
  );
};

export default HotelManagement;