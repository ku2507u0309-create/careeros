import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id },
    include: {
      job: { select: { title: true, location: true, creator: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusColor: Record<string, string> = {
    PENDING: "#f59e0b",
    SHORTLISTED: "#4AD66D",
    REJECTED: "#ef4444",
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-500 mt-1">{applications.length} application{applications.length !== 1 ? "s" : ""}</p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No applications yet</p>
          <p className="text-sm">Browse jobs and apply to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <div key={app.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-gray-900">{app.job.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{app.job.creator.name} {app.job.location && `• ${app.job.location}`}</p>
                  <p className="text-sm text-gray-400 mt-1">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: statusColor[app.status] || "#6b7280" }}>
                    {app.status}
                  </span>
                  <p className="text-sm text-gray-500 mt-2">Match: <strong>{app.matchScore}%</strong></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
