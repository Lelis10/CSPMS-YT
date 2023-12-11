import { Component, OnInit } from '@angular/core';
import { AppService } from '@services/app.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router} from '@angular/router';
import { NotificationService } from '@services/notification.service';

@Component({
  selector: 'app-unirse-proyecto',
  templateUrl: './unirse-proyecto.component.html',
  styleUrls: ['./unirse-proyecto.component.scss']
})
export class UnirseProyectoComponent implements OnInit {
  nombres: string = '';
  apellidos: string = '';
  cedula: string = '';
  escuelas: { value: string, name: string }[] = [
    { value: 'ECMC', name: 'Escuela de Ciencias Matemáticas y Computacionales' },
    { value: 'ECQI', name: 'Escuela de Ciencias Químicas e Ingeniería' },
    { value: 'ECBI', name: 'Escuela de Ciencias Biológicas e Ingeniería' },
    { value: 'ECTEA', name: 'Escuela de Ciencias de La Tierra, Energia y Ambiente' }
  ];
  escuelaSeleccionada: string = '';
  semestres: string[] = ['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto', 'Séptimo', 'Octavo', 'Noveno', 'Décimo'];
  semestreSeleccionado: string = ''; // Aquí alma
  telefono: string = '';
  proyecto_id: number; // Agregar la variable para almacenar el proyecto_id
  archivoFormatoV2: File | null = null;
  user: number;
  estado: string = 'pendiente';

  constructor(private appService: AppService, private bsModalRef: BsModalRef, private toastr: ToastrService, private route: ActivatedRoute, private router: Router, private notificationService: NotificationService) {}


  ngOnInit(): void {
    this.proyecto_id = this.route.snapshot.queryParams['id'];
    console.log('proyecto_id:', this.proyecto_id);

    this.loadUser();
  }


  async loadUser() {
    try {
      await this.appService.getProfile();
      const user = this.appService.user.role;
      console.log('Usuario:', user);

      // Accede al rol del usuario con user.role
      if (user === 1) {
        console.log('Es usuario con role 1');
      } else if (user === 2 || user === 3) {
        console.log('Es usuario con role 2 o 3');
      } else {
        console.log('Es usuario con otro role');
      }
    } catch (error) {
      console.error('Error al obtener el perfil del usuario:', error);
    }
  }


  onInputToUpper(event: any) {
    const value = event.target.value;
    event.target.value = value.toUpperCase();
  }

  onFileChange(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.archivoFormatoV2 = files[0];
    } else {
      this.archivoFormatoV2 = null;
    }
  }

  async onSubmit() {
    try {
      const solicitudData = {
        nombres: this.nombres,
        apellidos: this.apellidos,
        cedula: this.cedula,
        escuela: this.escuelaSeleccionada,
        semestre: this.semestreSeleccionado,
        telefono: this.telefono,
        proyecto_id: this.proyecto_id, // Asegúrate de tener el proyecto_id definido en la componente
        FormatoV2: this.archivoFormatoV2.name,
        estado: this.estado
      };

      // Llamar al servicio para enviar la solicitud
      await this.appService.enviarSolicitud(solicitudData);
     

      // Aquí puedes agregar alguna lógica adicional después de enviar la solicitud, por ejemplo, mostrar un mensaje de éxito o cerrar el cuadro de diálogo.
      this.toastr.success('Solicitud enviada exitosamente');
      this.router.navigate(['/']);

    } catch (error) {
      // Aquí puedes manejar el error si ocurriera alguno al enviar la solicitud
      this.toastr.error('Error al enviar la solicitud');
      console.error(error);
    }
  }
}
