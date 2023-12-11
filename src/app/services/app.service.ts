    import { Injectable } from '@angular/core';
    import { Router } from '@angular/router';
    import { ToastrService } from 'ngx-toastr';
    import { HttpClient, HttpHeaders } from '@angular/common/http';
    import { Gatekeeper } from 'gatekeeper-client-sdk';
    import { environment } from '../../environments/environment';
    import { Observable } from 'rxjs';
    @Injectable({
        providedIn: 'root'
    })
    export class AppService {
        public user: any = null;
        private apiUrl = environment.apiUrl;

        constructor(private http: HttpClient, private router: Router, private toastr: ToastrService) {}

        async loginByAuth({ email, password }) {
            try {
              // Realizar la solicitud de inicio de sesión al backend
              const response: any = await this.http
                .post(`${this.apiUrl}/login`, { email, password })
                .toPromise();
        
              // Verificar si el backend respondió con un token válido
              if (!response.token) {
                throw new Error('No se recibió un token válido del servidor');
              }
        
              // Almacenar el token en el localStorage
              localStorage.setItem('token', response.token);
              
              // Obtener el perfil del usuario autenticado
              await this.getProfile();
        
              // Redireccionar a la página principal después del inicio de sesión
              this.router.navigate(['/']);
              this.toastr.success('Inicio de sesión exitoso');
            } catch (error) {
              // Mostrar el mensaje de error en un toast
              this.toastr.error('Correo electrónico o contraseña inválidos');
            }
          }

        async registerByAuth({ name, email, password, role }) {
            try {
              const body = { name, email, password, role }; // Agregamos el campo "role" al cuerpo de la solicitud
              const response: any = await this.http
                .post(`${this.apiUrl}/register`, body)
                .toPromise();
              this.router.navigate(['/login']);
              this.toastr.success('Register success');
            } catch (error) {
                this.toastr.error(error.message || 'Error al registrar el usuario');
            }
          }

          async getProfile() {
            try {
              const token = localStorage.getItem('token');
              if (!token) {
                throw new Error('No token found');
              }
              const headers = new HttpHeaders().set('x-access-token', token);
              this.user = await this.http.get<any>(`${this.apiUrl}/profile`, { headers }).toPromise();
            } catch (error) {
              this.logout();
              this.toastr.error(error.message || 'Error al obtener el perfil');
              throw error;
            }
          }

          async getUserRole() {
            try {
              const token = localStorage.getItem('token');
              if (!token) {
                throw new Error('No token found');
              }
              const headers = new HttpHeaders().set('x-access-token', token);
              // Realizar una solicitud al backend para obtener el user_id
              const response = await this.http.get<any>(`${this.apiUrl}/user_role`, { headers }).toPromise();
              return response;
            } catch (error) {
              this.toastr.error('Error al obtener el user_role');
              console.error(error);
              throw error;
            }
          }

          async getUserProjects() {
            try {
              const token = localStorage.getItem('token');
              if (!token) {
                throw new Error('No token found');
              }
              const headers = new HttpHeaders().set('x-access-token', token);
              return this.http.get<any[]>(`${this.apiUrl}/projects`, { headers }).toPromise();
            } catch (error) {
              this.toastr.error(error.message || 'Error al obtener los proyectos del usuario');
              throw error;
            }
          }

          
          
          async getAllProjects() {
            try {
              const token = localStorage.getItem('token');
              if (!token) {
                throw new Error('No token found');
              }
              const headers = new HttpHeaders().set('x-access-token', token);
              return this.http.get<any[]>(`${this.apiUrl}/all-projects`, { headers }).toPromise();
            } catch (error) {
              this.toastr.error(error.message || 'Error al obtener los proyectos');
              throw error;
            }
          }
          
          async enviarSolicitud(solicitudData: any) {
            try {
              const token = localStorage.getItem('token');
              if (!token) {
                throw new Error('No token found');
              }
        
              const headers = new HttpHeaders().set('x-access-token', token);
              await this.http.post(`${this.apiUrl}/guardar-solicitud`, solicitudData, { headers }).toPromise();
              // Utilizamos await para esperar a que la Promesa termine y luego continuamos con el código.
        
            } catch (error) {
              this.toastr.error(error.message || 'Error al enviar la solicitud');
              throw error;
            }
          }

          async enviarPropuesta(propuestaData: any) {
            try {
              const token = localStorage.getItem('token');
              if (!token) {
                throw new Error('No token found');
              }
        
              const headers = new HttpHeaders().set('x-access-token', token);
              await this.http.post(`${this.apiUrl}/propuesta`, propuestaData, { headers }).toPromise();
              // Utilizamos await para esperar a que la Promesa termine y luego continuamos con el código.
        
            } catch (error) {
              this.toastr.error(error.message || 'Error al enviar la solicitud');
              throw error;
            }
          }

          async getAllRequests() {
            try {
              const token = localStorage.getItem('token');
              if (!token) {
                throw new Error('No token found');
              }
              const headers = new HttpHeaders().set('x-access-token', token);
              return this.http.get<any[]>(`${this.apiUrl}/all-requests`, { headers }).toPromise();
            } catch (error) {
              this.toastr.error(error.message || 'Error al obtener los proyectos');
              throw error;
            }
          }

          async getAllProposals() {
            try {
              const token = localStorage.getItem('token');
              if (!token) {
                throw new Error('No token found');
              }
              const headers = new HttpHeaders().set('x-access-token', token);
              return this.http.get<any[]>(`${this.apiUrl}/all-proposals`, { headers }).toPromise();
            } catch (error) {
              this.toastr.error(error.message || 'Error al obtener los proyectos');
              throw error;
            }
          }

          // Cambiar el estado del proyecto a "aceptado"
          async aceptarProyecto(AceptarPropuesta: any) {
            try{
            const token = localStorage.getItem('token');
            if (!token) {
              throw new Error('No token found');
            }
            const headers = new HttpHeaders().set('x-access-token', token);
            await this.http.post(`${this.apiUrl}/aceptar-propuesta`, AceptarPropuesta, { headers }).toPromise();
            }catch (error) {
              this.toastr.error(error.message || 'Error al aceptar la propuesta');
              throw error;
            }
          }

          async aceptarSolicitud(AceptarSolicitud: any) {
            try{
            const token = localStorage.getItem('token');
            if (!token) {
              throw new Error('No token found');
            }
            const headers = new HttpHeaders().set('x-access-token', token);
            await this.http.post(`${this.apiUrl}/aceptar-solicitud`, AceptarSolicitud, { headers }).toPromise();
            }catch (error) {
              this.toastr.error(error.message || 'Error al aceptar la solicitud');
              throw error;
            }
          }

          // Eliminar un proyecto específico
          async rechazarProyecto(RechazarPropuesta: any) {
            try{
            const token = localStorage.getItem('token');
            if (!token) {
              throw new Error('No token found');
            }
            const headers = new HttpHeaders().set('x-access-token', token);
            await this.http.post(`${this.apiUrl}/rechazar-propuesta`, RechazarPropuesta, { headers }).toPromise();
            }catch (error) {
              this.toastr.error(error.message || 'Error al aceptar la propuesta');
              throw error;
            }
          }

          async rechazarSolicitud(RechazarSolicitud: any) {
            try{
            const token = localStorage.getItem('token');
            if (!token) {
              throw new Error('No token found');
            }
            const headers = new HttpHeaders().set('x-access-token', token);
            await this.http.post(`${this.apiUrl}/rechazar-solicitud`, RechazarSolicitud, { headers }).toPromise();
            }catch (error) {
              this.toastr.error(error.message || 'Error al aceptar la solicitud');
              throw error;
            }
          }
        

        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('gatekeeper_token');
            this.user = null;
            this.router.navigate(['/login']);
        }
    }
