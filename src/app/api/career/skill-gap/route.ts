import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateSkillGap } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { currentSkills, targetCareer } = await request.json();
    if (!targetCareer) return NextResponse.json({ error: "Target career required" }, { status: 400 });
    const result = generateSkillGap(currentSkills || [], targetCareer);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
