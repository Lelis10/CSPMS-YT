import { Component, OnInit } from '@angular/core';
import { AppService } from '../../services/app.service';
import { ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-project-info',
  templateUrl: './project-info.component.html',
  styleUrls: ['./project-info.component.scss']
})
export class ProjectInfoComponent implements OnInit{
  activeTab: string = 'General';
  message: any;
  titulo: any;
  projects: any[] = [
    // Initial project data (can be empty)
  ];
  uploadedFiles: { name: string; url: string; iconClass: string }[] = [];
  
  constructor(private appService: AppService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.message = history.state.message;
    console.log('Mensaje recibido:', this.message);
    console.log('nombre_proyecto:', this.message.nombre_proyecto);
  }



  changeTab(tabName: string) {
    this.activeTab = tabName;
  }

  onFileSelected(event: any, project: any) {
    const file = event.target.files[0];
    if (file) {
      project.file = file;
    }
  }

  addNewFile() {
    this.projects.push({ file: null }); // Add an empty project with no file selected
  }
}
