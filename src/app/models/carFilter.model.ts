export enum PopularityFilter {
  MOST_RENTED = 'MOST_RENTED',
  MOST_VIEWED = 'MOST_VIEWED',
  BEST_RATED = 'BEST_RATED'
}

export interface CarFilter {
  capacity?: number;
  startYear?: number;
  endYear?: number;
  city?: string;
  pageIndex?: number;
  pageSize?: number;
  popularity?: PopularityFilter;
}
