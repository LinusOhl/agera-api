import { serve } from "@hono/node-server";
import { Hono } from "hono";
import testRoutes from "./routes/test/test.js";

const app = new Hono().basePath("/api");

app.get("/", (c) => {
  return c.json({
    ok: true,
    message: "Hello Hono!",
  });
});

app.route("/test", testRoutes);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
