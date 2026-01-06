import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import authRoutes from "./routes/auth.js";

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

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
