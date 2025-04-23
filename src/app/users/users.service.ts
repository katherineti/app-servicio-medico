import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// import { ICreateUserDTO, IGetAllUsers, IUser } from '../users.interface';
import { TokenService } from '../services/Token.service';
import { IUser } from './users.interface';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private readonly tokenService: TokenService, private readonly http: HttpClient) {}

  // getUsers(params: IGetAllUsers): Observable<any> {
  getUsers(params: any): Observable<any> {
    return this.http.post<IUser[]>(
      `${this.tokenService.endPoint}users/getAll`,
      params
    );
  }

/*   createUser(dto: ICreateUserDTO) {
    return this.http.post<IUser>(
      `${this.tokenService.endPoint}auth/createAccount`,
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
  
  getUserById(userId: string): Observable<IUser> {
    return this.http.get<IUser>(
      `${this.tokenService.endPoint}users/${userId}`,
      {
        headers: this.tokenService.headerToken(),
      }
    );
  }  */ 
}
