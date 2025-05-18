import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../services/user.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  private authCheckSubscription?: Subscription;
  private userSubscription?: Subscription;
  isMenuOpen = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {

    this.updateLoginStatus();

 
    this.userSubscription = this.userService.currentUser.subscribe((user) => {
      this.ngZone.run(() => {
        this.isLoggedIn = !!user || !!localStorage.getItem('token');
        console.log('Auth subject updated, logged in:', this.isLoggedIn);
      });
    });

   
    this.authCheckSubscription = interval(5000).subscribe(() => {
      this.updateLoginStatus();
    });


    window.addEventListener('focus', () => this.updateLoginStatus());
  }

  ngOnDestroy() {
    if (this.authCheckSubscription) {
      this.authCheckSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    window.removeEventListener('focus', () => this.updateLoginStatus());
  }

  updateLoginStatus() {
    const wasLoggedIn = this.isLoggedIn;
    const hasToken = !!localStorage.getItem('token');
    const explicitLoginFlag = localStorage.getItem('isLoggedIn') === 'true';

    this.ngZone.run(() => {
      this.isLoggedIn =
        hasToken || explicitLoginFlag || this.userService.isLoggedIn();
      console.log('Header login status updated:', this.isLoggedIn);

   
      if (wasLoggedIn && !this.isLoggedIn) {
        console.log('User was logged out, updating UI');
      }
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout(event: Event) {
    event.preventDefault();
    this.isMenuOpen = false;  // Close menu when logging out

    this.userService.logout();
    localStorage.removeItem('isLoggedIn');

 
    this.isLoggedIn = false;

 
    window.location.href = '/';
  }
}
