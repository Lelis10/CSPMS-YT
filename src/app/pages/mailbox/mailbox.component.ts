  // mailbox.component.ts
  import { Component, OnInit } from '@angular/core';
  import { AppService } from '@services/app.service';
  import { ToastrService } from 'ngx-toastr';
  import { ActivatedRoute, Router} from '@angular/router';

  @Component({
    selector: 'app-mailbox',
    templateUrl: './mailbox.component.html',
    styleUrls: ['./mailbox.component.scss']
  })
  export class MailboxComponent implements OnInit {
    // ...
    role: number;
    requests: any[] = [];
    proposals: any[] = [];


    constructor(private appService: AppService, private toastr: ToastrService, private route: ActivatedRoute, private router: Router) { }

    ngOnInit(): void {
      this.getUserRole();
      this.getAllRequests();
      this.getAllProposals();
    }

    async getUserRole() {
      try {
        // Llamar al método del servicio para obtener el user_id
        this.role = await this.appService.getUserRole();
        console.log('User role:', this.role);
      } catch (error) {
        this.toastr.error('Error al obtener el role');
        console.error(error);
      }
    }



    async getAllRequests() {
      try {
        this.requests = await this.appService.getAllRequests();
        console.log('Requests:', this.requests);
      } catch (error) {
        this.toastr.error('Error al obtener los proyectos');
        console.error(error);
      }
    }

    async getAllProposals() {
      try {
        this.proposals = await this.appService.getAllProposals();
        console.log('proposals:', this.proposals);
      } catch (error) {
        this.toastr.error('Error al obtener los proyectos');
        console.error(error);
      }
    }

    // Método para redirigir a la página "read-mail" y enviar los datos del mensaje
  goToReadMail(message: any) {
    // Puedes ajustar la ruta a "read-mail" según la estructura de tus rutas
    this.router.navigate(['/read-mail'], { state: { message } });
  }


  // Método para cambiar el cursor cuando el ratón entra en una fila
  changeCursorOnMouseOver(event: Event) {
    const target = event.target as HTMLElement;
    target.style.cursor = 'pointer';
  }

  // Método para restaurar el cursor cuando el ratón sale de una fila
  restoreCursorOnMouseOut(event: Event) {
    const target = event.target as HTMLElement;
    target.style.cursor = 'default';
  }

}
