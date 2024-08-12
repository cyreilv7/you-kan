import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../user-management/services/auth.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.css'
})
export class LogoutComponent {

  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout().subscribe(
      response => {
        console.log('Logout successful', response);
        this.router.navigate(['/']);
      },
      error => {
        console.error('Logout error', error);
      }
    );
  }
}
