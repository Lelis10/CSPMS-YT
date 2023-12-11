import { Injectable } from '@angular/core';
import {
    CanActivate,
    CanActivateChild,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    UrlTree,
    Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { AppService } from '@services/app.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
    constructor(private router: Router, private appService: AppService) {}

    async canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean | UrlTree> {
        return this.checkAccess(next);
    }

    async canActivateChild(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean | UrlTree> {
        return this.canActivate(next, state);
    }

    async checkAccess(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
        // Verificar si el usuario está autenticado
        if (!this.appService.user) {
            await this.appService.getProfile();
        }

        if (!this.appService.user) {
            this.router.navigate(['/login']);
            return false;
        }

        
        if (route.routeConfig?.path === 'create-project') {
            // Agregar la lógica específica para 'create-project' aquí
            // Por ejemplo, verificar roles permitidos
            const rolesAllowed = route.data.rolesAllowed as Array<string>;
            const currentUserRole = await this.appService.getUserRole(); // Obtener el rol del usuario desde tu servicio

            if (!rolesAllowed.includes(currentUserRole.role)) {
                this.router.navigate(['/unauthorized']); // Redirigir a una página de acceso no autorizado
                return false;
            }
        }

        return true;
    }
}
