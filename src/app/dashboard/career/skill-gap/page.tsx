"use client";
import { useState } from "react";
import { AVAILABLE_CAREERS } from "@/lib/ai";

interface GapResult {
  missingSkills: string[];
  timeline: string;
  learningPlan: string[];
}

export default function SkillGapPage() {
  const [currentSkills, setCurrentSkills] = useState("");
  const [targetCareer, setTargetCareer] = useState("");
  const [result, setResult] = useState<GapResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/career/skill-gap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentSkills: currentSkills.split(",").map(s => s.trim()).filter(Boolean),
        targetCareer,
      }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Skill Gap Planner</h1>
        <p className="text-gray-500 mt-1">Get a personalized learning plan to reach your target career</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border mb-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Skills <span className="font-normal text-gray-400">(comma separated)</span></label>
          <input type="text" value={currentSkills} onChange={e => setCurrentSkills(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none" placeholder="javascript, react, html, css" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Career</label>
          <select value={targetCareer} onChange={e => setTargetCareer(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none">
            <option value="">Select target career...</option>
            {AVAILABLE_CAREERS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 rounded-lg font-semibold text-white disabled:opacity-50" style={{ backgroundColor: "#4AD66D" }}>
          {loading ? "Generating Plan..." : "Generate Skill Gap Plan"}
        </button>
      </form>

      {result && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">Learning Plan for {targetCareer}</h2>
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: "#A8F0C6", color: "#1a1a1a" }}>
                ⏱ {result.timeline}
              </span>
            </div>
            {result.missingSkills.length > 0 ? (
              <>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Skills to learn ({result.missingSkills.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map(s => (
                      <span key={s} className="text-sm px-3 py-1 rounded-full bg-orange-100 text-orange-700">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Week-by-week plan</p>
                  <ol className="space-y-3">
                    {result.learningPlan.map((step, i) => (
                      <li key={i} className="flex gap-3 items-start bg-gray-50 rounded-lg p-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "#4AD66D" }}>{i + 1}</span>
                        <span className="text-sm text-gray-600">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </>
            ) : (
              <p className="text-green-600 font-medium">🎉 {result.learningPlan[0]}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
