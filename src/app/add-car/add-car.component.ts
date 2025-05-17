import { Component, OnInit } from '@angular/core';
import { CarService } from '../car.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-add-car',
  templateUrl: './add-car.component.html',
  styleUrls: ['./add-car.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class AddCarComponent implements OnInit {
  carForm: FormGroup;
  selectedImages: File[] = [];
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private carService: CarService,
    private userService: UserService,
    private router: Router,
    private http: HttpClient
  ) {
    this.carForm = this.fb.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      year: [
        '',
        [
          Validators.required,
          Validators.min(1900),
          Validators.max(new Date().getFullYear()),
        ],
      ],
      price: ['', [Validators.required, Validators.min(0)]],
      city: ['', Validators.required],
      transmission: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1)]],
      fuelCapacity: ['', [Validators.required, Validators.min(0)]],
      createdBy: ['User', Validators.required],
      createdByEmail: [
        'user@example.com',
        [Validators.required, Validators.email],
      ],
      ownerPhoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^\d{9}$/)],
      ],
      latitude: [0],
      longitude: [0],
      multiplier: [1, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {

    this.setUserPhoneNumber();
  }

  private setUserPhoneNumber(): void {

    if (this.userService.isLoggedIn()) {

      const currentUser = this.userService.currentUserValue;

      if (currentUser?.phoneNumber) {
        this.setPhoneNumberInForm(currentUser.phoneNumber);
      } else {

        try {
          const savedUserString = localStorage.getItem('currentUser');
          if (
            savedUserString &&
            savedUserString !== 'undefined' &&
            savedUserString !== 'null'
          ) {
            const savedUser = JSON.parse(savedUserString);
            if (savedUser?.phoneNumber) {
              this.setPhoneNumberInForm(savedUser.phoneNumber);
            }
          }
        } catch (error) {
          console.error('Error getting phone number from storage:', error);
          this.redirectToLogin();
        }
      }
    } else {
      console.log('User not logged in, redirecting to login');
      this.redirectToLogin();
    }
  }

  private setPhoneNumberInForm(phoneNumber: string): void {

    this.carForm.patchValue({
      ownerPhoneNumber: phoneNumber,
    });


    this.carForm.get('ownerPhoneNumber')?.disable();

    console.log('Phone number set and locked:', phoneNumber);
  }

  private redirectToLogin(): void {

    alert('გთხოვთ გაიაროთ ავტორიზაცია მანქანის დასამატებლად');
    this.router.navigate(['/login']);
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      this.selectedImages = [];
      this.errorMessage = '';
      
      if (files.length > 3) {
        this.errorMessage = 'მაქსიმუმ 3 სურათის ატვირთვაა შესაძლებელი';
        return;
      }
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Validating image ${i + 1}:`, {
          name: file.name,
          size: `${(file.size/1024/1024).toFixed(2)}MB`,
          type: file.type
        });
        

        if (file.size > 2 * 1024 * 1024) {
          this.errorMessage = `სურათი "${file.name}" ზომა (${(file.size/1024/1024).toFixed(1)}MB) აღემატება დასაშვებ ლიმიტს (2MB)`;
          return;
        }
        

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
          console.log(`Invalid file type: ${file.type} for file ${file.name}`);
          this.errorMessage = `სურათი "${file.name}" არასწორი ფორმატისაა (${file.type}). დასაშვებია მხოლოდ JPG და PNG`;
          return;
        }
        
        this.selectedImages.push(file);
      }
      console.log('Successfully validated images:', this.selectedImages.length);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.carForm.invalid || this.selectedImages.length === 0) {
      this.errorMessage = this.carForm.invalid ? 
        'გთხოვთ შეავსოთ ყველა საჭირო ველი' : 
        'გთხოვთ აირჩიოთ მინიმუმ ერთი სურათი';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const formData = new FormData();
      

      const rawValues = this.carForm.getRawValue();
      Object.keys(rawValues).forEach(key => {
        if (rawValues[key] !== null && rawValues[key] !== undefined) {

          const value = String(rawValues[key]).trim();
          switch(key) {
            case 'price':
            case 'year':
            case 'capacity':
            case 'fuelCapacity':
            case 'multiplier':
              formData.append(key, Number(value).toString());
              break;
            default:
              formData.append(key, value);
          }
        }
      });


      for (let i = 0; i < this.selectedImages.length; i++) {
        const file = this.selectedImages[i];
        try {
          const compressedBlob = await this.compressImage(file);
          const imageKey = `Images[${i}]`;
          formData.append(imageKey, compressedBlob, file.name);
        } catch (error) {
          console.error(`Error compressing image ${i + 1}:`, error);
          throw new Error(`სურათის დამუშავება ვერ მოხერხდა: ${file.name}`);
        }
      }


      this.carService.addCar(formData).subscribe({
        next: (response) => {
          console.log('Car added successfully:', response);
          const finalPrice = response.price * (response.multiplier || 1);
          this.successMessage = `მანქანა წარმატებით დაემატა! ფასი: ${finalPrice}₾ / დღე`;
          this.carForm.reset();
          this.selectedImages = [];
          setTimeout(() => this.router.navigate(['/']), 2000);
        },
        error: (err) => {
          console.error('Server Error:', err);
          
          if (err.status === 500) {
            this.errorMessage = 'სერვერის შეცდომა. გთხოვთ სცადოთ მოგვიანებით';
          } else if (err.error instanceof Error) {
            this.errorMessage = err.error.message;
          } else if (typeof err.error === 'string') {
            this.errorMessage = err.error;
          } else {
            this.errorMessage = 'დაფიქსირდა შეცდომა. გთხოვთ, შეამოწმეთ შეყვანილი მონაცემები';
          }
          
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } catch (err) {
      console.error('Form processing error:', err);
      this.errorMessage = err instanceof Error ? err.message : 'დაფიქსირდა შეცდომა დამუშავებისას';
      this.isSubmitting = false;
    }
  }

  private async compressImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1080;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                console.log(`Compressed ${file.name} from ${file.size/1024}KB to ${blob.size/1024}KB`);
                resolve(blob);
              } else {
                reject(new Error('Compression failed'));
              }
            },
            'image/jpeg',
            0.8
          );
        };
      };
      reader.onerror = reject;
    });
  }

  private async convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
}
