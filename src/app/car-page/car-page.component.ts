import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CarService } from '../car.service';
import { CommonModule } from '@angular/common';
import { Car } from '../models/car.model';
import { FormsModule } from '@angular/forms';
import { RentalService, CarRental } from '../services/rental.service';

@Component({
  selector: 'app-car-page',
  templateUrl: './car-page.component.html',
  styleUrls: ['./car-page.component.css'],
  imports: [CommonModule, FormsModule],
})
export class CarPageComponent implements OnInit {
  car: Car | null = null;
  rentalDays: number = 1;
  pageIndex: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  isFavorite: boolean = false;

  constructor(
    private route: ActivatedRoute, 
    private carService: CarService, 
    private rentalService: RentalService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carService.getCarById(+id).subscribe((car) => {
        this.car = car;
        this.checkIfFavorite();
      });
    }
    this.loadCarsWithPagination();
  }

  checkIfFavorite(): void {
    if (this.car) {
      const favorites = this.getFavorites();
      this.isFavorite = favorites.some(fav => fav.id === this.car?.id);
    }
  }

  toggleFavorite(): void {
    if (!this.car) return;

    const favorites = this.getFavorites();
    
    if (this.isFavorite) {
      const index = favorites.findIndex(fav => fav.id === this.car?.id);
      favorites.splice(index, 1);
    } else {
      favorites.push(this.car);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    this.isFavorite = !this.isFavorite;
  }

  private getFavorites(): Car[] {
    const favoritesJson = localStorage.getItem('favorites');
    return favoritesJson ? JSON.parse(favoritesJson) : [];
  }

  loadCarsWithPagination(pageIndex: number = 1): void {
    this.pageIndex = pageIndex;
    this.carService
      .getCars(this.pageIndex, this.pageSize)
      .subscribe((response) => {
 
        this.totalPages = response.totalPages;

      });
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.loadCarsWithPagination(newPage);
    }
  }

  calculateTotalPrice(): number {
    if (this.car) {

      const price =
        typeof this.car.price === 'number'
          ? this.car.price
          : parseFloat(this.car.price as any);
      const multiplier =
        typeof this.car.multiplier === 'number'
          ? this.car.multiplier
          : parseFloat(this.car.multiplier as any) || 1;
      const days =
        typeof this.rentalDays === 'number'
          ? this.rentalDays
          : parseInt(this.rentalDays as any) || 1;

   
      const totalPrice = price * Math.max(multiplier, 1) * days;
      return Math.round(totalPrice * 100) / 100;
    }
    return 0;
  }

  rentCar(): void {
    if (this.car) {
      const rental: CarRental = {
        id: Date.now().toString(), // Add unique ID using timestamp
        car: {
          id: this.car.id, // Add this line
          brand: this.car.brand,
          model: this.car.model,
          city: this.car.city,
          imageUrl1: this.car.imageUrl1
        },
        totalPrice: this.calculateTotalPrice(),
        days: this.rentalDays,
        startDate: new Date(),
        endDate: new Date(Date.now() + this.rentalDays * 24 * 60 * 60 * 1000)
      };
      
      this.rentalService.addRental(rental);
      alert('მანქანა წარმატებით დაჯავშნილია!');
      this.router.navigate(['/profile']);
    }
  }
}
