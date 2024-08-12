import { User } from "../../user-management/models/user.model";
import { Comment } from "./comment.model";

export interface Task {
    task_id?: number | null;
    task_title: string | null;
    task_description: string;
    task_type: string;
    priority: string;
    status: string;
    effort: number | null;
    sprint_id?: number | null;
    project_id: number | null;
    assignee_id?: number | null;
    comments? : Comment[];
}