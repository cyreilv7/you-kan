import { CommonModule, NgIf } from '@angular/common';
import { Component, EventEmitter, inject, signal, Input, OnInit, Output, computed } from '@angular/core';
import { MaterialModule } from '../../../shared/material.module';
import { Task } from '../../models/task.model';
import { MatDialog } from '@angular/material/dialog';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { User } from '../../../user-management/models/user.model';
import { UserService } from '../../../user-management/services/user.service';
import { Sprint } from '../../../sprints/models/sprint.model';
import { tap } from 'rxjs';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, MaterialModule, NgIf],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css'
})
export class TaskCardComponent implements OnInit {
  private dialog = inject(MatDialog);
  private userService = inject(UserService)
  assignee = signal<User | any>({});

  @Output() taskEdited = new EventEmitter<any>();
  @Output() taskDeleted = new EventEmitter<any>();
  @Input() usersForProject!: User[];
  @Input() sprintsForProject!: Sprint[];
  @Input() task!: Task;

  constructor() { }

  ngOnInit(): void {
    if (this.task.assignee_user_id) {
      this.userService.getUser(this.task.assignee_user_id).subscribe((user) => {
        this.assignee.set(user);
      })
    }
  }


  editDetail(editTask: Task) {
    const dialogRef = this.dialog.open(TaskDetailComponent, {
      width: '50vw',
      maxWidth: '50vw',
      height: '650px',
      maxHeight: '650px',
      panelClass: 'custom-dialog-class',
      data: {
        project_id: this.task.project_id, task: editTask,
        usersForProject: this.usersForProject, sprintsForProject: this.sprintsForProject
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let newTask = { ...editTask, ...result };

        this.userService.getUser(newTask.assignee_user_id).pipe(
          tap(user => {
            this.task.assignee_user_id = newTask.assignee_user_id;
            this.assignee.set(user);
          })
        ).subscribe(() => {
          this.taskEdited.emit(newTask);
          this.task = newTask;
        })
      }
    })
  }



  deleteTask(task: Task) {
    this.taskDeleted.emit(task);
  }

  taskIsBug(): boolean {
    return this.task.task_type == "Bug"
  }

  assigneeInitials(): string {
    if (!this.task.assignee_user_id) return '';

    const currentAssignee = this.assignee();
    if (!currentAssignee) return '';

    const firstInitial = currentAssignee.first_name ? currentAssignee.first_name[0].toUpperCase() : '';
    const lastInitial = currentAssignee.last_name ? currentAssignee.last_name[0].toUpperCase() : '';

    return `${firstInitial}${lastInitial}`;
  }

  private avatarColors = [
    'rgba(5, 13, 149, 0.89)',  // dark blue/purple
    'rgba(10, 60, 42, 0.89)',  // blue
    'rgba(109, 7, 87, 0.89)',  // dark pinkish
    'rgba(76, 9, 184, 0.89)'   // purple
  ];

  getAvatarColor(user_id: number): string {
    const colorIndex = user_id % this.avatarColors.length;
    return this.avatarColors[colorIndex];
  }

}