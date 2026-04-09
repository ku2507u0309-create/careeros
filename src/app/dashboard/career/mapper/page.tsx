"use client";
import { useState } from "react";

interface MapResult {
  fitScore: number;
  careerTitle: string;
  roadmap: string[];
  nextSkill: string;
  missingSkills: string[];
  successProbability: number;
}

export default function CareerMapperPage() {
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [experience, setExperience] = useState("0");
  const [result, setResult] = useState<MapResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/career/map", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skills: skills.split(",").map(s => s.trim()).filter(Boolean),
        interests: interests.split(",").map(s => s.trim()).filter(Boolean),
        experience: Number(experience),
      }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Career Mapper</h1>
        <p className="text-gray-500 mt-1">Discover the best career path based on your profile</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border mb-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Skills <span className="font-normal text-gray-400">(comma separated)</span></label>
          <input type="text" value={skills} onChange={e => setSkills(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none" placeholder="python, sql, machine learning, statistics" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Interests <span className="font-normal text-gray-400">(comma separated)</span></label>
          <input type="text" value={interests} onChange={e => setInterests(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none" placeholder="data analysis, machine learning, visualization" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
          <input type="number" min="0" max="30" value={experience} onChange={e => setExperience(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none" />
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 rounded-lg font-semibold text-white disabled:opacity-50" style={{ backgroundColor: "#4AD66D" }}>
          {loading ? "Analyzing..." : "Map My Career"}
        </button>
      </form>

      {result && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{result.careerTitle}</h2>
                <p className="text-gray-500 text-sm">Best career match</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold" style={{ color: "#4AD66D" }}>{result.fitScore}%</p>
                <p className="text-sm text-gray-500">fit score</p>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Success Probability: <strong>{result.successProbability}%</strong></span>
              <span className="text-gray-600">Next: <strong>{result.nextSkill}</strong></span>
            </div>
          </div>

          {result.missingSkills.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="font-semibold text-gray-900 mb-3">Skills to Develop</h2>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map(s => (
                  <span key={s} className="px-3 py-1 text-sm rounded-full bg-orange-100 text-orange-700">{s}</span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="font-semibold text-gray-900 mb-4">Your Roadmap</h2>
            <ol className="space-y-3">
              {result.roadmap.map((step, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: "#4AD66D" }}>{i + 1}</span>
                  <span className="text-sm text-gray-600 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
