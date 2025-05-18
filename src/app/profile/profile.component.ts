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
    private favoriteService:FavoriteService,
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

  /**
   * Loads all user-related data including uploaded cars
   */
  private loadUserData(): void {
    if (this.user?.phoneNumber) {
      this.loadUploadedCars();
      // this.loadRentedCars();
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

  /**
   * Alternative approach using the filter endpoint
   */
  private tryFilterEndpoint(): void {
    const token = localStorage.getItem('token');
    if (!token || !this.user?.phoneNumber) return;

    const filterUrl = `https://rentcar.stepprojects.ge/api/Car/filter`;

    // The filter endpoint might expect a POST with filter criteria
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
          // The response might contain the cars array in a specific property
          this.uploadedCars = Array.isArray(response)
            ? response
            : response.cars || response.items || response.data || [];
        },
        error: (err) => {
          console.error('Failed to load user uploaded cars via filter:', err);

          // Last resort - try the paginated endpoint
          this.tryPaginatedEndpoint();
        },
      });
  }

  /**
   * Another alternative approach using the paginated endpoint
   */
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
          pageSize: '50', // Get a reasonable amount of cars
        },
      })
      .subscribe({
        next: (response) => {
          console.log('Loaded user uploaded cars via pagination:', response);
          // The paginated response typically has the items in a property
          this.uploadedCars =
            response.items || response.data || response.cars || [];
        },
        error: (err) => {
          console.error('All attempts to load user uploaded cars failed:', err);
          this.uploadedCars = [];
        },
      });
  }

  
  // private loadRentedCars(): void {
  //   const token = localStorage.getItem('token');
  //   if (!token || !this.user?.phoneNumber) {
  //     console.error('No token or phone number available to load rented cars');
  //     return;
  //   }

  //   const apiUrl = `https://rentcar.stepprojects.ge/api/Purchase/${this.user.phoneNumber}`;

  //   this.http.get<Ipurchase[]>(apiUrl, {
  //     headers: { Authorization: `Bearer ${token}` }
  //   }).subscribe({
  //     next: (rentals) => {
  //       console.log('Loaded user rented cars:', rentals);
  //       this.rentedCars = rentals;
  //     },
  //     error: (err) => {
  //       console.error('Failed to load rented cars:', err);
  //       this.rentedCars = [];
  //     }
  //   });
  // }


  // deleteCar(carId: number): void {
  //   if (!confirm('ნამდვილად გსურთ ამ მანქანის წაშლა?')) {
  //     return;
  //   }

  //   const token = localStorage.getItem('token');
  //   if (!token) {
  //     console.error('No token available to delete car');
  //     return;
  //   }


  //   const apiUrl = `https://rentcar.stepprojects.ge/api/Car/${carId}`;

  //   this.http
  //     .delete(apiUrl, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     })
  //     .subscribe({
  //       next: () => {
  //         console.log('Car deleted successfully');

  //         this.uploadedCars = this.uploadedCars.filter(
  //           (car) => car.id !== carId
  //         );
  //       },
  //       error: (err) => {
  //         console.error('Failed to delete car:', err);
  //         alert('მანქანის წაშლა ვერ მოხერხდა. გთხოვთ სცადოთ მოგვიანებით.');
  //       },
  //     });
  // }

  loadFavorites() {
    if (this.user?.phoneNumber) {
      this.favoriteService.getFavorite(this.user.phoneNumber).subscribe({
        next: (response) => {
          this.favorites = response;
        },
        error: error => {
          console.error(error.message);
        }
      });
    }
  }

  addFavorite(carId: number) {
    if (this.user?.phoneNumber) {
      this.favoriteService.postFavorite(this.user.phoneNumber, carId).subscribe({
        next: () => {
          console.log('Car added to favorites successfully');
          this.loadFavorites(); 
        },
        error: error => {
          console.error('Failed to add favorite:', error);
        }
      });
    }
  }

  // removeFavorite(car: Car) {
  //   this.favorites = this.favorites.filter((f) => f.id !== car.id);
  //   localStorage.setItem('favorites', JSON.stringify(this.favorites));
  // }
}