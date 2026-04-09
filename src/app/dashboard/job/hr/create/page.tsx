"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    requiredSkills: "",
    optionalSkills: "",
    salaryMin: "",
    salaryMax: "",
    experienceMin: "0",
    experienceMax: "5",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        requiredSkills: form.requiredSkills.split(",").map(s => s.trim()).filter(Boolean),
        optionalSkills: form.optionalSkills.split(",").map(s => s.trim()).filter(Boolean),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to create job");
    } else {
      router.push("/dashboard/job/hr");
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
        <p className="text-gray-500 mt-1">Fill in the details to post a new job listing</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border space-y-5">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
          <input type="text" value={form.title} onChange={e => update("title", e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none" placeholder="e.g. Senior Frontend Developer" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea value={form.description} onChange={e => update("description", e.target.value)} required rows={5} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none resize-none" placeholder="Job description..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills * <span className="font-normal text-gray-400">(comma separated)</span></label>
          <input type="text" value={form.requiredSkills} onChange={e => update("requiredSkills", e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none" placeholder="react, typescript, node.js" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Optional Skills <span className="font-normal text-gray-400">(comma separated)</span></label>
          <input type="text" value={form.optionalSkills} onChange={e => update("optionalSkills", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none" placeholder="docker, aws, graphql" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
            <input type="number" value={form.salaryMin} onChange={e => update("salaryMin", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none" placeholder="80000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
            <input type="number" value={form.salaryMax} onChange={e => update("salaryMax", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none" placeholder="120000" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Experience (years)</label>
            <input type="number" value={form.experienceMin} onChange={e => update("experienceMin", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Experience (years)</label>
            <input type="number" value={form.experienceMax} onChange={e => update("experienceMax", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input type="text" value={form.location} onChange={e => update("location", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none" placeholder="New York, NY or Remote" />
        </div>

        <button type="submit" disabled={loading} className="w-full py-3 rounded-lg font-semibold text-white disabled:opacity-50" style={{ backgroundColor: "#4AD66D" }}>
          {loading ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  );
}
