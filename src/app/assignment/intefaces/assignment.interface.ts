export interface ICreateAssignment {
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
  
export interface IEmployee{
    id:number,
    name: string,
    cedula: string,
    email: string,
    phone: string,
    createdAt: Date,
    updatedAt: Date,
} 

export interface ICretateEmployee extends Omit<IEmployee, 'id' | 'createdAt' | 'updatedAt' > {}

export interface IFamily{
    id: number,
    name: string,
    cedula: string,
    createdAt: Date,
    updatedAt: Date
}

export interface ICreateFamily{
    employeeId: number,
    name:string,
    cedula:string
} 

export interface ITypesAssignment{
    id: number,
    name: string,
}

export interface IEmployeeFamily{
    id:number,
    employeeId: number,
    familyId: number,
    familyName:string,
    familyCedula:string
} 
