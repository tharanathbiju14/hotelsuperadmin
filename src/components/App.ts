export interface Hotel {
  id: string;
  hotelId?: number;
  hotelName: string;
  hotelAddress: string;
  hotelPhoneNumber: string;
  hotelEmail: string;
  hotelDescription?: string;
  hotelRating?: number;
  createdAt: Date;
  updatedAt: Date | null;
  amenities: (string | { name: string })[];
  hotelImageUploadBase64?: string[];
  hotelImageUrls?: string[];
  district?: string;
  hotelBasicPricePerNight?: number;
  hotelTypeName?: string;
  landscapeTypeName?: string;
}

export interface Amenity {
  id: string;
  name: string;
}