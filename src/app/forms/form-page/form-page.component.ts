import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-form-page',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './form-page.component.html',
  styleUrl: './form-page.component.css',
})
export class FormPageComponent {
  useform: FormGroup;

  constructor(private fb: FormBuilder) {
    this.useform = this.fb.group({
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      phoneNumber: ['', [Validators.required, Validators.minLength(9)]],
    });
  }

  onSubmit() {
    if (this.useform.valid) {
      console.log('მონაცემები:', this.useform.value);
    } else {
      console.log('ფორმის შევსება ვერ მოხერხდა');
    }
  }
}
