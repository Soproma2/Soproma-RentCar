import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Soproma';

  constructor(private userService: UserService) {}

  ngOnInit() {
    // Check auth status on app load
    if (!this.userService.isLoggedIn()) {
      console.log('App initialization: User not authenticated');
    } else {
      console.log('App initialization: User is authenticated');
    }
  }
}
