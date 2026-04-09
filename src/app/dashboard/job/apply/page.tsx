"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Job {
  id: string;
  title: string;
  description: string;
  requiredSkills: string;
  optionalSkills: string;
  salaryMin: number | null;
  salaryMax: number | null;
  experienceMin: number;
  experienceMax: number;
  location: string | null;
  creator: { name: string | null; email: string };
}

interface MatchResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  gaps: string[];
}

function ApplyContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const [job, setJob] = useState<Job | null>(null);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (jobId) loadJob(jobId);
  }, [jobId]);

  async function loadJob(id: string) {
    setLoading(true);
    const [jobRes, matchRes] = await Promise.all([
      fetch(`/api/jobs/${id}`),
      fetch(`/api/jobs/${id}/match`, { method: "POST" }),
    ]);
    const jobData = await jobRes.json();
    const matchData = await matchRes.json();
    setJob(jobData);
    setMatch(matchData);
    setLoading(false);
  }

  async function handleApply() {
    if (!jobId) return;
    setApplying(true);
    setError("");
    const res = await fetch(`/api/jobs/${jobId}/apply`, { method: "POST" });
    const data = await res.json();
    setApplying(false);
    if (!res.ok) {
      setError(data.error || "Application failed");
    } else {
      setMessage("Application submitted successfully!");
    }
  }

  if (!jobId) return (
    <div className="p-8">
      <p className="text-gray-500">Select a job from the Browse Jobs page to apply.</p>
    </div>
  );

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;
  if (!job) return <div className="p-8 text-gray-500">Job not found</div>;

  const required = JSON.parse(job.requiredSkills) as string[];
  const optional = JSON.parse(job.optionalSkills) as string[];
  const canApply = match && match.score >= 80;

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h1>
      <p className="text-gray-500 mb-6">{job.creator.name || job.creator.email} {job.location && `• ${job.location}`}</p>

      {match && (
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Your Match Score</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl font-bold" style={{ color: match.score >= 80 ? "#4AD66D" : "#ef4444" }}>
              {match.score}%
            </div>
            <div>
              <p className="font-medium">{match.score >= 80 ? "✅ Eligible to apply" : "❌ Below 80% threshold"}</p>
              <p className="text-sm text-gray-500">Minimum 80% required to apply</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${match.score}%`, backgroundColor: match.score >= 80 ? "#4AD66D" : "#ef4444" }}
            />
          </div>
          {match.matchedSkills.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Matched Skills:</p>
              <div className="flex flex-wrap gap-2">
                {match.matchedSkills.map(s => (
                  <span key={s} className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#A8F0C6" }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {match.missingSkills.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Missing Skills:</p>
              <div className="flex flex-wrap gap-2">
                {match.missingSkills.map(s => (
                  <span key={s} className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Job Description</h2>
        <p className="text-gray-600 text-sm whitespace-pre-line">{job.description}</p>
        <div className="grid grid-cols-2 gap-6 mt-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Required Skills</p>
            <div className="flex flex-wrap gap-2">
              {required.map(s => <span key={s} className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{s}</span>)}
            </div>
          </div>
          {optional.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Optional Skills</p>
              <div className="flex flex-wrap gap-2">
                {optional.map(s => <span key={s} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{s}</span>)}
              </div>
            </div>
          )}
        </div>
        {(job.salaryMin || job.experienceMin !== undefined) && (
          <div className="flex gap-6 mt-4 text-sm text-gray-600">
            {job.salaryMin && job.salaryMax && <span>💰 ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}</span>}
            <span>💼 {job.experienceMin}-{job.experienceMax} years experience</span>
          </div>
        )}
      </div>

      {message && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm">{message}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      {!message && (
        <button
          onClick={handleApply}
          disabled={!canApply || applying}
          className="px-8 py-3 rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: canApply ? "#4AD66D" : "#9ca3af" }}
        >
          {applying ? "Applying..." : canApply ? "Apply Now" : `Score too low (need 80%, got ${match?.score || 0}%)`}
        </button>
      )}
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-500">Loading...</div>}>
      <ApplyContent />
    </Suspense>
  );
}
