import * as jose from "jose";

// Note: https://emailregex.com/
export const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const getUserIdFromToken = async (token: string) => {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

  if (!accessTokenSecret) {
    throw new Error("Missing 'ACCESS_TOKEN_SECRET' environment variable.");
  }

  const secret = new TextEncoder().encode(accessTokenSecret);
  const { payload } = await jose.jwtVerify(token, secret);

  const userId = payload.sub;

  return userId;
};
