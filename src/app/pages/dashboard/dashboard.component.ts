import { Component, OnInit } from '@angular/core';
import { AppService } from '../../services/app.service';
import { ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  projects: any[] = [];
  dataLoaded: boolean = false; // Agregamos la bandera dataLoaded
  schoolLogos: any = {
    ECMC: 'assets/img/logo-escuela-matematicas.png',
    ECQI: 'assets/img/quim.png',
    ECBI: 'assets/img/bio.png',
    ECFN: 'assets/img/fis.png',
    ECTEA: 'assets/img/geo.png'
  };

  constructor(private appService: AppService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.getUserProjects();
  }


  async getUserProjects() {
    try {
      this.projects = await this.appService.getUserProjects();
      console.log("Msg:", this.projects);
      this.dataLoaded = true;
    } catch (error) {
      console.error('Error al obtener los proyectos del usuario: ', error);
      // Manejo de errores
    }
  }

  onJoinProjectClick() {
    // Aquí puedes implementar la lógica para redirigir al usuario a la página de registro de proyectos o lo que desees.
    // Por ejemplo, puedes usar el router de Angular para navegar a la página de registro de proyectos.
    // this.router.navigate(['/join-project']); // Asegúrate de importar el Router en la parte superior del archivo
  }

  goToMoreInfo(message: any) {
    // Puedes ajustar la ruta a "read-mail" según la estructura de tus rutas
    this.router.navigate(['/project-info'], { state: { message } });
  }

    // Método para obtener las clases de Bootstrap según la escuela
    getSchoolStyle(school: string): string[] {
        switch (school) {
        case 'ECMC':
            return ['bg-danger'];
        case 'ECQI':
            return ['bg-info'];
        case 'ECBI':
            return ['bg-success'];
        case 'ECFN':
            return ['bg-warning'];
        case 'ECTEA':
            return ['bg-brown'];
        default:
            return ['bg-white']; // Opcional, clase por defecto
        }
    }
}
