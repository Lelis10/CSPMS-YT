import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Importar FormBuilder y FormGroup

import { AppService } from '@services/app.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss']
})
export class CreateProjectComponent implements OnInit {
  nombre_proyecto: string = '';
  escuela: string = '';
  director: string = '';
  descripcion: string = '';
  fechaCreacion: Date;
  fechaFinalizacion: Date;
  archivoFormatoV1: File | null = null;


  // Escuelas disponibles
  escuelas: { value: string, name: string }[] = [
    { value: 'ECMC', name: 'Escuela de Ciencias Matemáticas y Computacionales' },
    { value: 'ECQI', name: 'Escuela de Ciencias Químicas e Ingeniería' },
    { value: 'ECBI', name: 'Escuela de Ciencias Biológicas e Ingeniería' },
    { value: 'ECTEA', name: 'Escuela de Ciencias de La Tierra, Energia y Ambiente' }
  ];

  constructor(private appService: AppService, private bsModalRef: BsModalRef, private toastr: ToastrService, private route: ActivatedRoute, private router: Router, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.fechaCreacion = new Date(); // Inicializar con la fecha actual
    this.fechaFinalizacion = null; // Puedes dejarla como null si no tienes un valor predeterminado
  }



  onFileChange(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.archivoFormatoV1 = files[0];
    } else {
      this.archivoFormatoV1 = null;
    }
  }

  async onSubmit() {
    try {
      const formData = new FormData();
      formData.append('nombre_proyecto', this.nombre_proyecto);
      formData.append('escuela', this.escuela);
      formData.append('director', this.director);
      formData.append('descripcion', this.descripcion);
      formData.append('fechaCreacion', this.fechaCreacion.toString());
      formData.append('fechaFinalizacion', this.fechaFinalizacion.toString());
  
      if (this.archivoFormatoV1) {
        formData.append('FormatoV1', this.archivoFormatoV1, this.archivoFormatoV1.name);
      }
  
      await this.appService.enviarPropuesta(formData);

      // Aquí puedes agregar alguna lógica adicional después de enviar la solicitud, por ejemplo, mostrar un mensaje de éxito o cerrar el cuadro de diálogo.
      this.toastr.success('Propuesta enviada exitosamente');
      this.router.navigate(['/']);

    } catch (error) {
      // Aquí puedes manejar el error si ocurriera alguno al enviar la solicitud
      this.toastr.error('Error al enviar la propuesta');
      console.error(error);
    }
  }


}
