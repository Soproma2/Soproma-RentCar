import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UserDTO } from '../models/userDTO.model';
import { Users } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'https://rentcar.stepprojects.ge/api/Users';
  private currentUserSubject: BehaviorSubject<Users | null> =
    new BehaviorSubject<Users | null>(null);
  public currentUser: Observable<Users | null> =
    this.currentUserSubject.asObservable();
  private tokenCheckInterval: any;

  constructor(private http: HttpClient) {
    this.initUserFromStorage();
    this.startTokenValidityCheck();
  }

  private initUserFromStorage(): void {
    try {
      const savedUserString = localStorage.getItem('currentUser');

      if (
        savedUserString &&
        savedUserString !== 'undefined' &&
        savedUserString !== 'null'
      ) {
        const savedUser = JSON.parse(savedUserString);
        this.currentUserSubject.next(savedUser);
        console.log('User loaded from storage:', !!savedUser);
      } else {
        console.log('No valid user data in storage');
      }
    } catch (error) {
      console.error('Error loading user data from localStorage:', error);

      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
  }

  register(user: UserDTO): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user);
  }

  login(user: Partial<UserDTO>): Observable<any> {
    console.log('Login attempt with:', user);

    return this.http.post<any>(`${this.apiUrl}/login`, user).pipe(
      tap({
        next: (response) => {
          console.log('Login API response:', response);

          if (response && response.token) {
            try {
              localStorage.setItem('token', response.token);

              if (response.user) {
                const userJson = JSON.stringify(response.user);
                localStorage.setItem('currentUser', userJson);
                this.currentUserSubject.next(response.user);
                console.log(
                  'User data stored successfully. Auth state updated.'
                );
              } else {
                // After login succeeded but no user data was returned,
                // immediately fetch complete user details
                this.getUserDetails().subscribe({
                  next: (userData) => {
                    console.log('Fetched complete user profile after login');
                  },
                  error: (err) => {
                    console.error(
                      'Failed to fetch user details after login:',
                      err
                    );

                    // Still create a minimal user object as fallback
                    const minimalUser = {
                      phoneNumber: user.phoneNumber,
                    } as Users;
                    localStorage.setItem(
                      'currentUser',
                      JSON.stringify(minimalUser)
                    );
                    this.currentUserSubject.next(minimalUser);
                    console.log(
                      'Created minimal user profile. Auth state updated.'
                    );
                  },
                });
              }
            } catch (error) {
              console.error('Storage error during login:', error);

              if (response.user) {
                this.currentUserSubject.next(response.user);
              }
            }
          } else {
            console.warn('Login response missing token');
          }
        },
        error: (error) => {
          console.error('Login request failed:', error);
        },
      })
    );
  }

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    console.log('User logged out');
  }

  public get currentUserValue(): Users | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    try {
      const hasToken = !!localStorage.getItem('token');
      const hasUser =
        !!this.currentUserValue || !!localStorage.getItem('currentUser');
      const isLoggedIn = hasToken && hasUser;
      console.log(
        `Auth check: hasToken=${hasToken}, hasUser=${hasUser}, isLoggedIn=${isLoggedIn}`
      );
      return isLoggedIn;
    } catch (e) {
      console.error('Error checking login status:', e);
      return false;
    }
  }

  private startTokenValidityCheck(): void {
    this.tokenCheckInterval = setInterval(() => {
      this.checkAndUpdateAuthStatus();
    }, 30000);
  }

  private checkAndUpdateAuthStatus(): void {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No auth token found, logging out');
        this.logout();
        return;
      }

      if (this.isTokenExpired(token)) {
        console.log('Auth token expired, logging out');
        this.logout();
      }
    } catch (error) {
      console.error('Error checking token validity:', error);
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        return false;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      if (!payload.exp) {
        return false;
      }

      return payload.exp * 1000 < Date.now();
    } catch (e) {
      return false;
    }
  }

  /**
   * Gets current user details from the server
   * @returns Observable with the user details
   */
  getUserDetails(): Observable<Users> {
    const token = localStorage.getItem('token');
    const currentUser = this.currentUserValue;

    // We need the phone number to make the API call
    if (!token || !currentUser?.phoneNumber) {
      return new Observable((observer) => {
        observer.error('No authentication token or phone number available');
        observer.complete();
      });
    }

    // Use the correct endpoint: /api/Users/{phoneNumber}
    return this.http
      .get<Users>(
        `${this.apiUrl}/${encodeURIComponent(currentUser.phoneNumber)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .pipe(
        tap((user) => {
          if (user) {
            console.log('Received user data from API:', user);
            // Update stored user
            localStorage.setItem('currentUser', JSON.stringify(user));
            // Update the BehaviorSubject
            this.currentUserSubject.next(user);
          }
        })
      );
  }

  ngOnDestroy(): void {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
  }
}
