import { Hono } from "hono";
import { fetchTestData } from "../../services/test.service.js";

const testRoutes = new Hono();

testRoutes.get("/", async (c) => {
  const data = await fetchTestData();

  return c.json({
    status: "success",
    data: data,
  });
});

export default testRoutes;
