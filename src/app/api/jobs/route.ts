import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const jobs = await prisma.job.findMany({
      where: {
        isActive: true,
        ...(search ? {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
          ],
        } : {}),
      },
      include: { creator: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(jobs);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "HR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { title, description, requiredSkills, optionalSkills, salaryMin, salaryMax, experienceMin, experienceMax, location } = body;
    const job = await prisma.job.create({
      data: {
        creatorId: session.user.id,
        title,
        description,
        requiredSkills: JSON.stringify(requiredSkills || []),
        optionalSkills: JSON.stringify(optionalSkills || []),
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        experienceMin: Number(experienceMin) || 0,
        experienceMax: Number(experienceMax) || 10,
        location,
      },
    });
    return NextResponse.json(job, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
