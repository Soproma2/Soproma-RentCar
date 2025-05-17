import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CarRental {
  id: string;
  car: {
    id?: number;
    brand: string;
    model: string;
    city: string;
    imageUrl1: string;
  };
  totalPrice: number;
  days: number;
  startDate: Date;
  endDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class RentalService {
  private rentals = new BehaviorSubject<CarRental[]>(this.loadRentals());

  private loadRentals(): CarRental[] {
    const saved = localStorage.getItem('rentals');
    return saved ? JSON.parse(saved) : [];
  }

  private saveRentals(rentals: CarRental[]) {
    localStorage.setItem('rentals', JSON.stringify(rentals));
  }

  addRental(rental: CarRental) {
    const currentRentals = this.rentals.value;
    const newRentals = [...currentRentals, rental];
    this.saveRentals(newRentals);
    this.rentals.next(newRentals);
  }

  getRentals(): Observable<CarRental[]> {
    return new Observable(observer => {
      const rentals = JSON.parse(localStorage.getItem('rentals') || '[]');
      observer.next(rentals);
      observer.complete();
    });
  }

  deleteRental(id: string): Observable<void> {
    return new Observable(observer => {
      try {
        const rentals = JSON.parse(localStorage.getItem('rentals') || '[]');
        const updatedRentals = rentals.filter((rental: CarRental) => rental.id !== id);
        localStorage.setItem('rentals', JSON.stringify(updatedRentals));
        observer.next();
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  saveRental(rental: CarRental): Observable<void> {
    return new Observable(observer => {
      try {
        const existingRentals = JSON.parse(localStorage.getItem('rentals') || '[]');
        existingRentals.push(rental);
        localStorage.setItem('rentals', JSON.stringify(existingRentals));
        observer.next();
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }
}
