import "dotenv/config";
import app from "./app";
import { prisma } from "./services/prisma.service";

const port = Number(process.env.PORT) || 3001;

async function start(): Promise<void> {
  try {
    await prisma.$connect();
    console.log("Database connection established");
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
}

void start();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
