import { Car } from './car.model';
 
export interface Ipurchase {
startDate: any;
endDate: any;
  phoneNumber: string;
  carId: number;
  multiplier: number;
  car?: Car; 
}