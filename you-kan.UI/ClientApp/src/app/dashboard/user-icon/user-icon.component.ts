import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { User } from '../../user-management/models/user.model';
import { AuthService } from '../../user-management/services/auth.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-user-icon',
  standalone: true,
  imports: [ MaterialModule, ReactiveFormsModule, TextFieldModule, MatDialogContent, MatDialogActions, MatDialogTitle],
  providers: [],
  templateUrl: './user-icon.component.html',
  styleUrl: './user-icon.component.css'
})
export class UserIconComponent {
  @Input() user: any;
  @Output() cancel = new EventEmitter<void>();
  readonly dialogRef = inject(MatDialogRef<UserIconComponent>);
  userProfile?: {first_name: string, last_name: string, email: string};

  constructor(authService: AuthService, router: Router) {
    authService.userProfile.subscribe(newValue => {console.log(this.userProfile);
      this.userProfile = newValue}); 
  }; 

  onCancel() {
    this.dialogRef.close();
  }
}