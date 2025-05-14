export interface TokenAuth {
  [x: string]: any;
  sub: number;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}