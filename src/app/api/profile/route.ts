import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
    return NextResponse.json(profile);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        skills: JSON.stringify(body.skills || []),
        experience: Number(body.experience) || 0,
        education: body.education,
        location: body.location,
        interests: JSON.stringify(body.interests || []),
        salaryExpected: body.salaryExpected ? Number(body.salaryExpected) : null,
      },
      create: {
        userId: session.user.id,
        skills: JSON.stringify(body.skills || []),
        experience: Number(body.experience) || 0,
        education: body.education,
        location: body.location,
        interests: JSON.stringify(body.interests || []),
        salaryExpected: body.salaryExpected ? Number(body.salaryExpected) : null,
      },
    });
    return NextResponse.json(profile);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
