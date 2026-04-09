"use client";
import { useState } from "react";

interface Analysis {
  atsScore: number;
  missingKeywords: string[];
  tips: string[];
  roleSuggestions: string[];
}

export default function ResumeAnalyzerPage() {
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleAnalyze() {
    if (!resumeText.trim()) return;
    setLoading(true);
    const res = await fetch("/api/resume/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText }),
    });
    const data = await res.json();
    setAnalysis(data);
    setLoading(false);
  }

  async function handleSave() {
    const res = await fetch("/api/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: resumeText, filename: "resume.txt" }),
    });
    if (res.ok) setSaved(true);
  }

  const scoreColor = analysis ? (analysis.atsScore >= 80 ? "#4AD66D" : analysis.atsScore >= 60 ? "#f59e0b" : "#ef4444") : "#4AD66D";

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Resume Analyzer</h1>
        <p className="text-gray-500 mt-1">Paste your resume to get AI-powered feedback</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Paste your resume text</label>
        <textarea
          value={resumeText}
          onChange={e => setResumeText(e.target.value)}
          rows={12}
          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 resize-none"
          placeholder="Paste your resume content here..."
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleAnalyze}
            disabled={loading || !resumeText.trim()}
            className="px-6 py-2.5 rounded-lg font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: "#4AD66D" }}
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
          {analysis && !saved && (
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Save Resume
            </button>
          )}
          {saved && <span className="py-2.5 text-green-600 text-sm font-medium">✅ Saved!</span>}
        </div>
      </div>

      {analysis && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="font-semibold text-gray-900 mb-4">ATS Score</h2>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold" style={{ color: scoreColor }}>{analysis.atsScore}%</div>
              <div>
                <p className="font-medium">{analysis.atsScore >= 80 ? "Excellent!" : analysis.atsScore >= 60 ? "Good, but improvable" : "Needs improvement"}</p>
                <p className="text-sm text-gray-500">ATS compatibility score</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div className="h-2 rounded-full" style={{ width: `${analysis.atsScore}%`, backgroundColor: scoreColor }} />
            </div>
          </div>

          {analysis.tips.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="font-semibold text-gray-900 mb-4">💡 Improvement Tips</h2>
              <ul className="space-y-2">
                {analysis.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600">
                    <span className="text-green-500 flex-shrink-0">→</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.missingKeywords.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="font-semibold text-gray-900 mb-4">🔍 Missing Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {analysis.missingKeywords.map(kw => (
                  <span key={kw} className="text-sm px-3 py-1 rounded-full bg-red-100 text-red-700">{kw}</span>
                ))}
              </div>
            </div>
          )}

          {analysis.roleSuggestions.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="font-semibold text-gray-900 mb-4">🎯 Suggested Roles</h2>
              <div className="flex flex-wrap gap-3">
                {analysis.roleSuggestions.map(role => (
                  <span key={role} className="px-4 py-2 rounded-full font-medium text-sm" style={{ backgroundColor: "#A8F0C6", color: "#1a1a1a" }}>
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
