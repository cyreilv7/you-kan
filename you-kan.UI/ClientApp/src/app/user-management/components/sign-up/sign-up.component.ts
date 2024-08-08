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
  selector: 'app-sign-up',
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
  providers: [provideNativeDateAdapter()],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent {
  // readonly dialogRef = inject(MatDialogRef<SignUpComponent>);
  readonly userService = inject(UsersService);
  public dialog = inject(MatDialog);
 // readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  @Input() user!: User;

  userForm = new FormGroup({
    first_name: new FormControl<string>('', [Validators.required]),
    last_name: new FormControl<string>('', [Validators.required]),
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    password: new FormControl<string>('', [Validators.required])
  });

  constructor(private authService: AuthService, private router: Router) {}


  cancel(): void {
    // exit logic here 
  }

  openUser(): void {
    const signUpRef = this.dialog.open(SignUpComponent);

    signUpRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
      }
    });
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

}
