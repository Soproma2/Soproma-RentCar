import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Car } from '../models/car.model';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private baseUrl = 'https://rentcar.stepprojects.ge';

  constructor(private http: HttpClient) {}

  getFavorite(phoneNumber: string): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.baseUrl}/api/Users/${phoneNumber}/favorite-cars`);
  }

  postFavorite(phoneNumber: string, carId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/Users/${phoneNumber}/favorites/${carId}`, {});
  }
}
