import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CarService } from '../car.service';
import { CommonModule } from '@angular/common';
import { Car } from '../models/car.model';
import { FormsModule } from '@angular/forms';
import { CarRentalService } from '../services/car-rental.service';
import { Ipurchase } from '../models/purchase.mode';
import { Observable } from 'rxjs';

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
  phoneNumber: number = 0;  // Add this property
  selectedImage: string = '';

  constructor(
    private route: ActivatedRoute, 
    private carService: CarService, 
    private carRentalService: CarRentalService,
    private router: Router
  ) {}

  carRental: Ipurchase[]=[]
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
    this.postCarRental()
  }

  setSelectedImage(imageUrl: string | undefined) {
    if (imageUrl) {
      this.selectedImage = imageUrl;
    }
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

  //  private setUserPhoneNumber(): void {

  //   if (this.userService.isLoggedIn()) {

  //     const currentUser = this.userService.currentUserValue;

  //     if (currentUser?.phoneNumber) {
  //       this.setPhoneNumberInForm(currentUser.phoneNumber);
  //     } else {

  //       try {
  //         const savedUserString = localStorage.getItem('currentUser');
  //         if (
  //           savedUserString &&
  //           savedUserString !== 'undefined' &&
  //           savedUserString !== 'null'
  //         ) {
  //           const savedUser = JSON.parse(savedUserString);
  //           if (savedUser?.phoneNumber) {
  //             this.setPhoneNumberInForm(savedUser.phoneNumber);
  //           }
  //         }
  //       } catch (error) {
  //         console.error('Error getting phone number from storage:', error);
  //         this.redirectToLogin();
  //       }
  //     }
  //   } else {
  //     console.log('User not logged in, redirecting to login');
  //     this.redirectToLogin();
  //   }
  // }

  // private setPhoneNumberInForm(phoneNumber: string): void {

  //   this.carForm.patchValue({
  //     ownerPhoneNumber: phoneNumber,
  //   });


  //   this.carForm.get('ownerPhoneNumber')?.disable();

  //   console.log('Phone number set and locked:', phoneNumber);
  // }



postCarRental() {
  if (this.car) {
    const purchase: Ipurchase = {
      carId: this.car.id,
      phoneNumber: this.phoneNumber,
      multiplier: this.car.multiplier
    };
    
    this.carRentalService.postPurchase().subscribe({
      next: (response: any) => {
        this.carRental.push(response as Ipurchase);
        console.log(response);
        this.router.navigate(['/profile']);
      },
      error: (error) => {
        console.error('Error posting rental:', error);
      }
    });
  }
}




}
