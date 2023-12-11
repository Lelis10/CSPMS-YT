import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService } from '@services/app.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-read-mail',
  templateUrl: './read-mail.component.html',
  styleUrls: ['./read-mail.component.scss']
})
export class ReadMailComponent implements OnInit {
  message: any; // Variable para almacenar el mensaje recibido
  formatoV1URL: string;
  role: number;
  constructor(private route: ActivatedRoute, private appService: AppService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
    // Obtener el mensaje enviado desde la página anterior
    this.message = history.state.message;
    this.getUserRole();
    console.log('Mensaje recibido:', this.message); // Agregar el console.log aquí
    // Procesar el archivo "FormatoV1" si existe
    if (this.message.FormatoV1) {
      this.formatoV1URL = this.message.FormatoV1;
    }

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

  async aceptarProyecto() {
    try {
      const AceptarPropuesta = {
        projectId: this.message.id
      };

      // Llamar al servicio para enviar la solicitud
      await this.appService.aceptarProyecto(AceptarPropuesta);

      // Aquí puedes agregar alguna lógica adicional después de enviar la solicitud, por ejemplo, mostrar un mensaje de éxito o cerrar el cuadro de diálogo.
      this.toastr.success('Propuesta aceptada exitosamente');
      this.router.navigate(['/mailbox']);

    } catch (error) {
      // Aquí puedes manejar el error si ocurriera alguno al enviar la solicitud
      this.toastr.error('Error al aceptar la propuesta');
      console.error(error);
    }
  }

  async aceptarSolicitud() {
    try {
      const AceptarSolicitud = {
        projectId: this.message.proyecto_id,
        user_id: this.message.user_id
      };
      console.log("msg:", this.message.proyecto_id);
      // Llamar al servicio para enviar la solicitud
      await this.appService.aceptarSolicitud(AceptarSolicitud);

      // Aquí puedes agregar alguna lógica adicional después de enviar la solicitud, por ejemplo, mostrar un mensaje de éxito o cerrar el cuadro de diálogo.
      this.toastr.success('Propuesta aceptada exitosamente');
      this.router.navigate(['/mailbox']);

    } catch (error) {
      // Aquí puedes manejar el error si ocurriera alguno al enviar la solicitud
      this.toastr.error('Error al aceptar la propuesta');
      console.error(error);
    }
  }


  // Función para eliminar el proyecto
  async rechazarProyecto() {
    try {
      const RechazarPropuesta = {
        projectId: this.message.id
      };

      // Llamar al servicio para enviar la solicitud
      await this.appService.rechazarProyecto(RechazarPropuesta);

      // Aquí puedes agregar alguna lógica adicional después de enviar la solicitud, por ejemplo, mostrar un mensaje de éxito o cerrar el cuadro de diálogo.
      this.toastr.success('Propuesta rechazada exitosamente');
      this.router.navigate(['/mailbox']);

    } catch (error) {
      // Aquí puedes manejar el error si ocurriera alguno al enviar la solicitud
      this.toastr.error('Error al aceptar la propuesta');
      console.error(error);
    }
  }

  async rechazarSolicitud() {
    try {
      const RechazarSolicitud = {
        projectId: this.message.id
      };

      // Llamar al servicio para enviar la solicitud
      await this.appService.rechazarSolicitud(RechazarSolicitud);

      // Aquí puedes agregar alguna lógica adicional después de enviar la solicitud, por ejemplo, mostrar un mensaje de éxito o cerrar el cuadro de diálogo.
      this.toastr.success('Propuesta aceptada exitosamente');
      this.router.navigate(['/mailbox']);

    } catch (error) {
      // Aquí puedes manejar el error si ocurriera alguno al enviar la solicitud
      this.toastr.error('Error al aceptar la propuesta');
      console.error(error);
    }
  }

  getAttachmentFileName(attachment: any): string {
    // Aquí puedes personalizar la lógica para obtener el nombre de archivo
    // basado en el tipo de archivo o cualquier otra propiedad del objeto `attachment`.
    // En este ejemplo, estamos devolviendo simplemente 'FormatoV1' como el nombre de archivo.
    return 'FormatoV1';
  }
}
