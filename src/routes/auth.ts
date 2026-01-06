import { Hono } from "hono";
import { createUser } from "../services/user.service.js";

const app = new Hono();

app.post("/signup", async (c) => {
  const body = await c.req.json();

  const result = await createUser(body);

  return c.json({
    status: "success",
    data: result,
  });
});

export default app;
