import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarService } from '../car.service';
import { Car } from '../models/car.model';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CarFilter, PopularityFilter } from '../models/carFilter.model';
import { FavoriteService } from '../services/favorite.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent implements OnInit {
  searchTerm: string = '';
  allCars: Car[] = [];
  filteredCars: Car[] = [];
  currentPage: number = 1;
  pageSize: number = 12;
  totalPages: number = 1;
  totalItems: number = 0;

  filter: CarFilter = {
    pageIndex: 1,
    pageSize: 12,
  };

  cities: string[] = [];

  years: number[] = [];
  currentYear = new Date().getFullYear();

  capacities: number[] = [2, 4, 5, 6, 7, 8];

  filtersApplied = false;

  popularityOptions = [
    { value: PopularityFilter.MOST_RENTED, label: 'ყველაზე ხშირად გაქირავებული' },
    { value: PopularityFilter.MOST_VIEWED, label: 'ყველაზე ნახვადი' },
    { value: PopularityFilter.BEST_RATED, label: 'საუკეთესო შეფასებით' }
  ];

  favorites: Car[] = [];  // Add this property

  constructor(
    private carService: CarService,
    private router: Router,
    private route: ActivatedRoute,
    private favoriteService: FavoriteService,
    private userService: UserService
  ) {
    this.years = Array.from(
      { length: this.currentYear - 1989 },
      (_, i) => 1990 + i
    );
  }

  ngOnInit(): void {
    this.loadCities();
    this.loadFavorites(); // Add this line

    this.route.queryParams.subscribe((params) => {
      this.filter.pageIndex = params['page'] ? parseInt(params['page']) : 1;
      this.filter.capacity = params['capacity']
        ? parseInt(params['capacity'])
        : undefined;
      this.filter.startYear = params['startYear']
        ? parseInt(params['startYear'])
        : undefined;
      this.filter.endYear = params['endYear']
        ? parseInt(params['endYear'])
        : undefined;
      this.filter.city = params['city'] || undefined;
      this.filter.popularity = params['popularity'];

      this.currentPage = this.filter.pageIndex;

      if (this.hasActiveFilters()) {
        this.filtersApplied = true;
        this.filterCars();
      } else {
        this.loadCarsPage(this.currentPage);
      }
    });
  }

  loadCities(): void {
    this.carService.getCities().subscribe({
      next: (cities) => {
        this.cities = cities;
      },
      error: (err) => {
        console.error('Error loading cities:', err);
      },
    });
  }

  loadCarsPage(page: number): void {
    this.filter.pageIndex = page;
    this.currentPage = page;

    if (this.filtersApplied) {
      this.filterCars();
      return;
    }

    this.carService.getCars(page, this.pageSize).subscribe({
      next: (response) => {
        console.log('API-დან მიღებული მონაცემები:', response);
        this.allCars = response.data || [];
        this.filteredCars = [...this.allCars];
        this.totalPages = response.totalPages;
        this.totalItems = response.totalItems;
        this.currentPage = response.currentPage;

        this.updateUrlWithPage(this.currentPage);
      },
      error: (err) => {
        console.error('შეცდომა მონაცემების ჩატვირთვისას:', err);
        this.allCars = [];
        this.filteredCars = [];
      },
    });
  }

  filterCars(): void {
    this.carService.filterCars(this.filter).subscribe({
      next: (response) => {
        console.log('გაფილტრული მონაცემები:', response);
        this.allCars = response.data || [];
        this.filteredCars = [...this.allCars];
        this.totalPages = response.totalPages;
        this.totalItems = response.totalItems;
        this.currentPage = response.currentPage;

        this.updateUrlWithFilters();
      },
      error: (err) => {
        console.error('შეცდომა ფილტრაციისას:', err);
        this.allCars = [];
        this.filteredCars = [];
      },
    });
  }

  applyFilters(): void {
    this.filtersApplied = this.hasActiveFilters();
    this.filter.pageIndex = 1;
    this.filterCars();
  }

  clearFilters(): void {
    this.filter = {
      pageIndex: 1,
      pageSize: 10,
    };
    this.filtersApplied = false;
    this.loadCarsPage(1);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: 1 },
      queryParamsHandling: '',
    });
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filter.capacity ||
      this.filter.startYear ||
      this.filter.endYear ||
      this.filter.city ||
      this.filter.popularity
    );
  }

  updateUrlWithPage(page: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge',
    });
  }

  updateUrlWithFilters(): void {
    const queryParams: any = { page: this.filter.pageIndex };
    if (this.filter.capacity) queryParams.capacity = this.filter.capacity;
    if (this.filter.startYear) queryParams.startYear = this.filter.startYear;
    if (this.filter.endYear) queryParams.endYear = this.filter.endYear;
    if (this.filter.city) queryParams.city = this.filter.city;
    if (this.filter.popularity) queryParams.popularity = this.filter.popularity;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: '',
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadCarsPage(page);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  searchCars(): void {
    console.log('ძებნის ტერმინი:', this.searchTerm);

    if (!this.searchTerm?.trim()) {
      this.clearFilters();
      return;
    }

    const term = this.searchTerm.trim().toLowerCase();
    this.filteredCars = this.allCars.filter((car) => {
      const brandMatch = car.brand?.toLowerCase().includes(term) ?? false;
      const modelMatch = car.model?.toLowerCase().includes(term) ?? false;
      return brandMatch || modelMatch;
    });

    console.log('გაფილტრული მანქანები:', this.filteredCars);
  }

  calculateCarPrice(car: Car): number {
    const price =
      typeof car.price === 'number'
        ? car.price
        : parseFloat(car.price as any) || 0;
    const multiplier =
      typeof car.multiplier === 'number'
        ? car.multiplier
        : parseFloat(car.multiplier as any) || 1;

    const finalMultiplier =
      isNaN(multiplier) || multiplier <= 0 ? 1 : multiplier;

    return price * finalMultiplier;
  }

  loadFavorites(): void {
    const user = this.userService.currentUserValue;
    if (user?.phoneNumber) {
      this.favoriteService.getFavorite(user.phoneNumber).subscribe({
        next: (response) => {
          this.favorites = response;
        },
        error: (error) => {
          console.error('Error loading favorites:', error);
        }
      });
    }
  }

  isFavorite(car: Car): boolean {
    return this.favorites.some(fav => fav.id === car.id);
  }

  toggleFavorite(car: Car): void {
    const user = this.userService.currentUserValue;
    if (!user) {
      alert('გთხოვთ გაიაროთ ავტორიზაცია');
      return;
    }

    if (this.isFavorite(car)) {
      console.log(`Removing car ${car.id} from favorites for user ${user.phoneNumber}`);
      this.favoriteService.removeFavorite(user.phoneNumber, car.id).subscribe({
        next: () => {
          console.log('Successfully removed from favorites');
          this.favorites = this.favorites.filter(f => f.id !== car.id);
          this.loadFavorites();
        },
        error: (error) => {
          console.error('Error removing favorite:', error);
          alert('ვერ მოხერხდა ფავორიტებიდან წაშლა');
        }
      });
    } else {
      // Add to favorites
      this.favoriteService.postFavorite(user.phoneNumber, car.id).subscribe({
        next: () => {
          console.log('Added to favorites');
          this.loadFavorites();
        },
        error: (error) => {
          console.error('Error adding favorite:', error);
          alert('ვერ მოხერხდა ფავორიტებში დამატება');
        }
      });
    }
  }
}
