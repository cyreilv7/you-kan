import { Component, inject, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../shared/material.module'
import { User } from './../user-management/models/user.model';
import { UserService } from '../user-management/services/user.service';
import { Router } from '@angular/router';
import { AuthService } from '../user-management/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MaterialModule,
    ReactiveFormsModule,
    CommonModule
  ],
  providers: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  readonly userService = inject(UserService);
  @Input() user!: User;
  showForm: boolean = false;


  userForm = new FormGroup({
    first_name: new FormControl<string>('', [Validators.required]),
    last_name: new FormControl<string>('', [Validators.required]),
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    password: new FormControl<string>('', [Validators.required])
  });

  loginForm = new FormGroup({
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    password: new FormControl<string>('', [Validators.required])
  })

  constructor(private authService: AuthService, private router: Router) {
    this.authService.isLoggedIn.subscribe(response => {
      if (response === true) {
        this.router.navigate(['/task-board'])
      }
    })
  }

  submit() {
    if (this.userForm.valid) {
      const { first_name, last_name, email, password } = this.userForm.value;

      if (first_name && last_name && email && password) {
        this.authService.register({ first_name, last_name, email, password }).subscribe(
          response => {
            console.log('Registration successful', response);
            this.router.navigate(['/task-board']);
          },
          error => {
            console.error('Registration error', error);
          }
        );
      } else {
        console.error('Form fields are missing');
      }
    } else {
      console.log('Form is invalid');
    }
  }

  onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      if (email && password) {
        this.authService.login(email, password).subscribe(
          response => {
            console.log('Login successful', response);
            this.router.navigate(['/task-board']);
          },
          error => {
            console.error('Login error', error);
          }
        );
      } else {
        console.error('Email or password is missing');
      }
    } else {
      console.log('Form is invalid');
    }
  }

  toggleForm(event: Event) {
    event.preventDefault();
    this.showForm = !this.showForm;
  }

}