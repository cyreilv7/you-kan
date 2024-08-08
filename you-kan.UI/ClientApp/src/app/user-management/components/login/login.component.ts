import { ChangeDetectionStrategy, Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
// import { InputOption } from '../shared/input-option.model';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { User } from '../../models/user.model';
import { UsersService } from '../users/users.service';

import { Router } from '@angular/router';
import { AuthService } from '../../../auth.service';
import { CommonModule } from '@angular/common'; // needed for *ngIf

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatCardModule, 
    MatFormFieldModule, 
    ReactiveFormsModule, 
    MatInputModule, 
    MatSelectModule, 
    MatDialogContent, 
    MatDialogActions, 
    MatDialogTitle, 
    MatButtonModule, 
    TextFieldModule, 
    MatDatepicker, 
    MatDatepickerModule, 
    MatNativeDateModule, 
    MatIcon,
    CommonModule
  ], 
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class LoginComponent {

  loginForm = new FormGroup({
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    password: new FormControl<string>('', [Validators.required])
  })
  
  constructor(private authService: AuthService, private router: Router) {}

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

  cancel(): void {
    // exit logic here
  }

}