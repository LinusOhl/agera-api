import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { Variables } from "../index.js";
import { isUser } from "../middlewares/isUser.js";
import {
  createUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
} from "../services/auth.service.js";

const app = new Hono<{ Variables: Variables }>();

app.post("/signup", async (c) => {
  const body = await c.req.json();

  const result = await createUser(body);

  return c.json(
    {
      status: "success",
      data: result,
    },
    201,
  );
});

app.post("/login", async (c) => {
  const body = await c.req.json();

  const result = await loginUser(body);

  setCookie(c, "refresh_token", result.refreshToken.token, {
    httpOnly: true,
    expires: result.refreshToken.expiresAt,
  });

  return c.json(
    {
      status: "success",
      data: result.jwt,
    },
    200,
  );
});

app.get("/refresh", async (c) => {
  const cookie = getCookie(c, "refresh_token");

  const result = await refreshAccessToken(cookie);

  setCookie(c, "refresh_token", result.refreshToken.token, {
    httpOnly: true,
    expires: result.refreshToken.expiresAt,
  });

  return c.json(
    {
      status: "success",
      data: result.jwt,
    },
    200,
  );
});

app.use("/logout", isUser);

app.get("/logout", async (c) => {
  const userId = c.get("userId");

  const result = await logoutUser(userId);

  deleteCookie(c, "refresh_token");

  return c.json(
    {
      status: "success",
      data: result,
    },
    200,
  );
});

export default app;
