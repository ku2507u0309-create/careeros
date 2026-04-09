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
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const existing = await prisma.application.findFirst({
      where: { userId: session.user.id, jobId: id },
    });
    if (existing) return NextResponse.json({ error: "Already applied" }, { status: 409 });

    const resume = await prisma.resume.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    if (!resume) return NextResponse.json({ error: "Please upload your resume first" }, { status: 400 });

    const requiredSkills = JSON.parse(job.requiredSkills) as string[];
    const optionalSkills = JSON.parse(job.optionalSkills) as string[];
    const { score } = computeMatchScore(resume.content, job.description, requiredSkills, optionalSkills);

    if (score < 80) {
      return NextResponse.json({ error: `Match score ${score}% is below 80% threshold required to apply`, score }, { status: 403 });
    }

    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        jobId: id,
        resumeId: resume.id,
        matchScore: score,
      },
    });
    return NextResponse.json(application, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
