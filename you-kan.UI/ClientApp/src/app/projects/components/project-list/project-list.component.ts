import { CommonModule, NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../shared/material.module';
import { Project } from '../../models/project.model';
import { FormsModule } from '@angular/forms';
import { ProjectDetailComponent } from '../project-detail/project-detail.component';
import { NewProjectFormComponent } from '../new-project-form/new-project-form.component';
import { ProjectService } from '../../services/project.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { Sprint } from '../../../sprints/models/sprint.model';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../user-management/services/user.service';
import { SprintService } from '../../../sprints/services/sprint.service';
import { concatMap, of, switchMap } from 'rxjs';
import { User } from '../../../user-management/models/user.model';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, NgFor, NgIf, UpperCasePipe,
    ProjectDetailComponent, FormsModule],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css',
  animations: [
    trigger('detailExpand', [
      transition(':enter', [
        style({ height: '0', opacity: 0 }),
        animate('300ms', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms', style({ height: 0, opacity: 0 }))
      ])
    ])
  ]
})

export class ProjectListComponent implements OnInit {
  projectService = inject(ProjectService);
  sprintService = inject(SprintService);
  userService = inject(UserService);
  private dialog = inject(MatDialog);

  dataSource: Project[] = [];
  displayedColumns: string[] = ['name', 'actions'];
  selectedProject: any = null;


  ngOnInit(): void {
    this.setProjectList();
  }

  setProjectList() {
    this.projectService.getProjectsForUser().subscribe((projects) => {
      this.setProjectAttributes(projects);
      this.dataSource = projects;
    })
  }

  editProject(project: any) {
    this.selectedProject = { ...project };
  }

  saveProject(updatedProject: Project) {
    this.projectService.updateProject(updatedProject).pipe(
      switchMap(() => this.projectService.getProjectsForUser())
    ).subscribe((projects) => {
      this.setProjectAttributes(projects);
      this.dataSource = projects;
      this.selectedProject = null;
    })
  }

  cancelEdit() {
    this.selectedProject = null;
    this.setProjectList();
  }

  deleteProject(project: any) {
    if (confirm( "Are you sure you want to delete this project?")) {
    this.projectService.deleteProject(project.project_id).subscribe(() => {
      this.dataSource = this.dataSource.filter(p => p.project_id !== project.project_id);
      this.dataSource = [...this.dataSource];
    })
  }}

  addProject() {
    const dialogRef = this.dialog.open(NewProjectFormComponent, {
      width: '300px',
    });

    dialogRef
      .afterClosed()
      .pipe(
        concatMap(result => {
          if (result) {
            return this.projectService.createProject(result);
          } else {
            return of(null);
          }
        })
      ).subscribe(result => {
        if (result) {
          let newProj = { ...result } as Project;
          this.dataSource = [...this.dataSource, newProj];
          this.ngOnInit();
        }
      });
  }

  setProjectAttributes(projects: Project[]) {
    projects.forEach(proj => {
      this.fetchProjectSprints(proj);
    })
    projects.forEach(proj => {
      this.fetchProjectUsers(proj);
    })
  }

  fetchProjectUsers(project: Project) {
    this.projectService.getProjectCollaborators(project.project_id).subscribe((users: User[]) => {
      project.users = users;
    })
  }

  fetchProjectSprints(project: Project) {
    this.sprintService.getSprints(project.project_id).subscribe((sprints: Sprint[]) => {
      project.sprints = sprints;
    })
  }

}
