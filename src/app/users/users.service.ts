import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../services/Token.service';
import { ICreateUserDTO, IGetAllUsers, IUser } from './users.interface';

@Injectable({
  providedIn: 'root',
})

export class UsersService {
  
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);

  getUsers(params: IGetAllUsers): Observable<any> {
    return this.http.post<IUser[]>(
      `${this.tokenService.endPoint}users/getAll`,
      params
    );
  }

  createUser(dto: ICreateUserDTO) {
    console.log("dto create" , dto)
    return this.http.post<IUser>(
      `${this.tokenService.endPoint}users/createAccount`,
      dto
    );
  }

  updateUser(id: string, dto: ICreateUserDTO) {
    return this.http.patch<IUser>(
      `${this.tokenService.endPoint}users/${id}`,
      dto
    );
  }

  deleteUser(id: string) {
    return this.http.delete<IUser>(`${this.tokenService.endPoint}users/${id}`);
  }
  
}