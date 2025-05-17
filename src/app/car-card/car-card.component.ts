import { Component } from '@angular/core';
import { CarService } from '../car.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { Car } from '../models/car.model';

@Component({
  selector: 'app-car-card',
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './car-card.component.html',
  styleUrl: './car-card.component.css',
})
export class CarCardComponent {
  Cars: Car[] = [];
  editingCarId: number | null = null;

  constructor(private carService: CarService) {
    this.fetchCars();
  }

  ngOnInit(): void {
    this.carService.getCars().subscribe((response) => {
      this.Cars = response.data;
    });
  }

  fetchCars() {
    this.carService.getCars().subscribe((response) => {
      this.Cars = response.data;
    });
  }

  editCar(car: any) {
    this.editingCarId = car.id;
  }

  deleteCar(id: number) {
    this.carService.deleteCar(id).subscribe(() => {
      console.log('Car deleted');
      this.Cars = this.Cars.filter((car) => car.id !== id);
    });
  }

  resetForm() {
    this.editingCarId = null;
  }

  calculatePrice(car: Car): number {
    
    const price =
      typeof car.price === 'number'
        ? car.price
        : parseFloat(car.price as any) || 0;
    const multiplier =
      typeof car.multiplier === 'number'
        ? car.multiplier
        : parseFloat(car.multiplier as any) || 1;

    
    const effectiveMultiplier = Math.max(multiplier, 1);

    return price * effectiveMultiplier;
  }
}
