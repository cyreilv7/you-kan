import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Task } from '../tasks/models/task.model';
import { ColumnComponent } from '../column/column.component';
import { TaskboardActionBarComponent } from '../taskboard-action-bar/taskboard-action-bar.component';
import { TaskCardComponent } from '../tasks/components/task-card/task-card.component';
import { TaskService } from '../tasks/services/task.service';
import { User } from '../user-management/models/user.model';
import { Sprint } from '../sprints/models/sprint.model';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [ColumnComponent, TaskCardComponent, TaskboardActionBarComponent, CdkDrag, CdkDropList, CdkDropListGroup,],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.css',
})

export class TaskBoardComponent implements OnInit {
  taskService = inject(TaskService);
  currentProjectUsers: User[] = [];
  currentProjectSprints: Sprint[] = [];

  //Signals that manage the state of the taskboard; could be moved to a service if desired
  allTasksForProject!: Task[];
  filterFormValues!: { sprint: number, priority: string, assignee: string };
  allTasksSignal = signal<Task[]>([]);
  backlogTasks = computed(() => this.allTasksSignal().filter(t => t.status == "Backlog"));
  committedTasks = computed(() => this.allTasksSignal().filter(t => t.status == "Committed"));
  developingTasks = computed(() => this.allTasksSignal().filter(t => t.status == "Developing"));
  testingTasks = computed(() => this.allTasksSignal().filter(t => t.status == "Testing"));
  doneTasks = computed(() => this.allTasksSignal().filter(t => t.status == "Done"));

  allTasksByStatus = computed(() => {
    return [{ status: "Backlog", tasks: this.backlogTasks() }, { status: "Committed", tasks: this.committedTasks() },
    { status: "Developing", tasks: this.developingTasks() }, { status: "Testing", tasks: this.testingTasks() }, { status: "Done", tasks: this.doneTasks() }
    ]
  })

  ngOnInit(): void {
    this.allTasksForProject = [];
  }

  //Handles dropping tasks into new columns, updates task status for dropped task
  onTaskDropped(event: CdkDragDrop<Task[]>, statusList: any) {
    if (event.previousContainer === event.container) {
      moveItemInArray(statusList.tasks, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      const task = event.container.data[event.currentIndex];
      task.status = statusList.status;

      this.updateTask(task);
    }
  }

  //Changing the project on the taskboard isn't a filter, it will fetch a new list
  handleProjectChange($event: any) {
    if ($event === null) {
      this.allTasksForProject = [];
      this.allTasksSignal.set(this.allTasksForProject);
    }
    else {
      let allTasksNewReference: Task[] = [];
      this.taskService.getTasksForProject($event).subscribe(
        (data: Task[]) => {
          this.allTasksForProject = data;
          allTasksNewReference = this.allTasksForProject;
          this.allTasksSignal.set(allTasksNewReference);
        }
      )
    }
  }

  //updates tasks on taskboard to filter by sprint, assignee, priority
  handleFiltersChange($event: any) {
    if ($event.sprint === null && $event.priority === null && $event.assignee === null) {
      this.allTasksSignal.set(this.allTasksForProject);
    }
    else {
      this.filterFormValues = $event;
      let allTasksFiltered: Task[] = this.allTasksForProject;

      if ($event.sprint !== null) {
        allTasksFiltered = allTasksFiltered.filter(task =>
          task.sprint_id === $event.sprint
        )
      }
      if ($event.priority !== null) {
        allTasksFiltered = allTasksFiltered.filter(task =>
          task.priority === $event.priority
        )
      }
      if ($event.assignee !== null) {
        allTasksFiltered = allTasksFiltered.filter(task =>
          task.assignee_user_id === $event.assignee
        )
      }
      this.allTasksSignal.set(allTasksFiltered);
    }
  }

  handleTaskCreated($event: Task) {
    const newTask = $event as Task;
    this.taskService.createTask(newTask).subscribe(
      (data: Task) => {
        newTask.task_id = data.task_id;
        this.allTasksForProject = [...this.allTasksForProject, newTask];
        this.allTasksSignal.update(tasks => [...tasks, newTask])
      })
  }

  deleteTask(task: any) {
    this.taskService.deleteTask(task.task_id).subscribe(() => {
      let newArray = this.allTasksForProject.filter((t) => t.task_id !== task.task_id);
      this.allTasksForProject = newArray;
      this.allTasksSignal.set(newArray);
    })
  }

  updateTask(task: any) {
    this.taskService.updateTask(task).subscribe((data: any) => {
      let updatedArray = this.allTasksForProject
        .filter((t) => t.task_id !== task.task_id)
        .concat(task);
      this.allTasksForProject = updatedArray;
      this.allTasksSignal.set(updatedArray);
    })
  }

  setProjectUsers($event: any) {
    this.currentProjectUsers = $event;
  }

  setProjectSprints($event: any) {
    this.currentProjectSprints = $event;
  }

}
