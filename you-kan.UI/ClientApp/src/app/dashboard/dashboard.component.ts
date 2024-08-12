import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { MaterialModule } from '../shared/material.module'
import { AuthService } from '../user-management/services/auth.service';
import { MatDialogRef, MatDialog, MatDialogContent} from '@angular/material/dialog';
import { UserIconComponent } from './user-icon/user-icon.component';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MaterialModule, RouterModule, RouterOutlet, RouterLink, NgIf, MatDialogContent, UserIconComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {

  isLoggedIn: boolean=false;
  readonly dialogRef = inject(MatDialog);

  constructor(private authService: AuthService, private router: Router) {
    authService.isLoggedIn.subscribe(newValue => {this.isLoggedIn = newValue}); // tells dashboard we are logged in
  }

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

  openUserDetail() {
    this.dialogRef.open(UserIconComponent);
  }
}
