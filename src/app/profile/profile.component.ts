import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { Car } from '../models/car.model';
import { RouterModule } from '@angular/router';
import { CarService } from '../car.service';
import { HttpClient } from '@angular/common/http';
import { FavoriteService } from '../services/favorite.service';
import { Ipurchase } from '../models/purchase.mode';
 
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  userName: string = 'მომხმარებელი';
  user: any;
  favorites: Car[] = [];
  uploadedCars: any[] = [];
  rentedCars: Ipurchase[] = [];
 
  constructor(
    public userService: UserService,
    private favoriteService: FavoriteService,
    private carService: CarService,
    private http: HttpClient
  ) {}
 
  ngOnInit(): void {
    this.user = this.userService.currentUserValue;
 
    if (this.userService.isLoggedIn()) {
      this.userService.getUserDetails().subscribe({
        next: (userData) => {
          this.user = userData;
          this.loadUserData();
        },
        error: (err) => {
          console.error('Failed to fetch user details:', err);
          this.loadUserData();
        },
      });
    }
  }
 
  
  private loadUserData(): void {
    if (this.user?.phoneNumber) {
      this.loadUploadedCars();
      this.loadRentedCars();
      this.loadFavorites();
    }
  }
 
  private loadUploadedCars(): void {
    const token = localStorage.getItem('token');
    if (!token || !this.user?.phoneNumber) {
      console.error('No token or phone number available to load uploaded cars');
      return;
    }
 
    const apiUrl = `https://rentcar.stepprojects.ge/api/Car`;
 
    this.http
      .get<any[]>(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
        params: { ownerPhoneNumber: this.user.phoneNumber },
      })
      .subscribe({
        next: (cars) => {
          console.log('Loaded user uploaded cars:', cars);
          this.uploadedCars = cars;
        },
        error: (err) => {
          console.error(
            'Failed to load user uploaded cars with direct query:',
            err
          );
 
          this.tryFilterEndpoint();
        },
      });
  }
 
 
  private tryFilterEndpoint(): void {
    const token = localStorage.getItem('token');
    if (!token || !this.user?.phoneNumber) return;
 
    const filterUrl = `https://rentcar.stepprojects.ge/api/Car/filter`;
 
    
    this.http
      .post<any>(
        filterUrl,
        { ownerPhoneNumber: this.user.phoneNumber },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .subscribe({
        next: (response) => {
          console.log('Loaded user uploaded cars via filter:', response);
          
          this.uploadedCars = Array.isArray(response)
            ? response
            : response.cars || response.items || response.data || [];
        },
        error: (err) => {
          console.error('Failed to load user uploaded cars via filter:', err);
 
          
          this.tryPaginatedEndpoint();
        },
      });
  }
 
  
  private tryPaginatedEndpoint(): void {
    const token = localStorage.getItem('token');
    if (!token || !this.user?.phoneNumber) return;
 
    const paginatedUrl = `https://rentcar.stepprojects.ge/api/Car/paginated`;
 
    this.http
      .get<any>(paginatedUrl, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          ownerPhoneNumber: this.user.phoneNumber,
          pageNumber: '1',
          pageSize: '50', 
        },
      })
      .subscribe({
        next: (response) => {
          console.log('Loaded user uploaded cars via pagination:', response);
 
          this.uploadedCars =
            response.items || response.data || response.cars || [];
        },
        error: (err) => {
          console.error('All attempts to load user uploaded cars failed:', err);
          this.uploadedCars = [];
        },
      });
  }
 
  private loadRentedCars(): void {
    const token = localStorage.getItem('token');
    if (!token || !this.user?.phoneNumber) {
      console.error('No token or phone number available to load rented cars');
      return;
    }
 
    const apiUrl = `https://rentcar.stepprojects.ge/Purchase/${this.user.phoneNumber}`;
 
    this.http
      .get<any>(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (response) => {
          console.log('Loaded user rented cars:', response);
 
          if (response === 'No products') {
            this.rentedCars = [];
          } else {
  
            if (Array.isArray(response)) {
 
              this.rentedCars = response;
            } else {
              this.rentedCars = [];
            }
 
 
            this.rentedCars.forEach((purchase) => {
              if (purchase.carId && !purchase.car) {
                this.carService.getCarById(purchase.carId).subscribe({
                  next: (carData) => {
                    purchase.car = carData;
                  },
                  error: (err) => {
                    console.error(
                      `Failed to load car details for ID ${purchase.carId}:`,
                      err
                    );
                  },
                });
              }
            });
          }
        },
        error: (err) => {
          console.error('Failed to load rented cars:', err);
          this.rentedCars = [];
        },
      });
  }
 
  
  loadFavorites() {
    if (this.user?.phoneNumber) {
      this.favoriteService.getFavorite(this.user.phoneNumber).subscribe({
        next: (response) => {
          this.favorites = response;
        },
        error: (error) => {
          console.error(error.message);
        },
      });
    }
  }
 
  addFavorite(carId: number) {
    if (this.user?.phoneNumber) {
      this.favoriteService
        .postFavorite(this.user.phoneNumber, carId)
        .subscribe({
          next: () => {
            console.log('Car added to favorites successfully');
            this.loadFavorites();
          },
          error: (error) => {
            console.error('Failed to add favorite:', error);
          },
        });
    }
  }
}