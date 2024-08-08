import { Routes } from '@angular/router';
import { ProjectListComponent } from './projects/components/project-list/project-list.component';
import { UsersComponent } from './user-management/components/users/users.component';
import { TaskBoardComponent } from './task-board/task-board.component';

import { LoginComponent } from './user-management/components/login/login.component';
import { SignUpComponent } from './user-management/components/sign-up/sign-up.component';

// Testing 
import { RegisterComponent } from './register/register.component';
// import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'task-board', component: TaskBoardComponent },
    { path: 'users', component: UsersComponent },
    { path: 'projects', component: ProjectListComponent },
    { path: 'login', component: LoginComponent},
    { path: 'sign-up', component: SignUpComponent},

    /* Testing for registering, logging in, and for all routes with ensureLoggedin in backend.
        Can use this to refactor to standards. 
    */ 
    { path: 'register', component: RegisterComponent },
    // { path: 'login', component: LoginComponent },
    { path: 'logout', component: LogoutComponent }
];
