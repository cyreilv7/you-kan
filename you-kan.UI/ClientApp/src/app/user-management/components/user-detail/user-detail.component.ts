import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../../shared/material.module';
import { TextFieldModule } from '@angular/cdk/text-field';


@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [ MaterialModule, ReactiveFormsModule, TextFieldModule],
  providers: [],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css'
})
export class UserDetailComponent {
  @Input() user: any;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  userForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.user) {
      this.userForm.patchValue(this.user);
    }
  }

  onSubmit() {
    if (this.userForm.valid) {
      const updatedUser = {
        ...this.userForm.value,
      };
      this.save.emit(updatedUser);
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}