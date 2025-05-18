import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Car } from '../models/car.model';

@Injectable({
  providedIn: 'root'
})
export class CarRentalService {
  saveRental(rental: { id: string; car: Car; totalPrice: number; days: number; startDate: Date; endDate: Date; }) {
    throw new Error('Method not implemented.');
  }
  private baseUrl = 'https://rentcar.stepprojects.ge';

  constructor(private http: HttpClient) {}

  getPurchase(){
    return this.http.get<Car[]>(`${this.baseUrl}​/Purchase​/{phoneNumber}`);
  }

  postPurchase(){
    return this.http.post(`${this.baseUrl}​/Purchase​/purchase`, {});
  }
}
