export interface IEmployee{
    id:number ,
    name: string,
    cedula: string,
    email: string,
    phone: string,
    createdAt: Date,
    updatedAt: Date,
} 

export interface IFamily{
    id: number,
    name: string,
    cedula: string,
    createdAt: Date,
    updatedAt: Date
}

export interface ITypesAssignment{
    id: number,
    name: string,
}