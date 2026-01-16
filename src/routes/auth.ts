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

  await createUser(body);

  return c.json(
    {
      status: "success",
      data: null,
    },
    201,
  );
});

app.post("/login", async (c) => {
  const body = await c.req.json();

  const result = await loginUser(body);

  setCookie(c, "agera_refresh_token", result.refreshToken.token, {
    httpOnly: true,
    expires: result.refreshToken.expiresAt,
    sameSite: "lax",
  });

  setCookie(c, "agera_access_token", result.accessToken, {
    httpOnly: true,
    sameSite: "lax",
  });

  return c.json(
    {
      status: "success",
      data: result.user,
    },
    200,
  );
});

app.use("/refresh", isUser);

app.get("/refresh", async (c) => {
  const refreshTokenCookie = getCookie(c, "agera_refresh_token");
  const userId = c.get("userId");

  const result = await refreshAccessToken(refreshTokenCookie, userId);

  setCookie(c, "agera_refresh_token", result.refreshToken.token, {
    httpOnly: true,
    expires: result.refreshToken.expiresAt,
    sameSite: "lax",
  });

  setCookie(c, "agera_access_token", result.accessToken, {
    httpOnly: true,
    sameSite: "lax",
  });

  return c.json(
    {
      status: "success",
      data: result.user,
    },
    200,
  );
});

app.use("/logout", isUser);

app.get("/logout", async (c) => {
  const userId = c.get("userId");

  await logoutUser(userId);

  deleteCookie(c, "agera_refresh_token");
  deleteCookie(c, "agera_access_token");

  return c.json(
    {
      status: "success",
      data: null,
    },
    200,
  );
});

export default app;
