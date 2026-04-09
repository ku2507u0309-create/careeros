"use client";
import { useState } from "react";
import { AVAILABLE_CAREERS } from "@/lib/ai";

interface CompareResult {
  career1Score: number;
  career2Score: number;
  recommendation: string;
  comparison: Record<string, { skills: string[]; avgSalary: number; skillCount: number }>;
}

export default function CompareCareersPage() {
  const [career1, setCareer1] = useState("");
  const [career2, setCareer2] = useState("");
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/career/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ career1, career2 }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Compare Careers</h1>
        <p className="text-gray-500 mt-1">Side-by-side comparison to help you decide</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Career 1</label>
            <select value={career1} onChange={e => setCareer1(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none">
              <option value="">Select career...</option>
              {AVAILABLE_CAREERS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Career 2</label>
            <select value={career2} onChange={e => setCareer2(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none">
              <option value="">Select career...</option>
              {AVAILABLE_CAREERS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" disabled={loading || !career1 || !career2} className="w-full py-3 rounded-lg font-semibold text-white disabled:opacity-50" style={{ backgroundColor: "#4AD66D" }}>
          {loading ? "Comparing..." : "Compare"}
        </button>
      </form>

      {result && career1 && career2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-4 border text-center">
            <p className="text-sm font-medium text-gray-700">{result.recommendation}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[career1, career2].map(career => {
              const data = result.comparison[career];
              return (
                <div key={career} className="bg-white rounded-xl p-6 shadow-sm border">
                  <h2 className="font-semibold text-gray-900 mb-4">{career}</h2>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-500">Avg Salary</span>
                      <p className="font-bold text-lg" style={{ color: "#4AD66D" }}>${data?.avgSalary?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Key Skills ({data?.skillCount})</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {data?.skills?.slice(0, 5).map(s => (
                          <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#A8F0C6" }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
