const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password", 10);

  const acme = await prisma.tenant.upsert({
    where: { slug: "acme" },
    update: {},
    create: { name: "Acme", slug: "acme", plan: "FREE" }
  });

  const globex = await prisma.tenant.upsert({
    where: { slug: "globex" },
    update: {},
    create: { name: "Globex", slug: "globex", plan: "FREE" }
  });

  await prisma.user.upsert({
    where: { email: "admin@acme.test" },
    update: {},
    create: { email: "admin@acme.test", password, role: "ADMIN", tenantId: acme.id }
  });

  await prisma.user.upsert({
    where: { email: "user@acme.test" },
    update: {},
    create: { email: "user@acme.test", password, role: "MEMBER", tenantId: acme.id }
  });

  await prisma.user.upsert({
    where: { email: "admin@globex.test" },
    update: {},
    create: { email: "admin@globex.test", password, role: "ADMIN", tenantId: globex.id }
  });

  await prisma.user.upsert({
    where: { email: "user@globex.test" },
    update: {},
    create: { email: "user@globex.test", password, role: "MEMBER", tenantId: globex.id }
  });
}

main()
  .then(() => console.log("Seed complete"))
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
