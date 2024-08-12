import { User } from "../../user-management/models/user.model";

export interface Comment {
    comment_id: number | null;
    task_id: number;
    comment_text: string;
    user_id?: number;
    user?: any;
}