import { createMiddleware } from "hono/factory";
import * as jose from "jose";

export const isUser = createMiddleware(async (c, next) => {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

  if (!accessTokenSecret) {
    throw new Error("Missing 'ACCESS_TOKEN_SECRET' environment variable.");
  }

  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    throw new Error("Missing authorization header.");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new Error("Missing JWT token.");
  }

  const secret = new TextEncoder().encode(accessTokenSecret);
  const { payload } = await jose.jwtVerify(token, secret);

  const userId = payload.sub;

  if (!userId) {
    throw new Error("Unauthorized.");
  }

  c.set("userId", userId);

  await next();
});
