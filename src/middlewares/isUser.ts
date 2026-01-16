import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import * as jose from "jose";

export const isUser = createMiddleware(async (c, next) => {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

  if (!accessTokenSecret) {
    throw new HTTPException(400, {
      message: "Missing 'ACCESS_TOKEN_SECRET' environment variable.",
    });
  }

  const cookie = getCookie(c, "agera_access_token");

  if (!cookie) {
    throw new HTTPException(401, { message: "Unauthorized." });
  }

  const secret = new TextEncoder().encode(accessTokenSecret);

  try {
    const { payload } = await jose.jwtVerify(cookie, secret);

    const userId = payload.sub;

    if (!userId) {
      throw new HTTPException(400, { message: "Missing payload sub." });
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
