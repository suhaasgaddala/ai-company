import app from "./app";
import { seedDemoData } from "./services/seedService";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

seedDemoData()
  .then(() => console.log("Demo data seeded"))
  .catch((err) => console.error("Seed error (non-fatal):", err.message));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
