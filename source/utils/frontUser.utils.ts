import Debug from "debug";
import jwt from "jsonwebtoken";

// eslint-disable-next-line
const debug = Debug("project:frontUser.util");

export interface LocalTokenPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export function decodeToken(token: string) {
  return new Promise<LocalTokenPayload>((resolve, reject) => {
    jwt.verify(token, "neew.@#KSJ1a@js", (error, decoded) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(decoded as LocalTokenPayload);
    });
  });
}

const frontUserUtil = {
  decodeToken,
};

export default frontUserUtil;
