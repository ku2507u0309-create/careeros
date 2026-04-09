"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

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
  createdAt: string;
  creator: { name: string | null; email: string };
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs(q = "") {
    setLoading(true);
    const res = await fetch(`/api/jobs${q ? `?search=${encodeURIComponent(q)}` : ""}`);
    const data = await res.json();
    setJobs(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchJobs(search);
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="text-gray-500 mt-1">Find your next opportunity</p>
      </div>
      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search jobs..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2"
        />
        <button type="submit" className="px-6 py-2.5 rounded-lg font-medium text-white" style={{ backgroundColor: "#4AD66D" }}>
          Search
        </button>
      </form>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No jobs found</div>
      ) : (
        <div className="grid gap-4">
          {jobs.map(job => {
            const required = JSON.parse(job.requiredSkills) as string[];
            return (
              <div key={job.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{job.creator.name || job.creator.email}</p>
                    {job.location && <p className="text-sm text-gray-500">📍 {job.location}</p>}
                    <p className="text-gray-600 mt-3 text-sm line-clamp-2">{job.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {required.slice(0, 4).map(skill => (
                        <span key={skill} className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#A8F0C6", color: "#1a1a1a" }}>
                          {skill}
                        </span>
                      ))}
                      {required.length > 4 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">+{required.length - 4} more</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-6 text-right flex-shrink-0">
                    {job.salaryMin && job.salaryMax && (
                      <p className="text-sm font-medium text-gray-700">${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{job.experienceMin}-{job.experienceMax} yrs</p>
                    <Link
                      href={`/dashboard/job/apply?jobId=${job.id}`}
                      className="mt-3 inline-block px-4 py-2 rounded-lg text-sm font-medium text-white"
                      style={{ backgroundColor: "#4AD66D" }}
                    >
                      View & Apply
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
