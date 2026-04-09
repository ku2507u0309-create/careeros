import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HRDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "HR") redirect("/dashboard/job");

  const jobs = await prisma.job.findMany({
    where: { creatorId: session.user.id },
    include: {
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
          <p className="text-gray-500 mt-1">{jobs.length} job{jobs.length !== 1 ? "s" : ""} posted</p>
        </div>
        <Link
          href="/dashboard/job/hr/create"
          className="px-5 py-2.5 rounded-lg font-medium text-white"
          style={{ backgroundColor: "#4AD66D" }}
        >
          + Post New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <p className="text-gray-500 text-lg mb-4">No jobs posted yet</p>
          <Link href="/dashboard/job/hr/create" className="px-5 py-2.5 rounded-lg font-medium text-white" style={{ backgroundColor: "#4AD66D" }}>
            Post your first job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-gray-900">{job.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{job.location || "Remote"} • {job.experienceMin}-{job.experienceMax} yrs</p>
                  <p className="text-sm text-gray-400 mt-1">Posted {new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold" style={{ color: "#4AD66D" }}>{job._count.applications}</p>
                    <p className="text-xs text-gray-500">applicants</p>
                  </div>
                  <Link
                    href={`/dashboard/job/hr/${job.id}/applicants`}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    View Applicants
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
