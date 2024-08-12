export interface Sprint {
    sprint_id?: number;
    sprint_name: string;
    project_id: number;
    start_date: Date | string;
    end_date: Date | string;
}