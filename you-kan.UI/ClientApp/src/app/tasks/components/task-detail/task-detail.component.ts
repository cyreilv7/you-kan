import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MaterialModule } from '../../../shared/material.module';
import { TextFieldModule } from '@angular/cdk/text-field';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { Sprint } from '../../../sprints/models/sprint.model';
import { SprintService } from '../../../sprints/services/sprint.service';
import { Comment } from '../../models/comment.model';
import { CommentService } from '../../services/comment.service';
import { User } from '../../../user-management/models/user.model';
import { UserService } from '../../../user-management/services/user.service';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [ ReactiveFormsModule, MaterialModule, NgIf,
    MatDialogContent, MatDialogActions, MatDialogTitle, TextFieldModule],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.css'
})
export class TaskDetailComponent implements OnInit {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<TaskDetailComponent>);
  readonly taskService = inject(TaskService);
  readonly sprintService = inject(SprintService);
  readonly commentService = inject(CommentService);
  readonly userService = inject(UserService);
  
  public data: { projectId: number, task?: Task, usersForProject: User[] } = inject(MAT_DIALOG_DATA);

  //ideally these would be in a reference table and we would use Ids insted of magic strings
  taskTypes: string[] = ['Feature','Bug'];
  taskEfforts: number[] = [1,2,3,4,5]
  priorities: string[] = ['Low','Medium','High','Critical'];
  taskStatuses: string[] = ['Backlog','Committed','Developing','Testing','Complete'];
  sprintsForProject!: Sprint[];
  usersForProject!: User[];

  @Output() taskDeleted = new EventEmitter();

  taskForm: FormGroup;
  newCommentForm: FormGroup;
  commentsForNewTask: Comment[] = [];
  taskUnderEdit!: Task;

  constructor() {
    this.taskForm = this.fb.group({
      task_title: [null, Validators.required],
      task_type: [null, Validators.required],
      task_description: [null],
      priority: [null, Validators.required],
      status: [null, Validators.required],
      effort: [null, Validators.required],
      sprint_id: [null],
      assignee_id: [null],
    });

    this.newCommentForm = this.fb.group({
      newComment: ['']
    });
  }


  ngOnInit() {
    if (this.data.task) {
      this.taskUnderEdit = this.data.task;

      this.taskForm.patchValue({
        task_title: this.data.task?.task_title,
        task_type: this.data.task?.task_type,
        task_description: this.data.task?.task_description,
        priority: this.data.task?.priority,
        status: this.data.task?.status,
        effort: this.data.task?.effort,
        sprint_id: this.data.task?.sprint_id ?? null,
        assignee_id: this.data.task?.assignee_id ?? null,
      });

      this.newCommentForm.setValue({
        newComment: ''
      });

      //get comments for task
      this.commentService.getCommentsForTask(this.taskUnderEdit.task_id).subscribe(
        (comments) => {
          this.taskUnderEdit.comments = comments ?? [];
          if (this.taskUnderEdit.comments.length > 0) {
            this.taskUnderEdit.comments.forEach(com => {
              com.user = this.findById(this.usersForProject, com.user_id)
            })
          }
        })

      //get sprint options for proj  
      this.sprintService.getSprints(this.data.projectId).subscribe((sprints) => {
        this.sprintsForProject = sprints;
      })

      this.usersForProject = this.data.usersForProject;
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.taskForm.valid) {
      this.dialogRef.close(this.taskForm.value); 
    }
  }

  deleteTask(): void {
    this.dialogRef.close(this.taskUnderEdit.task_id);
  }

  // getCommentCreatorName(comment: Comment): string {
  //   console.log(comment)
  //   return `${comment.user.first_name} ${comment.user.last_name[0]}`;
  // }

  //Comments will be handled separatel. y from Tasks as the Task endpoints don't accommodate complex objects
  addComment() {
    debugger;
    if (this.newCommentForm.get('newComment')?.value !== '') {
      let newComment = {comment_id: null, task_id: this.taskUnderEdit.task_id, comment_text: this.newCommentForm.get('newComment')?.value,  user_id: 6,};
      this.commentService.createComment(newComment).subscribe((com) => {
        this.taskUnderEdit?.comments?.push(com as Comment);
        this.newCommentForm.reset();
      })
    }
  }

  deleteComment(comment : Comment) {
    debugger;
    this.commentService.deleteComment(comment.comment_id).subscribe(() => {
      let newCommentList = this.taskUnderEdit.comments?.filter((c) => c.comment_id !== comment.comment_id );
      this.taskUnderEdit.comments = newCommentList;
    })
  }

  editComment(currentComment : Comment) {
    //will need to make http request here too to delete
    // this.commentService.
    // let newCommentList = this.taskUnderEdit.comments?.filter((c) => c.comment_id !== currentComment.comment_id );
    // this.taskUnderEdit.comments = newCommentList;
  }

  findById(users: User[], id: number | undefined): any {
    if (id == undefined) {
      return {};
    }
    return users.find(user => user.user_id === id);
  }
}
