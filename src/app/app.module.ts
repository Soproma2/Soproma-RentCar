// ...existing imports...
import { NgModule } from '@angular/core';
import { RentalService } from './services/rental.service';

@NgModule({
  // ...existing configuration...
  providers: [
    // ...existing providers...
    RentalService
  ],
})
export class AppModule { }
