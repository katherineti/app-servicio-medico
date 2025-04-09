import { Component, inject, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { FeatherIconsModule } from '../feathericons/feathericons.module';
import { MatIconModule } from '@angular/material/icon';
import { NgOptimizedImage } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';
import { SwalService} from '../services/swal.service';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { UserCreateComponent } from '../user-create/user-create.component';
import { HeaderTitleComponent } from '../header-title/header-title.component';

export interface Element {
id: number;
imagePath: string;
name: string;
position: string;
productName: string;
budget: number;
priority: string;
username:string, 
email:string, 
isActive:boolean, 
rol:string, 
}
const PRODUCT_DATA: Element[] = [
{
id: 1,
// imagePath: 'assets/images/profile/user-1.jpg',
imagePath: 'https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
name: 'Sunil Joshi',
username:'usernameejemplo',
email: 'correo@gmail.com', 
isActive: false, 
rol: 'ADMIN', 
position: 'Web Designer',
productName: 'Elite Admin',
budget: 3.9,
priority: 'low',
},
{
id: 2,
// imagePath: 'assets/images/profile/user-2.jpg',
imagePath: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
name: 'Andrew McDownland',
username:'usernameejemplo',

email: 'correo@gmail.com', 
isActive: true, 
rol: 'ADMIN', 
position: 'Web Designer',
productName: 'Real Homes Theme',
budget: 24.5,
priority: 'medium',
},
{
id: 3,
imagePath: 'https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
name: 'Christopher Jamil',
username:'usernameejemplo',
email: 'correo@gmail.com', 
isActive: false, 
rol: 'ADMIN', 
position: 'Web Designer',
productName: 'MedicalPro Theme',
budget: 12.8,
priority: 'high',
},
{
id: 4,
imagePath: 'https://images.unsplash.com/flagged/photo-1570612861542-284f4c12e75f?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
name: 'Nirav Joshi',
username:'usernameejemplo',

email: 'correo@gmail.com', 
isActive: true, 
rol: 'ADMIN', position: 'Frontend Engineer',
productName: 'Hosting Press HTML',
budget: 2.4,
priority: 'critical',
},
{
id: 1,
// imagePath: 'assets/images/profile/user-1.jpg',
imagePath: 'https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
name: 'Sunil Joshi',
username:'usernameejemplo',
email: 'correo@gmail.com',
isActive: true, 
rol: 'ADMIN', 
position: 'Web Designer',
productName: 'Elite Admin',
budget: 3.9,
priority: 'low',
},
{
id: 2,
// imagePath: 'assets/images/profile/user-2.jpg',
imagePath: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
name: 'Andrew McDownland',
username:'usernameejemplo',

email: 'correo@gmail.com', 
isActive: true, 
rol: 'ADMIN', 
position: 'Web Designer',
productName: 'Real Homes Theme',
budget: 24.5,
priority: 'medium',
},
{
id: 3,
imagePath: 'https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
name: 'Christopher Jamil',
username:'usernameejemplo',

email: 'correo@gmail.com', 
isActive: true, 
rol: 'ADMIN', 
position: 'Web Designer',
productName: 'MedicalPro Theme',
budget: 12.8,
priority: 'high',
},
{
id: 4,
imagePath: 'https://images.unsplash.com/flagged/photo-1570612861542-284f4c12e75f?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
name: 'Nirav Joshi',
username:'usernameejemplo',

email: 'correo@gmail.com', 
isActive: true, 
rol: 'ADMIN', position: 'Frontend Engineer',
productName: 'Hosting Press HTML',
budget: 2.4,
priority: 'critical',
},
{
id: 1,
// imagePath: 'assets/images/profile/user-1.jpg',
imagePath: 'https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
name: 'Sunil Joshi',
username:'usernameejemplo',
email: 'correo@gmail.com',
isActive: true, 
rol: 'ADMIN', 
position: 'Web Designer',
productName: 'Elite Admin',
budget: 3.9,
priority: 'low',
},
{
id: 2,
// imagePath: 'assets/images/profile/user-2.jpg',
imagePath: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
name: 'Andrew McDownland',
username:'usernameejemplo',

email: 'correo@gmail.com', 
isActive: true, 
rol: 'ADMIN', 
position: 'Web Designer',
productName: 'Real Homes Theme',
budget: 24.5,
priority: 'medium',
},
{
id: 3,
imagePath: 'https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
name: 'Christopher Jamil',
username:'usernameejemplo',

email: 'correo@gmail.com', 
isActive: true, 
rol: 'ADMIN', 
position: 'Web Designer',
productName: 'MedicalPro Theme',
budget: 12.8,
priority: 'high',
},
{
id: 4,
imagePath: 'https://images.unsplash.com/flagged/photo-1570612861542-284f4c12e75f?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
name: 'Nirav Joshi',
username:'usernameejemplo',
email: 'correo@gmail.com', 
isActive: true, 
rol: 'ADMIN', 
position: 'Frontend Engineer',
productName: 'Hosting Press HTML',
budget: 2.4,
priority: 'critical',
},
{
id: 1,
// imagePath: 'assets/images/profile/user-1.jpg',
imagePath: 'https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
name: 'Sunil Joshi',
username:'usernameejemplo',
email: 'correo@gmail.com',
isActive: true, 
rol: 'ADMIN', 
position: 'Web Designer',
productName: 'Elite Admin',
budget: 3.9,
priority: 'low',
},
{
id: 2,
// imagePath: 'assets/images/profile/user-2.jpg',
imagePath: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
name: 'Andrew McDownland',
username:'usernameejemplo',
email: 'correo@gmail.com', 
isActive: true, 
rol: 'ADMIN', 
position: 'Web Designer',
productName: 'Real Homes Theme',
budget: 24.5,
priority: 'medium',
},
{
id: 3,
imagePath: 'https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
name: 'Christopher Jamil',
username:'usernameejemplo',

email: 'correo@gmail.com', 
isActive: true, 
rol: 'ADMIN', 
position: 'Web Designer',
productName: 'MedicalPro Theme',
budget: 12.8,
priority: 'high',
},
{
id: 4,
imagePath: 'https://images.unsplash.com/flagged/photo-1570612861542-284f4c12e75f?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
name: 'Nirav Joshi',
username:'usernameejemplo',

email: 'correo@gmail.com', 
isActive: true, 
rol: 'ADMIN', position: 'Frontend Engineer',
productName: 'Hosting Press HTML',
budget: 2.4,
priority: 'critical',
},
{
  id: 1,
  // imagePath: 'assets/images/profile/user-1.jpg',
  imagePath: 'https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  name: 'Sunil Joshi',
  username:'usernameejemplo',
  email: 'correo@gmail.com',
  isActive: true, 
  rol: 'ADMIN', 
  position: 'Web Designer',
  productName: 'Elite Admin',
  budget: 3.9,
  priority: 'low',
  },
  {
  id: 2,
  // imagePath: 'assets/images/profile/user-2.jpg',
  imagePath: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  name: 'Andrew McDownland',
  username:'usernameejemplo',

email: 'correo@gmail.com', 
isActive: true, 
rol: 'ADMIN', 
position: 'Web Designer',
  productName: 'Real Homes Theme',
  budget: 24.5,
  priority: 'medium',
  },
  {
  id: 3,
  imagePath: 'https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  name: 'Christopher Jamil',
  username:'usernameejemplo',

email: 'correo@gmail.com', 
isActive: true, 
rol: 'ADMIN', 
position: 'Web Designer',
  productName: 'MedicalPro Theme',
  budget: 12.8,
  priority: 'high',
  },
  {
  id: 4,
  imagePath: 'https://images.unsplash.com/flagged/photo-1570612861542-284f4c12e75f?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  name: 'Nirav Joshi',
  username:'usernameejemplo',

email: 'correo@gmail.com', 
isActive: true, 
rol: 'ADMIN', position: 'Frontend Engineer',
  productName: 'Hosting Press HTML',
  budget: 2.4,
  priority: 'critical',
  },
];
/**
* @title pagination table users
*/
@Component({
selector: 'app-users',
templateUrl: './users.component.html',
styleUrl: './users.component.scss',
imports: [
  CommonModule,
  FeatherIconsModule,
  MaterialModule,
  MatIconModule,
  NgOptimizedImage,
  HeaderTitleComponent
]
})
export class UsersComponent {

  displayedColumns = [ 'name', 'email','image','action'];
  dataSource = new MatTableDataSource<Element>(PRODUCT_DATA);

    imagenDeFondo = 'https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L3JtMzQ3LXBvcnBsYS0wMS1lXzEta2ttZDF2eTQuanBn.jpg';

  private swalService = inject(SwalService);
    
  constructor(breakpointObserver: BreakpointObserver, public dialog: MatDialog) {
    breakpointObserver.observe(['(max-width: 600px)']).subscribe((result) => {
    this.displayedColumns = result.matches
    ? [ 'name', 'email', 'isActive','action']
    : [ 'name', 'email', 'isActive', 'rol', 'image','action'];
    });
  }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator =
  Object.create(null);
  /**
  * Set the paginator after the view init since this component will
  * be able to query its view for the initialized paginator.
  */
  ngAfterViewInit(): void {
   this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialogEditUser(data?: any): void {
    const ref = this.dialog.open(UserDialogComponent, {
      data: data || null,
      disableClose: true
    });

    // ref.afterClosed().subscribe(() => {
    //   this.getAllUser(this.pageIndex, this.pageSize);
    // });
  }
  openDialogCreateUser(data?: any): void {
    const ref = this.dialog.open(UserCreateComponent, {
      data: data || null,
      disableClose: true
    });
  }

  async deleteuser(){
    const deleteAlert: SweetAlertResult<any> = await this.swalService.confirm('eliminar registro');

    if (deleteAlert.isConfirmed) {
      this.swalService.success();
    } else if (deleteAlert.dismiss === Swal.DismissReason.cancel) {
      /* cancel */
    }
  }
}