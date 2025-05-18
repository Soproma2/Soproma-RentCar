import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Car } from './models/car.model';
import { CarPaginatedData } from './models/carPaginatedData.model';
import { CarFilter } from './models/carFilter.model';

@Injectable({
  providedIn: 'root',
})
export class CarService {
  private apiUrl = 'https://rentcar.stepprojects.ge/api';

  constructor(private http: HttpClient) {}

  // Get paginated cars
  getCars(
    pageIndex: number = 1,
    pageSize: number = 10
  ): Observable<CarPaginatedData> {
    console.log(`Requesting page ${pageIndex} with size ${pageSize}`);
    return this.http.get<CarPaginatedData>(
      `${this.apiUrl}/Car/paginated?pageIndex=${pageIndex}&pageSize=${pageSize}`
    );
  }


  getCarById(id: number): Observable<Car> {
    return this.http.get<Car>(`${this.apiUrl}/Car/${id}`);
  }


  filterCars(filter: CarFilter): Observable<CarPaginatedData> {
    let params = new HttpParams();

    if (filter.capacity !== undefined && filter.capacity > 0) {
      params = params.set('capacity', filter.capacity.toString());
    }

    if (filter.startYear !== undefined) {
      params = params.set('startYear', filter.startYear.toString());
    }

    if (filter.endYear !== undefined) {
      params = params.set('endYear', filter.endYear.toString());
    }

    if (filter.city) {
      params = params.set('city', filter.city);
    }

    params = params.set('pageIndex', (filter.pageIndex || 1).toString());
    params = params.set('pageSize', (filter.pageSize || 10).toString());

    return this.http.get<CarPaginatedData>(`${this.apiUrl}/Car/filter`, {
      params,
    });
  }


  getPopularCars(): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.apiUrl}/Car/popular`);
  }


  getCarsByPhone(phoneNumber: string): Observable<Car[]> {
    return this.http.get<Car[]>(
      `${this.apiUrl}/Car/byPhone?phoneNumber=${phoneNumber}`
    );
  }


  getCities(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/Car/cities`);
  }


  addCar(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/Car`, formData).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error in addCar:', error);
        
        let errorMessage = 'An error occurred while adding the car';
        
        if (error.status === 500) {
          errorMessage = 'Internal server error occurred';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }


  updateCar(id: number, updateCar: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Car/${id}`, updateCar);
  }


  deleteCar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Car/${id}`);
  }


  getUserCars(userId: string): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.apiUrl}/cars/user/${userId}`);
  }
}
