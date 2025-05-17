import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserDTO } from '../../models/userDTO.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
        phoneNumber: ['', [Validators.required, Validators.minLength(9)]],
        role: ['User'], // Default role
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }


  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      form.get('confirmPassword')?.setErrors(null);
      return null;
    }
  }

  onSubmit() {
    if (this.registerForm.invalid) {

      Object.keys(this.registerForm.controls).forEach((key) => {
        this.registerForm.controls[key].markAsTouched();
      });
      this.errorMessage = 'გთხოვთ შეავსოთ ყველა აუცილებელი ველი';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';


    const user: UserDTO = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      phoneNumber: this.registerForm.value.phoneNumber,
      role: this.registerForm.value.role,
    };

    this.userService.register(user).subscribe({
      next: (response) => {
        console.log('რეგისტრაცია წარმატებულია:', response);
        this.successMessage =
          'რეგისტრაცია წარმატებით დასრულდა! გადამისამართება შესვლის გვერდზე...';


        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('რეგისტრაციის შეცდომა:', err);

        if (err.error?.errors) {
          // Format validation errors from API
          const errors = err.error.errors;
          this.errorMessage = Object.keys(errors)
            .map((key) => errors[key].join(', '))
            .join('\n');
        } else {
          this.errorMessage =
            'რეგისტრაციისას დაფიქსირდა შეცდომა. გთხოვთ სცადოთ მოგვიანებით.';
        }
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
