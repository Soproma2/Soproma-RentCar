export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  imageUrl1: string;
  imageUrl2?: string;
  imageUrl3?: string;
  image1?: string;
  image2?: string;
  image3?: string;
  price: number; 
  multiplier: number; 
  capacity: number;
  transmission: string;
  createdBy: string;
  createdByEmail: string;
  fuelCapacity: number;
  city: string;
  latitude: number;
  longitude: number;
  ownerPhoneNumber: string;
}
