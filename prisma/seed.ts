import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create users
  const users = [
    { name: "Faizan (Faizi Yoyo)", email: "backupsolutions1122@gmail.com", role: "OWNER" as const, password: "faizi13579" },
    { name: "Umi", email: "umidx932@gmail.com", role: "MANAGER" as const, password: "umi84268" },
    { name: "Ali Hassan", email: "ali@digitalpointllc.com", role: "SPECIALIST" as const, password: "specialist123" },
    { name: "Client Demo", email: "client@example.com", role: "CLIENT" as const, password: "viewer123" },
  ];

  for (const u of users) {
    const hashed = await hash(u.password, 12);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        password: hashed,
        role: u.role,
      },
    });
    console.log(`  Created user: ${u.name} (${u.role})`);
  }

  // Create projects
  const owner = await prisma.user.findUnique({ where: { email: "backupsolutions1122@gmail.com" } });
  const manager = await prisma.user.findUnique({ where: { email: "umidx932@gmail.com" } });
  const specialist = await prisma.user.findUnique({ where: { email: "ali@digitalpointllc.com" } });
  const client = await prisma.user.findUnique({ where: { email: "client@example.com" } });

  if (!owner || !manager || !specialist || !client) {
    throw new Error("Users not found after seeding");
  }

  const projects = [
    {
      name: "Virtual Customer Solution",
      url: "https://virtualcustomersolution.com",
      description: "AI-powered customer service platform",
    },
    {
      name: "Digital Point LLC",
      url: "https://digitalpointllc.com",
      description: "Agency website - our own brand",
    },
  ];

  for (const p of projects) {
    const project = await prisma.project.upsert({
      where: { id: p.name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        id: p.name.toLowerCase().replace(/\s+/g, "-"),
        name: p.name,
        url: p.url,
        description: p.description,
      },
    });

    // Add all users as members
    const members = [
      { userId: owner.id, role: "owner" },
      { userId: manager.id, role: "manager" },
      { userId: specialist.id, role: "member" },
      { userId: client.id, role: "viewer" },
    ];

    for (const m of members) {
      await prisma.projectMember.upsert({
        where: { userId_projectId: { userId: m.userId, projectId: project.id } },
        update: {},
        create: {
          userId: m.userId,
          projectId: project.id,
          role: m.role,
        },
      });
    }

    console.log(`  Created project: ${p.name}`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
