import { Component, OnInit } from '@angular/core';
import { AppService } from '@services/app.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements OnInit {
  projects: any[] = [];

  constructor(private appService: AppService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.getAllProjects();
  }

  async getAllProjects() {
    try {
      this.projects = await this.appService.getAllProjects();
      console.log('Projects:', this.projects);
    } catch (error) {
      this.toastr.error('Error al obtener los proyectos');
      console.error(error);
    }
  }
}