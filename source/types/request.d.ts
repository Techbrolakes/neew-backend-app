declare namespace Express {
  export interface Request {
    data: any;
    user: {
      _id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  }
}
