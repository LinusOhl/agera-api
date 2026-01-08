import { Hono } from "hono";
import type { Variables } from "../index.js";
import { isUser } from "../middlewares/isUser.js";
import { createTask, getTasks } from "../services/task.service.js";

const app = new Hono<{ Variables: Variables }>();

app.use(isUser);

app.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  const result = await createTask(userId, body);

  return c.json({
    status: "success",
    data: result,
  });
});

app.get("/", async (c) => {
  const userId = c.get("userId");

  const result = await getTasks(userId);

  return c.json({
    status: "success",
    data: result,
  });
});

export default app;
