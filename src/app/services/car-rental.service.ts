import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { Car } from '../models/car.model';
import { Ipurchase } from '../models/purchase.mode';
 
@Injectable({
  providedIn: 'root',
})
export class CarRentalService {
  private baseUrl = 'https://rentcar.stepprojects.ge';
 
  constructor(private http: HttpClient) {}
 
  getPurchase(phoneNumber: string): Observable<Ipurchase[]> {
    return this.http.get<any>(`${this.baseUrl}/Purchase/${phoneNumber}`).pipe(
      map((response) => {
        if (response === 'No products' || !response) {
          return [];
        }
        return Array.isArray(response) ? response : [];
      }),
      catchError((error) => {
        console.error('Error fetching purchases', error);
        return of([]);
      })
    );
  }
 
  postPurchase(
    phoneNumber: string,
    carId: number,
    multiplier: number = 1
  ): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/Purchase/purchase`,
      {},
      {
        params: {
          phoneNumber,
          carId,
          multiplier,
        },
      }
    );
  }
 
  saveRental(rental: {
    id: string;
    car: Car;
    totalPrice: number;
    days: number;
    startDate: Date;
    endDate: Date;
  }) {
 
    const rentals = this.getStoredRentals();
    rentals.push(rental);
    localStorage.setItem('rentals', JSON.stringify(rentals));
  }
 
  private getStoredRentals(): any[] {
    const rentalsJson = localStorage.getItem('rentals');
    return rentalsJson ? JSON.parse(rentalsJson) : [];
  }
}