export default interface Config {
  env: string;
  database: string;
  frontUrl: string;
  imageFolder: string;
  smtp: {
    host: string;
    port: number;
    auth: {
      user: string;
      pass: string;
    };
  };
  smtpFrom: string;
  redis: string;
}
