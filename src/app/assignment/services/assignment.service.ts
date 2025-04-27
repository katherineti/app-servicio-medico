import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TokenService } from '../../services/Token.service';
import { Observable } from 'rxjs';
import { IEmployee } from '../intefaces/assignment.interface';
/*  interface ICreateAssignment {
  id?: number;
  employeeId: number;
  familyId?: number;
  type: number;
  observation: string;
                        // products: number;
  //numero de productos asignados a un empleado ?
  //id prod?
  createdAt?: Date;
  updatedAt?: Date;
} */
interface ICreateAssignment {
  id?: number;
  employeeId: number;
  familyId?: number;
  type: number;
  observation?: string;
  productId?:number;
  products: number;//numero de productos asignados a un empleado ?
  createdAt?: Date;
  updatedAt?: Date;
}
/* interface IAssignedProduct {
  id?: number;
  assignmentId: number;
  productId?:number; //id del producto ya asignado
  quantity: number; //stock actualizado del producto asignado
  createdAt?: Date;
  updatedAt?: Date;
} */

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);
  controller='assignment';

  constructor() { }
  createAssignment(assignment: ICreateAssignment): Observable<ICreateAssignment>{
    console.log("dto create" , assignment)
    return this.http.post<ICreateAssignment>(
      `${this.tokenService.endPoint}${this.controller}/create-assignment`,
      assignment
    );
  }
    getEmployees(): Observable<IEmployee[]> {
      return this.http.get<IEmployee[]>(
        `${this.tokenService.endPoint}${this.controller}/getAllEmployees`
      );
    }
    getFamilies(): Observable<any[]> {
      return this.http.get<any[]>(
        `${this.tokenService.endPoint}${this.controller}/getAllFamilies`
      );
    }
    getAllTypesAssignment(): Observable<any[]> {
      return this.http.get<any[]>(
        `${this.tokenService.endPoint}${this.controller}/getAllTypesAssignment`
      );
    }

}