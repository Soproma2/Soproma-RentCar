import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CarService } from '../car.service';
import { CommonModule } from '@angular/common';
import { Car } from '../models/car.model';
import { FormsModule } from '@angular/forms';
import { CarRentalService } from '../services/car-rental.service';
import { Ipurchase } from '../models/purchase.mode';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';
 
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
  selectedImage: string = '';
  isProcessingRental: boolean = false;
  rentalError: string = '';
  rentalSuccess: boolean = false;
 
  constructor(
    private route: ActivatedRoute,
    private carService: CarService,
    private carRentalService: CarRentalService,
    private userService: UserService,
    private router: Router
  ) {}
 
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carService.getCarById(+id).subscribe((car) => {
        this.car = car;
        if (this.car) {
          this.selectedImage = this.car.imageUrl1;
        }
      });
    }
  }
 
  setSelectedImage(imageUrl: string | undefined) {
    if (imageUrl) {
      this.selectedImage = imageUrl;
    }
  }
 
  onImageError(event: any) {
   
    event.target.src = 'assets/images/car.jfif';
  }
 
  private getFavorites(): Car[] {
    const favoritesJson = localStorage.getItem('favorites');
    return favoritesJson ? JSON.parse(favoritesJson) : [];
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
 
  postCarRental() {
    if (!this.car) return;
 
  
    if (!this.userService.isLoggedIn()) {
      alert('გთხოვთ გაიაროთ ავტორიზაცია მანქანის დაჯავშნამდე');
      this.router.navigate(['/login']);
      return;
    }
 
    const currentUser = this.userService.currentUserValue;
    if (!currentUser?.phoneNumber) {
      alert(
        'მომხმარებლის მონაცემები არ არის ხელმისაწვდომი, გთხოვთ გაიაროთ ავტორიზაცია ხელახლა'
      );
      this.router.navigate(['/login']);
      return;
    }
 
    this.isProcessingRental = true;
    this.rentalError = '';
 
    this.carRentalService
      .postPurchase(currentUser.phoneNumber, this.car.id, this.car.multiplier)
      .subscribe({
        next: (response) => {
          console.log('Car rental successful:', response);
 
   
          const rental = {
            id: new Date().getTime().toString(),
            car: this.car as Car,
            totalPrice: this.calculateTotalPrice(),
            days: this.rentalDays,
            startDate: new Date(),
            endDate: new Date(
              new Date().setDate(new Date().getDate() + this.rentalDays)
            ),
          };
          this.carRentalService.saveRental(rental);
 
          this.rentalSuccess = true;
          setTimeout(() => {
            this.router.navigate(['/profile']);
          }, 1500);
        },
        error: (error) => {
          console.error('Error posting rental:', error);
          this.rentalError =
            error.error || 'დაჯავშნა ვერ მოხერხდა, გთხოვთ სცადოთ მოგვიანებით';
          this.isProcessingRental = false;
        },
        complete: () => {
          this.isProcessingRental = false;
        },
      });
  }
}