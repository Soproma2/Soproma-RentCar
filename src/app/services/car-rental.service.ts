import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Car } from '../models/car.model';
import { Ipurchase } from '../models/purchase.mode';

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

postPurchase(car: Ipurchase): Observable<Ipurchase> {
    return this.http.post<Ipurchase>(`${this.baseUrl}/Purchase/purchase`, car);
}
}
