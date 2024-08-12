import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MaterialModule } from '../../shared/material.module';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { Sprint } from '../models/sprint.model';
import { SprintService } from '../services/sprint.service';
import { MatDatepickerModule } from '@angular/material/datepicker';


@Component({
  selector: 'app-sprint-detail',
  standalone: true,
  imports: [ MaterialModule, ReactiveFormsModule, MatDialogContent, MatDialogActions,
    MatDialogTitle,  TextFieldModule, MatDatepickerModule, MatNativeDateModule],
  providers: [MatDatepickerModule, MatNativeDateModule, provideNativeDateAdapter()],
  templateUrl: './sprint-detail.component.html',
  styleUrl: './sprint-detail.component.css'
})

export class SprintDetailComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<SprintDetailComponent>);
  readonly sprintService = inject(SprintService);
  public data: { projectId: number, sprint?: any } = inject(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);

  @Input() sprint!: Sprint;
  sprintForm!: FormGroup;

  constructor() {
    this.sprintForm = this.fb.group({
      sprint_name: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: [{ value: '', disabled: true }]
    });
  }

  ngOnInit() {
    if (this.data.sprint) {
      this.sprintForm.patchValue({
        sprint_name: this.data.sprint.sprint_name,
        start_date: this.data.sprint.start_date,
        end_date: this.data.sprint.end_date
      });
    }

    // Update end date 
    this.sprintForm.get('start_date')?.valueChanges.subscribe(date => {
      if (date) {
        const endDate = this.calculateEndDate(date);
        this.sprintForm.get('end_date')?.setValue(endDate);
        console.log(endDate)
      }
    });
  }

  //only mondays are selectable for sprint starts
  mondayFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    return day === 1;
  }

  calculateEndDate(startDate: Date): Date {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 11); // Add 11 days (2 weeks minus weekend)
    return endDate;
  }

  onSubmit() {
    if (this.sprintForm.valid) {
      this.dialogRef.close({
        ...this.sprintForm.value,
        sprint_id: this.data.sprint?.sprint_id ?? null,
        end_date: this.sprintForm.get('end_date')?.value,
        project_id: this.data.projectId
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
