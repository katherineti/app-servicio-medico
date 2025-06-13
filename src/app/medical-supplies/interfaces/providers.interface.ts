export interface Provider {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface ProvidersAll{total: number, list: Provider[]}