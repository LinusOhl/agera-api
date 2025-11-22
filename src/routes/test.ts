import { Hono } from "hono";
import { createUser } from "../services/test.service.js";

const app = new Hono();

app.get("/", async (c) => {
  const user = await createUser();

  return c.json({
    status: "success",
    data: user,
  });
});

export default app;
