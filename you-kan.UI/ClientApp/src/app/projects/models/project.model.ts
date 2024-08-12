import { Sprint } from '../../sprints/models/sprint.model';
import { Task } from '../../tasks/models/task.model';
import { User } from '../../user-management/models/user.model';

export interface Project {
    project_id: number;
    project_name: string;
    users?: User[];
    sprints?: Sprint[];
    tasks?: Task[];
}