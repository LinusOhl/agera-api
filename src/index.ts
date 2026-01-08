import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import authRoutes from "./routes/auth.js";
import tasksRoutes from "./routes/tasks.js";

export type Variables = {
  userId: string;
};

const app = new Hono().basePath("/api");

app.use(prettyJSON());

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
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
