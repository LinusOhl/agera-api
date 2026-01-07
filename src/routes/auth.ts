import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { refreshAccessToken } from "../services/auth.service.js";
import { createUser, loginUser } from "../services/user.service.js";

const app = new Hono();

app.post("/signup", async (c) => {
  const body = await c.req.json();

  const result = await createUser(body);

  return c.json({
    status: "success",
    data: result,
  });
});

app.post("/login", async (c) => {
  const body = await c.req.json();

  const result = await loginUser(body);

  setCookie(c, "refresh_token", result.refreshToken.token, {
    httpOnly: true,
    expires: result.refreshToken.expiresAt,
  });

  return c.json({
    status: "success",
    data: result.jwt,
  });
});

app.get("/refresh", async (c) => {
  const cookie = getCookie(c, "refresh_token");

  const result = await refreshAccessToken(cookie);

  setCookie(c, "refresh_token", result.refreshToken.token, {
    httpOnly: true,
    expires: result.refreshToken.expiresAt,
  });

  return c.json({
    status: "success",
    data: result.jwt,
  });
});

export default app;
