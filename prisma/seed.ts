import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const hrPassword = await bcrypt.hash("password123", 10);
  const hrUser = await prisma.user.upsert({
    where: { email: "hr@careeros.com" },
    update: {},
    create: {
      email: "hr@careeros.com",
      name: "HR Manager",
      password: hrPassword,
      role: "HR",
    },
  });

  const userPassword = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      name: "Alice Johnson",
      password: userPassword,
      role: "USER",
    },
  });

  await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      name: "Bob Smith",
      password: userPassword,
      role: "USER",
    },
  });

  const jobs = [
    {
      title: "Senior Frontend Developer",
      description: "We are looking for a Senior Frontend Developer to join our growing team. You will build responsive web applications using React and TypeScript.",
      requiredSkills: JSON.stringify(["react", "typescript", "javascript", "css", "html"]),
      optionalSkills: JSON.stringify(["next.js", "graphql", "testing"]),
      salaryMin: 100000,
      salaryMax: 140000,
      experienceMin: 3,
      experienceMax: 7,
      location: "San Francisco, CA",
    },
    {
      title: "Data Scientist",
      description: "Join our data team to build machine learning models and extract insights from large datasets. You will work on cutting-edge AI projects.",
      requiredSkills: JSON.stringify(["python", "machine learning", "statistics", "sql", "pandas"]),
      optionalSkills: JSON.stringify(["tensorflow", "pytorch", "spark"]),
      salaryMin: 110000,
      salaryMax: 150000,
      experienceMin: 2,
      experienceMax: 6,
      location: "New York, NY",
    },
    {
      title: "Full Stack Engineer",
      description: "Build end-to-end features for our SaaS platform. You will work with React on the frontend and Node.js on the backend.",
      requiredSkills: JSON.stringify(["react", "node.js", "javascript", "sql", "rest api"]),
      optionalSkills: JSON.stringify(["docker", "aws", "redis"]),
      salaryMin: 90000,
      salaryMax: 130000,
      experienceMin: 2,
      experienceMax: 5,
      location: "Remote",
    },
    {
      title: "DevOps Engineer",
      description: "Manage our cloud infrastructure, CI/CD pipelines, and ensure high availability of our services.",
      requiredSkills: JSON.stringify(["docker", "kubernetes", "aws", "ci/cd", "linux"]),
      optionalSkills: JSON.stringify(["terraform", "monitoring", "bash"]),
      salaryMin: 115000,
      salaryMax: 155000,
      experienceMin: 3,
      experienceMax: 8,
      location: "Austin, TX",
    },
    {
      title: "Machine Learning Engineer",
      description: "Design and deploy ML models at scale. You will work with large datasets and build production-ready ML pipelines.",
      requiredSkills: JSON.stringify(["python", "tensorflow", "machine learning", "docker", "sql"]),
      optionalSkills: JSON.stringify(["pytorch", "kubernetes", "mlflow"]),
      salaryMin: 130000,
      salaryMax: 170000,
      experienceMin: 3,
      experienceMax: 7,
      location: "Seattle, WA",
    },
  ];

  for (const jobData of jobs) {
    await prisma.job.create({
      data: {
        ...jobData,
        creatorId: hrUser.id,
      },
    });
  }

  console.log("✅ Seed complete!");
  console.log("Demo accounts:");
  console.log("  HR:   hr@careeros.com / password123");
  console.log("  User: alice@example.com / password123");
  console.log("  User: bob@example.com / password123");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
