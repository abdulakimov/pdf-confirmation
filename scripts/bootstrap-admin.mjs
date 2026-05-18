import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to bootstrap the admin user.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});

function getBootstrapValue(name, fallback) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : fallback;
}

async function main() {
  const email = getBootstrapValue("BOOTSTRAP_ADMIN_EMAIL", "admin@local.test").toLowerCase();
  const password = getBootstrapValue("BOOTSTRAP_ADMIN_PASSWORD", "Admin!2026-Verify");
  const name = getBootstrapValue("BOOTSTRAP_ADMIN_NAME", "Local Admin");

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      emailVerified: true,
      name,
      role: "admin"
    },
    update: {
      emailVerified: true,
      name,
      role: "admin"
    }
  });

  const account = await prisma.account.findFirst({
    where: {
      userId: user.id,
      providerId: "credential"
    }
  });

  if (account) {
    await prisma.account.update({
      where: { id: account.id },
      data: {
        accountId: user.id,
        password: passwordHash
      }
    });
  } else {
    await prisma.account.create({
      data: {
        accountId: user.id,
        password: passwordHash,
        providerId: "credential",
        userId: user.id
      }
    });
  }

  console.log(JSON.stringify({
    email,
    password,
    role: "admin"
  }));

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
