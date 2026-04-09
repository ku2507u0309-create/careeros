"use client";
import { useState, useEffect, use } from "react";

interface Applicant {
  id: string;
  matchScore: number;
  status: string;
  createdAt: string;
  rank: number;
  user: { id: string; name: string | null; email: string };
  resume: { skills: string } | null;
}

export default function ApplicantsPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/jobs/${jobId}/applicants`)
      .then(r => r.json())
      .then(data => { setApplicants(Array.isArray(data) ? data : []); setLoading(false); });
  }, [jobId]);

  async function updateStatus(applicationId: string, status: string) {
    setUpdating(applicationId);
    await fetch(`/api/jobs/${jobId}/applicants`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, status }),
    });
    setApplicants(prev => prev.map(a => a.id === applicationId ? { ...a, status } : a));
    setUpdating(null);
  }

  const statusColor: Record<string, string> = {
    PENDING: "#f59e0b",
    SHORTLISTED: "#4AD66D",
    REJECTED: "#ef4444",
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
        <p className="text-gray-500 mt-1">{applicants.length} applicant{applicants.length !== 1 ? "s" : ""} (ranked by AI match score)</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading applicants...</div>
      ) : applicants.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No applicants yet</div>
      ) : (
        <div className="space-y-4">
          {applicants.map(app => (
            <div key={app.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="text-2xl font-bold text-gray-300 w-8">#{app.rank}</div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{app.user.name || app.user.email}</h2>
                    <p className="text-sm text-gray-500">{app.user.email}</p>
                    <p className="text-sm text-gray-400 mt-1">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold" style={{ color: app.matchScore >= 80 ? "#4AD66D" : "#f59e0b" }}>{app.matchScore}%</p>
                    <p className="text-xs text-gray-500">match</p>
                  </div>
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white mb-2" style={{ backgroundColor: statusColor[app.status] || "#6b7280" }}>
                      {app.status}
                    </span>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => updateStatus(app.id, "SHORTLISTED")}
                        disabled={updating === app.id}
                        className="px-3 py-1.5 text-xs rounded-lg font-medium text-white disabled:opacity-50"
                        style={{ backgroundColor: "#4AD66D" }}
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => updateStatus(app.id, "REJECTED")}
                        disabled={updating === app.id}
                        className="px-3 py-1.5 text-xs rounded-lg font-medium bg-red-100 text-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
