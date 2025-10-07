import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
console.log("Seeding database....................");
const userArr = [
  "paramet-l",
  "kittipong-m",
  "supitchaya-s",
  "wannaporn-c",
  "thanayut-r",
  "tinnapat-t",
];
const projectArr = ["MylogStar", "RunDX"];
const taskArr = ["Testing", "Development", "Admin"];

const titleArr = [
  "Fix bug #123",
  "Implement feature XYZ",
  "Update documentation",
  "Refactor codebase",
  "Improve performance",
  "Catch up meeting",
];
const titleArrJp = [
  "バグ修正 #123",
  "機能XYZの実装",
  "ドキュメントの更新",
  "コードベースのリファクタリング",
  "パフォーマンスの向上",
  "進捗確認ミーティング",
];

const detailArr = [
  "Fixed a critical bug affecting user login.",
  "Implemented the new feature as per the specifications.",
  "Updated the project documentation for better clarity.",
  "Refactored the codebase to enhance maintainability.",
  "Optimized the application for improved performance.",
  "Conducted a catch-up meeting with the team to discuss progress.",
];

const detailArrJp = [
  "ユーザーログインに影響する重大なバグを修正しました。",
  "仕様に従って新機能を実装しました。",
  "プロジェクトのドキュメントをより明確に更新しました。",
  "コードベースをリファクタリングして保守性を向上させました。",
  "アプリケーションを最適化してパフォーマンスを向上させました。",
  "チームと進捗を話し合うためのキャッチアップミーティングを行いました。",
];

const seedUser = async () => {
  // clean up before the seeding (optional)
  console.log("Seeding users....................");
  await prisma.report_trans.deleteMany();
  await prisma.report.deleteMany();
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
  console.log("Seeding users done.");
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

const seedReport = async () => {
  console.log("Seeding reports....................");
  // await prisma.report.deleteMany(); DELETE before delete user
  const users = await prisma.user.findMany();
  const projects = await prisma.project.findMany();
  const tasks = await prisma.task.findMany();
  for (const user of users) {
    const taskCount = Math.floor(Math.random() * 4) + 1; // random 1-4 reports per user
    for (let i = 0; i < taskCount; i++) {
      const randomProjectIndex = Math.floor(Math.random() * projects.length);
      const randomTaskIndex = Math.floor(Math.random() * tasks.length);
      const randomReportIndex = Math.floor(Math.random() * titleArr.length);
      const project = projects[randomProjectIndex];
      const task = tasks[randomTaskIndex];
      const title = titleArr[randomReportIndex];
      const detail = detailArr[randomReportIndex];
      const title_jp = titleArrJp[randomReportIndex];
      const detail_jp = detailArrJp[randomReportIndex];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 7)); // random date within last 7 days
      const due_date = new Date();
      due_date.setDate(due_date.getDate() + Math.floor(Math.random() * 7)); // random due date within next 7 days
      await prisma.report.create({
        data: {
          project_id: Math.floor(Math.random() * 2) === 0 ? null : project.id,
          task_id: Math.floor(Math.random() * 2) === 0 ? null : task.id,
          report_date: date,
          progress: Math.floor(Math.random() * 100), // random progress 0-100
          due_date: Math.floor(Math.random() * 2) === 0 ? null : due_date, // 50% chance of null},
          created_by: user.id,
          report_trans: {
            create: [
              {
                language: "DEFAULT",
                title: title,
                detail: detail,
              },
              {
                language: "JP",
                title: title_jp,
                detail: detail_jp,
              },
            ],
          },
        },
      });
    }
  }
  console.log("Seeding reports done.");
};

await seedUser();
await seedProject();
await seedTask();
await seedReport();
