import { Component, OnInit, Renderer2, OnDestroy, HostBinding } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, AbstractControl } from '@angular/forms';
import { AppService } from '@services/app.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  @HostBinding('class') class = 'register-box';

  public registerForm: UntypedFormGroup;
  public isAuthLoading = false;

  // Agregamos un arreglo con los roles y sus valores
  public roles = [
    { value: 'Estudiante', label: 'Estudiante' },
    { value: 'Profesor', label: 'Profesor' },
    { value: 'Administrativo', label: 'Administrativo' }
  ];

  constructor(
    private renderer: Renderer2,
    private toastr: ToastrService,
    private appService: AppService
  ) {}

  ngOnInit() {
    this.renderer.addClass(document.querySelector('app-root'), 'register-page');
    this.registerForm = new UntypedFormGroup({
      name: new UntypedFormControl(null, Validators.required),
      email: new UntypedFormControl(null, Validators.required),
      password: new UntypedFormControl(null, [Validators.required]),
      retypePassword: new UntypedFormControl(null, [Validators.required, this.passwordsMatchValidator.bind(this)]),
      role: new UntypedFormControl(null, Validators.required) // Agregamos el campo "role" al formulario
    });
  }

  async registerByAuth() {
    if (this.registerForm.valid) {
      this.isAuthLoading = true;
      await this.appService.registerByAuth(this.registerForm.value);
      this.isAuthLoading = false;
    } else {
      this.toastr.error('Form is not valid!');
    }
  }

  // Validador personalizado para verificar si las contraseñas coinciden
  passwordsMatchValidator(control: AbstractControl): { [key: string]: any } | null {
    const password = control.parent?.get('password')?.value;
    const retypePassword = control.value;

    return password === retypePassword ? null : { 'passwordsMismatch': true };
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.querySelector('app-root'), 'register-page');
  }
}
