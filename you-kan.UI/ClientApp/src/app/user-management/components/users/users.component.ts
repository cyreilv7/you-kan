import { CommonModule, NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MaterialModule } from '../../../shared/material.module';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { FormBuilder } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users-component',
  standalone: true,
  imports: [CommonModule, MaterialModule, NgFor, NgIf, UpperCasePipe, UserDetailComponent ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
  animations:[
    trigger('detailExpand', [
      transition(':enter', [
        style({ height: '0', opacity: 0 }),
        animate('300ms', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms', style({ height: 0, opacity: 0 }))
      ])
    ])
  ]
})
export class UsersComponent implements OnInit {
  private fb = inject(FormBuilder);
  userService = inject(UserService);

  dataSource: User[] = [];
  displayColumns: string[] = ['first_name', 'last_name', 'email', 'actions'];
  selectedUser: any = null;
  currentUserId: number = -1;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUserId.subscribe(newValue => {this.currentUserId = newValue});
    this.userService.getUsers().subscribe((users) => {
      this.dataSource = users;
    })
  }

  editUser(user: any) {
    this.selectedUser = { ...user }; 
    // Implement edit logic
  }

  saveUpdate(updatedUser: User) {
    this.userService.updateUser(updatedUser).subscribe(() =>  {
      const idx = this.dataSource.findIndex(u => u.user_id === this.currentUserId);
      if (idx !== -1) {
        this.dataSource[idx] = updatedUser;
        this.dataSource = [...this.dataSource];
        this.authService.userProfile.next(updatedUser);
    }
    this.selectedUser = null;
  })
}

  cancelEdit() {
    this.selectedUser = null;
  }

  deleteUser(user: any) {
    if (confirm( "Are you sure you want to delete this user? You will not be able to login with them if you do.")) {
    this.userService.deleteUser(user.user_id).subscribe(() => {
      this.dataSource = this.dataSource.filter(u => u.user_id !== user.user_id);
      this.dataSource = [...this.dataSource];
      this.authService.logout();
      this.authService.isLoggedIn.next(false);
      this.router.navigate(['/']);
    })

  }}

  logout() {
    this.authService.logout().subscribe(
      response => {
        console.log('Logout successful', response);
        this.authService.isLoggedIn.next(false);
        this.router.navigate(['/']);
      },
      error => {
        console.error('Logout error', error);
      }
    );
  }
  }
