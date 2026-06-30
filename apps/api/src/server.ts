import { buildApp } from "./app.js";

const app = buildApp();
const port = Number(process.env.PORT ?? 4000);

try {
  await app.listen({ port, host: "127.0.0.1" });
  console.log(`St. Kisa mock API running at http://127.0.0.1:${port}`);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
