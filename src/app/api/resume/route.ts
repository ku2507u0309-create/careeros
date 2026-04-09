import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeResume } from "@/lib/ai";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const resume = await prisma.resume.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(resume);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { content, filename } = await request.json();
    if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });
    const analysis = analyzeResume(content);
    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        filename: filename || "resume.txt",
        content,
        skills: JSON.stringify(analysis.roleSuggestions),
        atsScore: analysis.atsScore,
      },
    });
    return NextResponse.json({ ...resume, analysis }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
