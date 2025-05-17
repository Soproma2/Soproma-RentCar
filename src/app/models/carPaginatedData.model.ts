import { Car } from './car.model';

export interface CarPaginatedData {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  data: Car[];
}
