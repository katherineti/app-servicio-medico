export interface TokenAuth {
  [x: string]: any;
  id: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}