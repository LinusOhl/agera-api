import { Hono } from "hono";
import type { Bindings } from "./helpers";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
