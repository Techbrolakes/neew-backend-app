import Debug from "debug";
import jwt from "jsonwebtoken";
import { REFRESH_TOKEN_SECRET } from ".";

// eslint-disable-next-line
const debug = Debug("project:frontUser.util");

export interface LocalTokenPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export function decodeAccessToken(token: string) {
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

function decodeRefreshToken(token: string): Promise<any> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
}

const frontUserUtil = {
  decodeAccessToken,
  decodeRefreshToken,
};

export default frontUserUtil;
