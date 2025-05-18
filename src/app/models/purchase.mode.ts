import { Car } from './car.model';
 
export interface Ipurchase {
  phoneNumber: string;
  carId: number;
  multiplier: number;
  car?: Car; // Add optional car property for response data
}