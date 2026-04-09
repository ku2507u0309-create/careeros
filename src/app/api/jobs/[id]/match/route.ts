import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeMatchScore } from "@/lib/ai";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const resume = await prisma.resume.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    if (!resume) return NextResponse.json({ score: 0, matchedSkills: [], missingSkills: [], gaps: ["Upload your resume to get a match score"] });
    const requiredSkills = JSON.parse(job.requiredSkills) as string[];
    const optionalSkills = JSON.parse(job.optionalSkills) as string[];
    const result = computeMatchScore(resume.content, job.description, requiredSkills, optionalSkills);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
