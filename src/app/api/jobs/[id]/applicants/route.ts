import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rankCandidates } from "@/lib/ai";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "HR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const applications = await prisma.application.findMany({
      where: { jobId: id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        resume: { select: { content: true, skills: true } },
      },
      orderBy: { matchScore: "desc" },
    });

    const candidates = applications.map(app => ({
      userId: app.userId,
      resumeText: app.resume?.content || "",
      matchScore: app.matchScore,
    }));
    const ranked = rankCandidates(candidates);

    const result = applications.map(app => {
      const rank = ranked.find(r => r.userId === app.userId);
      return {
        ...app,
        rank: rank?.rank || 0,
      };
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "HR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await params;
    const { applicationId, status } = await request.json();
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
