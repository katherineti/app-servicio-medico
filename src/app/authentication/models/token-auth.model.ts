export interface TokenAuth {
  [x: string]: any;
  sub: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}