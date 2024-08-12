import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MaterialModule } from '../../../shared/material.module';
import { Task } from '../../models/task.model';
import { MatDialog } from '@angular/material/dialog';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { User } from '../../../user-management/models/user.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css'
})
export class TaskCardComponent {
  private dialog = inject(MatDialog);
  @Output() taskEdited = new EventEmitter<any>();
  @Output() taskDeleted = new EventEmitter<any>();
  @Input() usersForProject!: User[];
  @Input() task!: any;

  constructor() {}

  editDetail(editTask: Task) {
    const dialogRef = this.dialog.open(TaskDetailComponent, {
      width: '50vw',
      maxWidth: '50vw',
      height: '650px',
      maxHeight: '650px',
      data: { project_id: this.task.project_id, task: editTask, usersForProject: this.usersForProject }
    });

    dialogRef.afterClosed().subscribe(result => {
      debugger;
      if (result) {
          this.task = { ...editTask, ...result };
          this.taskEdited.emit(editTask)
        
      }
    });
  }

  deleteTask(task: Task) {
    this.taskDeleted.emit(task);
  }

  taskIsBug(): boolean {
    return this.task.task_type == "Bug"
  }

}