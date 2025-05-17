import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.userService.isLoggedIn()) {

      return true;
    }


    console.log('Authentication failed, redirecting to login from:', state.url);
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
      queryParamsHandling: 'merge',
    });
    return false;
  }
}
