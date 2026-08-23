// Seeds the single user this MVP runs as. Multi-user auth will replace
// this with real signup, but every table already points at a `userId`
// so that swap won't touch the data model.
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.DEFAULT_USER_EMAIL ?? "you@example.com";

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Me" },
  });

  console.log(`Seeded default user: ${user.email} (${user.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
