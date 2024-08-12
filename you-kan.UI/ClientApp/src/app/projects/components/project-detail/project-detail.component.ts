import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MaterialModule} from '../../../shared/material.module'
import { User } from '../../../user-management/models/user.model';
import { Sprint } from '../../../sprints/models/sprint.model';
import { SprintDetailComponent } from '../../../sprints/components/sprint-detail.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../user-management/services/user.service';
import { SprintService } from '../../../sprints/services/sprint.service';
import { concatMap, of, tap } from 'rxjs';
import { ProjectService } from '../../services/project.service';


@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css'
})
export class ProjectDetailComponent {
  private dialog = inject(MatDialog);
  private userService = inject(UserService);
  private sprintService = inject(SprintService);
  private projectService = inject(ProjectService);
  @Input() project: any;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  projectForm: FormGroup;
  availableUsers: User[] = [];
  projectUsers = signal<User[]>([]);
  projectSprints = signal<Sprint[]>([]);

  constructor(private fb: FormBuilder) {
    this.projectForm = this.fb.group({
      project_name: ['', Validators.required],
    });
  }

  ngOnInit() {
    // Combine the user fetching with the project data processing
    this.userService.getUsers().pipe(
      tap(users =>  {
        this.availableUsers = users
      }),
      tap(() => this.initializeProjectData())
    ).subscribe();
  }
  
  private initializeProjectData() {
    if (this.project) {
      if (this.project.users && this.project.users.length > 0) {
        const setOfCurrentUsers = new Set(this.project.users.map((u: User) => u.user_id));
        let filteredAvailableUsers = this.availableUsers.filter((u: User) => !setOfCurrentUsers.has(u.user_id));
        this.availableUsers = filteredAvailableUsers;
      }
  
      this.projectForm.patchValue(this.project);
      this.projectSprints.set(this.project.sprints ?? []);
      this.projectUsers.set(this.project.users ?? []);
    }
  }

  //Add user as collaborator on project
  addUser(user: User) {
    this.projectService.addProjectUser(this.project.project_id, user.user_id).subscribe(() => {
      if (this.projectUsers().length == 0) {
        this.projectUsers.set([user]);
        this.availableUsers = this.availableUsers.filter(u => u.user_id !== user.user_id);
      }
      else if (!this.projectUsers().find(u => u.user_id === user.user_id)) {
        this.projectUsers.set([...this.projectUsers(), user]);
        this.availableUsers = this.availableUsers.filter(u => u.user_id !== user.user_id);
      }
    })
  }

  //Remove user as collaborator on project
  removeUser(user: User) {
    this.projectService.removeProjectUser(this.project.project_id, user.user_id).subscribe(() => {
      this.projectUsers.set(this.projectUsers().filter(u => u.user_id !== user.user_id));
      this.availableUsers.push(user);
    })
  }

  onSubmit() {
    if (this.projectForm.valid) {
      if (this.projectForm.get('project_name')?.value === this.project.project_name) {
        this.cancel.emit()
      }
      else {
        const updatedProject = { ...this.projectForm.value, project_id: this.project.project_id};
        this.save.emit(updatedProject);
      }
    }
  }

  addSprint() {
    const dialogRef = this.dialog.open(SprintDetailComponent, {
      width: '300px',
      data: { projectId: this.project.project_id }
    });

    dialogRef.afterClosed()
      .pipe(
        concatMap(result => {
          if (result) {
            return this.sprintService.createSprint(result, this.project.project_id);
          } else {
            return of(null);
          }
        })
      ).subscribe(result => {
        if (result) {
          if (this.projectSprints().length == 0) {
            this.projectSprints.set([result])
          }
          else {
          this.projectSprints.update(sprints => {
           return [...sprints, result]
          });
        }
        }
      });
  }

  editSprint(editSprint: Sprint) {
    const dialogRef = this.dialog.open(SprintDetailComponent, {
      width: '300px',
      data: { projectId: this.project.project_id, sprint: editSprint }
    });

    dialogRef.afterClosed()
    .pipe(
      concatMap(result => {
        if (result) {
          return this.sprintService.updateSprint(result);
        } else {
          return of(null);
        }
      })
    ).subscribe(result => {
      if (result) {
        let newArray = this.projectSprints();
        const index = newArray.findIndex((s: Sprint) => s.sprint_id === editSprint.sprint_id);
        if (index !== -1) {
          let updateSprint = { ...editSprint, ...result };
          newArray[index] = updateSprint;
          this.projectSprints.set(newArray);
        }
      }
    });
  }

  deleteSprint(sprint: Sprint) {
    this.sprintService.deleteSprint(sprint.sprint_id).subscribe(() => {
      let newArray = this.projectSprints().filter(s => s.sprint_id !== sprint.sprint_id);
      this.projectSprints.set(newArray);
    })
  }

  onCancel() {
    this.cancel.emit();
  }
}
