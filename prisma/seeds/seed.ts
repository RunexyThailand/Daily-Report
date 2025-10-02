import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const userArr = ["paramet-l", "kittipong-m"];
const projectArr = ["MylogStar", "RunDX"];
const taskArr = ["Testing", "Development", "Admin"];

const seedUser = async () => {
  // clean up before the seeding (optional)
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("01Password", 10);
  for (const user of userArr) {
    await prisma.user.create({
      data: {
        email: `${user}@runexy.co.jp`,
        name: user,
        password: hashedPassword,
      },
    });
  }
};

const seedProject = async () => {
  await prisma.project.deleteMany();
  for (const project of projectArr) {
    await prisma.project.create({
      data: {
        name: project,
        created_by: "seed script",
      },
    });
  }
};

const seedTask = async () => {
  await prisma.task.deleteMany();
  for (const task of taskArr) {
    await prisma.task.create({
      data: {
        name: task,
        created_by: "seed script",
      },
    });
  }
};

seedUser();
seedProject();
seedTask();
