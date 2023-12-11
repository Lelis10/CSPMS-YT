import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {MainComponent} from '@modules/main/main.component';
import {BlankComponent} from '@pages/blank/blank.component';
import {LoginComponent} from '@modules/login/login.component';
import {ProfileComponent} from '@pages/profile/profile.component';
import {RegisterComponent} from '@modules/register/register.component';
import {DashboardComponent} from '@pages/dashboard/dashboard.component';
import { ProjectsComponent } from '@pages/projects/projects.component';
import { CreateProjectComponent } from './pages/create-project/create-project.component';
import { UnirseProyectoComponent } from '@pages/unirse-proyecto/unirse-proyecto.component';
import { ProjectInfoComponent } from '@pages/project-info/project-info.component';
import { MailboxComponent } from '@pages/mailbox/mailbox.component'; 
import { ReadMailComponent } from '@pages/mailbox/read-mail/read-mail.component';


import {AuthGuard} from '@guards/auth.guard';
import {NonAuthGuard} from '@guards/non-auth.guard';
import {ForgotPasswordComponent} from '@modules/forgot-password/forgot-password.component';
import {RecoverPasswordComponent} from '@modules/recover-password/recover-password.component';
import {MainMenuComponent} from '@pages/main-menu/main-menu.component';
import {SubMenuComponent} from '@pages/main-menu/sub-menu/sub-menu.component';
import { from } from 'rxjs';
import { ReportsComponent } from '@pages/project-info/reports/reports.component';

const routes: Routes = [
    {
        path: '',
        component: MainComponent,
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        children: [
            {
                path: 'profile',
                component: ProfileComponent
            },
            {
                path: 'blank',
                component: BlankComponent
            },
            {
                path: 'sub-menu-1',
                component: SubMenuComponent
            },
            {
                path: 'sub-menu-2',
                component: BlankComponent
            },
            {
                path: '',
                component: DashboardComponent
            },
            {
                path: 'projects',
                component: ProjectsComponent
            },
            {
                path: 'create-project',
                component: CreateProjectComponent,
                data: {
                    rolesAllowed: ['Profesor', 'Administrativo'] 
                }
            },
            {
                path: 'join-project',
                component: UnirseProyectoComponent
            },

            {
                path: 'project-info',
                component: ProjectInfoComponent
            },
            {
                path: 'mailbox',
                component: MailboxComponent
            },
            {
                path: 'read-mail',
                component: ReadMailComponent
            },
            {
                path: 'reports',
                component: ReportsComponent
            }
        ]
    },
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [NonAuthGuard]
    },
    {
        path: 'register',
        component: RegisterComponent,
        canActivate: [NonAuthGuard]
    },
    {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        canActivate: [NonAuthGuard]
    },
    {
        path: 'recover-password',
        component: RecoverPasswordComponent,
        canActivate: [NonAuthGuard]
    },
    {path: '**', redirectTo: ''}
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {})],
    exports: [RouterModule]
})
export class AppRoutingModule {}
