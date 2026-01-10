import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
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

  try {
    const { payload } = await jose.jwtVerify(token, secret);

    const userId = payload.sub;

    if (!userId) {
      throw new Error("Unauthorized.");
    }

    c.set("userId", userId);

    await next();
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      throw new HTTPException(401, { message: "Expired JWT token." });
    }

    throw new HTTPException(401, {
      message: "Something went wrong.",
      cause: error,
    });
  }
});
