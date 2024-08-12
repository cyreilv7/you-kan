import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaskCardComponent } from '../tasks/components/task-card/task-card.component';
import { UpperCasePipe } from '@angular/common';
import { Task } from '../tasks/models/task.model';
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [TaskCardComponent, UpperCasePipe, CdkDropList],
  templateUrl: './column.component.html',
  styleUrl: './column.component.css'
})
export class ColumnComponent {
  @Input() status!: string;
  @Input() tasks!: Task[];
  @Output() taskDropped: EventEmitter<CdkDragDrop<Task[]>> = new EventEmitter();

  drop(event: CdkDragDrop<Task[]>) {
    this.taskDropped.emit(event);
  }

}
