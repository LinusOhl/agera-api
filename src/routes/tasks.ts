import { Hono } from "hono";
import { isUser } from "../middlewares/isUser.js";
import { createTask } from "../services/task.service.js";

const app = new Hono();

app.use(isUser);

app.post("/", async (c) => {
  const authHeader = c.req.header("Authorization");
  const body = await c.req.json();

  const result = await createTask(authHeader, body);

  return c.json({
    status: "success",
    data: result,
  });
});

export default app;
