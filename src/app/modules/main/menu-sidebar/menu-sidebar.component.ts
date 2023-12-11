import { AppState } from '@/store/state';
import { UiState } from '@/store/ui/state';
import { Component, HostBinding, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppService } from '@services/app.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

const BASE_CLASSES = 'main-sidebar elevation-4';
@Component({
  selector: 'app-menu-sidebar',
  templateUrl: './menu-sidebar.component.html',
  styleUrls: ['./menu-sidebar.component.scss']
})
export class MenuSidebarComponent implements OnInit {
  @HostBinding('class') classes: string = BASE_CLASSES;
  public ui: Observable<UiState>;
  public userrole;
  public user;
  public menu = MENU;

  constructor(
    public appService: AppService,
    private store: Store<AppState>,
    private toastr: ToastrService // Inyecta ToastrService en el componente
  ) {}

  ngOnInit() {
    this.ui = this.store.select('ui');
    this.ui.subscribe((state: UiState) => {
      this.classes = `${BASE_CLASSES} ${state.sidebarSkin}`;
    });

    this.loadUser();
  }

  async loadUser() {
    try {
      await this.appService.getProfile();
      this.user = this.appService.user;
      this.userrole = this.appService.user.role;
      console.log(this.user);
    } catch (error) {
      console.error('Error loading user:', error);
      this.toastr.error('Error loading user. Please try again later.');
    }
  }


}

export const MENU = [
    {
        name: 'Dashboard',
        iconClasses: 'fas fa-tachometer-alt',
        path: ['/'],
    },
    {
        name: 'Projects',
        iconClasses: 'fas fa-file',
        children: [
            {
                name: 'Projects List',
                iconClasses: 'far fa-list-alt',
                path: ['/projects'],
            }
        ],
    },
    {
      name: 'Create Project',
      iconClasses: 'far fa-plus-square',
      path: ['/create-project'],

    },
    {
        name: 'Main Menu',
        iconClasses: 'fas fa-folder',
        children: [
            {
                name: 'Projects Info',
                iconClasses: 'far fa-address-book',
                path: ['/sub-menu-1'],
            },
        ],
    },
];
