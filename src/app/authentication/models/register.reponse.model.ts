export interface User{
    user: User;
}

export interface Role{
    id: number;
    name: string;
    description: string;
}  


export interface SignUpRegister{
    username: string;
    email: string;
    nombre: string;
    apellidoPat: string;
    fechaNac: Date;
    roles: number;
}

