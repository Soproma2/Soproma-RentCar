import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;
  returnUrl: string = '/';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      phoneNumber: ['', [Validators.required, Validators.minLength(9)]],
    });
  }

  ngOnInit() {

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    console.log('Return URL after login will be:', this.returnUrl);
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'გთხოვთ შეავსოთ ყველა აუცილებელი ველი';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

   
    const loginData = {
      phoneNumber: this.loginForm.value.phoneNumber,
      password: this.loginForm.value.password,
 
      ...(this.loginForm.value.email
        ? { email: this.loginForm.value.email }
        : {}),
    };

    console.log('Attempting login with data:', loginData);

    this.userService.login(loginData).subscribe({
      next: (response) => {
        console.log('Login successful, response:', response);
        this.successMessage =
          'წარმატებით შეხვედით სისტემაში! გადამისამართება...';


        localStorage.setItem('isLoggedIn', 'true');

 
        setTimeout(() => {

          if (this.returnUrl && this.returnUrl !== '/') {
            window.location.href = this.returnUrl;
          } else {
            window.location.href = '/';
          }
        }, 1500);
      },
      error: (err) => {
        console.error('Login failed:', err);
        this.errorMessage = 'არასწორი მონაცემები. გთხოვთ სცადოთ თავიდან.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
