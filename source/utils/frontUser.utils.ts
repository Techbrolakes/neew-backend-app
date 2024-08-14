import Debug from "debug";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import jwt from "jsonwebtoken";

// eslint-disable-next-line
const debug = Debug("project:frontUser.util");

export interface DecodedToken {
  provider: string;
  payload: LocalTokenPayload | TokenPayload;
}

export interface LocalTokenPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

async function decodeToken(token: string): Promise<DecodedToken> {
  const [provider, leftToken] = token.split(":");

  switch (provider) {
    case "local":
      return {
        provider: "local",
        payload: await decodeTokenLocal(leftToken),
      };

    case "googleTest":
      if (process.env.NODE_ENV === "test") {
        const payload = JSON.parse(Buffer.from(leftToken, "base64").toString("ascii"));

        return {
          provider: "google",
          payload,
        };
      }
      return undefined;

    case "google":
      return {
        provider: "google",
        payload: await decodeTokenGoogle(leftToken),
      };
    default:
      return undefined;
  }
}

function decodeTokenLocal(token: string) {
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

async function decodeTokenGoogle(token: string): Promise<TokenPayload> {
  const secretKey = "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";
  const clientId = "354745730971-7m8stefuln9oa2ldlqscv2s9jrc766rf.apps.googleusercontent.com";

  const client = new OAuth2Client(clientId, secretKey);

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: clientId,
  });

  const payload = ticket.getPayload();

  return payload;
}

export default { decodeTokenGoogle, decodeToken };
