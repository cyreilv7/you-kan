import { CommonModule, NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatTableModule, } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Project } from '../../models/project.model';
import { User } from '../../../user-management/models/user.model';
import { FormsModule } from '@angular/forms';
import { ProjectDetailComponent } from '../project-detail/project-detail.component';
import { NewProjectFormComponent } from '../new-project-form/new-project-form.component';
import { ProjectService } from '../../services/project.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { Sprint } from '../../../sprints/models/sprint.model';
import { MatDialog } from '@angular/material/dialog';
import { UsersService } from '../../../user-management/components/users/users.service';
import { SprintService } from '../../../sprints/services/sprint.service';
import { concatMap, of } from 'rxjs';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, NgFor, NgIf, UpperCasePipe,
    ProjectDetailComponent, FormsModule, MatTableModule],
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
  userService = inject(UsersService);
  private dialog = inject(MatDialog);

  dataSource: Project[] = [];
  displayedColumns: string[] = ['name', 'actions'];
  selectedProject: any = null;


  ngOnInit(): void {
    this.projectService.getProjectsForUser().subscribe((projects) => {
      this.setProjectAttributes(projects);
      this.dataSource = projects;
    })
  }

  editProject(project: any) {
    this.selectedProject = { ...project };
    // Implement edit logic
  }

  saveProject(updatedProject: Project) {
    this.projectService.updateProject(updatedProject).subscribe(() => {
      const index = this.dataSource.findIndex(p => p.project_id === updatedProject.project_id);
      if (index !== -1) {
        this.dataSource[index] = updatedProject;
        this.dataSource = [...this.dataSource];
      }
      this.selectedProject = null;
    })
  }

  cancelEdit() {
    this.selectedProject = null;
  }

  deleteProject(project: any) {
    this.projectService.deleteProject(project.project_id).subscribe(() => {
      this.dataSource = this.dataSource.filter(p => p.project_id !== project.project_id);
      this.dataSource = [...this.dataSource];
    })
  }

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
      this.fetchProjectSprints(proj)
    })
  }

  fetchProjectUsers(project: Project) {
    //this needs to be an http request; endpoint doesnt exist yet

  }

  fetchProjectSprints(project: Project) {
    this.sprintService.getSprints(project.project_id).subscribe((sprints: Sprint[]) => {
      project.sprints = sprints;
    })
  }

}
