import { Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {MaterialModule } from '../shared/material.module';
import { MatDialog } from '@angular/material/dialog';
import { TaskDetailComponent } from '../tasks/components/task-detail/task-detail.component';
import { Task } from '../tasks/models/task.model';
import { Project } from '../projects/models/project.model';
import { ProjectService } from '../projects/services/project.service';
import { User } from '../user-management/models/user.model';
import { UserService } from '../user-management/services/user.service';
import { Sprint } from '../sprints/models/sprint.model';
import { SprintService } from '../sprints/services/sprint.service';

@Component({
  selector: 'app-taskboard-action-bar',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './taskboard-action-bar.component.html',
  styleUrl: './taskboard-action-bar.component.css'
})
export class TaskboardActionBarComponent implements OnInit {
  private projectService = inject(ProjectService);
  private sprintService = inject(SprintService);
  private userService = inject(UserService);
  public dialog = inject(MatDialog);
  @Output() projectChanged = new EventEmitter<number>();
  @Output() taskboardFiltersChanged = new EventEmitter<any>();
  @Output() taskCreated = new EventEmitter<Task>();
  @Output() projectUsers = new EventEmitter<User[]>;

  projects!: Project[];
  selectedProjectId: number | null = null;
  sprintsForProject = signal<Sprint[]>([]);
  usersForProject = signal<User[]>([]);

  priorities = ['Low', 'Medium', 'High', 'Critical'];

  projectInput = new FormGroup({
    project: new FormControl<number | null>(null, [Validators.required]),
  });

  taskboardFilters = new FormGroup({
    sprint: new FormControl<number | null>(null),
    priority: new FormControl<string | null>(null),
    assignee: new FormControl<number | null>(null)
  });


  ngOnInit(): void {
    //TODO: Get project, sprint, assignee options and assign them to dropdowns
    this.loadProjects();
  
    this.taskboardFilters.valueChanges.subscribe(values =>
      this.taskboardFiltersChanged.emit(values)
    )
  }

  loadProjects() {
    this.projectService.getProjectsForUser().subscribe(
      (data: Project[]) => {
        this.projects = data;
      }
    );
  }

  //update task filters for project
  onProjectChange(event: any) {
    if (event.value == null) {
      this.selectedProjectId = null;
      this.taskboardFilters.reset();
      this.projectChanged.emit(event.value);
    }
    else {
      this.selectedProjectId = event.value;
      this.projectChanged.emit(event.value);
      this.taskboardFilters.reset();
      this.updateFiltersForProject(event.value);
    }
  }

  //opens dialog to create a new task
  addNewTask(): void {
    const dialogRef = this.dialog.open(TaskDetailComponent, {
      width: '50vw',
      maxWidth: '50vw',
      height: '650px',
      maxHeight: '650px',
      data: { project_id: this.selectedProjectId }
    });

    dialogRef.afterClosed().subscribe(result => {
      debugger;
      if (result) {
        const newTask: Task = {
          task_id: null, task_title: result.task_title, task_type: result.task_type, priority: result.priority,
          task_description: result.task_description, status: result.status,
          effort: result.effort, sprint_id: result.sprint_id ?? null, project_id: this.selectedProjectId
        }
        this.taskCreated.emit(newTask);
      }
    });
  }

  //gets the filter values for a project 
  updateFiltersForProject(id: number) {
    this.sprintService.getSprints(id).subscribe((sprints) => {
      if(sprints.length == 0) {
        this.sprintsForProject.set([]);
      }
      else {
      this.sprintsForProject.set(sprints);
      }
    })

    //TODO change to just get users in proj
    this.userService.getUsers().subscribe((userData) => {
      this.usersForProject.set(userData.data);
      this.projectUsers.emit(userData.data);
    })
  }

}
