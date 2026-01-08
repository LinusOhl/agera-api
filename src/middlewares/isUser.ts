import { createMiddleware } from "hono/factory";

export const isUser = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    throw new Error("Missing authorization header.");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new Error("Missing JWT token.");
  }

  await next();
});
