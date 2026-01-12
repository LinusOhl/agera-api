import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import authRoutes from "./routes/auth.js";
import tasksRoutes from "./routes/tasks.js";

export type Variables = {
  userId: string;
};

const app = new Hono().basePath("/api");

app.use(prettyJSON());
app.use(
  cors({
    origin: "http://localhost:3000",
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.notFound((c) =>
  c.json(
    {
      status: "error",
      message: "Not found",
    },
    404,
  ),
);

app.onError((err, c) =>
  c.json({
    status: "error",
    message: err.message,
  }),
);

app.route("/auth", authRoutes);
app.route("/tasks", tasksRoutes);

serve(
  {
    fetch: app.fetch,
    port: 3001,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
