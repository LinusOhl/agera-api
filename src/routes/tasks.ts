import { Hono } from "hono";
import type { Variables } from "../index.js";
import { isUser } from "../middlewares/isUser.js";
import {
  createTask,
  getTaskById,
  getTasksByUserId,
  updateTaskById,
} from "../services/task.service.js";

// TODO: add status codes

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

  const result = await getTasksByUserId(userId);

  return c.json({
    status: "success",
    data: result,
  });
});

app.get("/:id", async (c) => {
  const userId = c.get("userId");
  const taskId = c.req.param("id");

  const result = await getTaskById(userId, taskId);

  return c.json({
    status: "success",
    data: result,
  });
});

app.put("/:id", async (c) => {
  const userId = c.get("userId");
  const taskId = c.req.param("id");
  const body = await c.req.json();

  const result = await updateTaskById(userId, taskId, body);

  return c.json({
    status: "success",
    data: result,
  });
});

export default app;
