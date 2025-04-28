import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TokenService } from '../../services/Token.service';
import { Observable } from 'rxjs';
import { IEmployee, IEmployeeFamily, ITypesAssignment } from '../intefaces/assignment.interface';

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

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);
  controller='assignment';
  
  constructor() { }
  createAssignment(assignment: ICreateAssignment): Observable<ICreateAssignment>{
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

    getFamiliesByEmployee(id: number): Observable<IEmployeeFamily[]> {
      return this.http.get<IEmployeeFamily[]>(
        `${this.tokenService.endPoint}${this.controller}/getFamiliesByEmployee/${id}`
      );
    }
    getAllTypesAssignment(): Observable<ITypesAssignment[]> {
      return this.http.get<ITypesAssignment[]>(
        `${this.tokenService.endPoint}${this.controller}/getAllTypesAssignment`
      );
    }
}