declare namespace Express {
  export interface Request {
    data: any;
    user?: {
      id: string;
      email?: string;
      firstName?: string;
      lastName?: string;
    };
  }
}
