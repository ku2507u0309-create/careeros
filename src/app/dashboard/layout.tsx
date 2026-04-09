"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isHR = session?.user?.role === "HR";
  const isJobTab = pathname.startsWith("/dashboard/job");

  const jobNavItems = [
    { href: "/dashboard/job", label: "Browse Jobs", icon: "🔍" },
    { href: "/dashboard/job/apply", label: "Apply", icon: "📝" },
    { href: "/dashboard/job/applications", label: "My Applications", icon: "📋" },
    { href: "/dashboard/job/resume-analyzer", label: "Resume Analyzer", icon: "📄" },
  ];

  const hrNavItems = [
    { href: "/dashboard/job/hr", label: "HR Dashboard", icon: "🏢" },
    { href: "/dashboard/job/hr/create", label: "Create Job", icon: "➕" },
  ];

  const careerNavItems = [
    { href: "/dashboard/career", label: "Overview", icon: "🎯" },
    { href: "/dashboard/career/mapper", label: "Career Mapper", icon: "🗺️" },
    { href: "/dashboard/career/compare", label: "Compare Careers", icon: "⚖️" },
    { href: "/dashboard/career/skill-gap", label: "Skill Gap", icon: "📈" },
  ];

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#FAF9F6" }}>
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold" style={{ color: "#1a1a1a" }}>CareerOS</h1>
          <p className="text-xs text-gray-500 mt-1">{session?.user?.name || session?.user?.email}</p>
          {isHR && (
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#A8F0C6", color: "#1a1a1a" }}>HR</span>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex p-3 gap-2 border-b border-gray-100">
          <Link
            href="/dashboard/job"
            className="flex-1 py-2 text-xs font-semibold text-center rounded-lg transition-colors"
            style={{ backgroundColor: isJobTab ? "#4AD66D" : "#f3f4f6", color: isJobTab ? "white" : "#6b7280" }}
          >
            Jobs
          </Link>
          <Link
            href="/dashboard/career"
            className="flex-1 py-2 text-xs font-semibold text-center rounded-lg transition-colors"
            style={{ backgroundColor: !isJobTab ? "#4AD66D" : "#f3f4f6", color: !isJobTab ? "white" : "#6b7280" }}
          >
            Career
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {isJobTab ? (
            <>
              {!isHR && jobNavItems.map(item => (
                <NavItem key={item.href} {...item} pathname={pathname} />
              ))}
              {isHR && hrNavItems.map(item => (
                <NavItem key={item.href} {...item} pathname={pathname} />
              ))}
            </>
          ) : (
            careerNavItems.map(item => (
              <NavItem key={item.href} {...item} pathname={pathname} />
            ))
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full py-2 text-sm text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function NavItem({ href, label, icon, pathname }: { href: string; label: string; icon: string; pathname: string }) {
  const isActive = pathname === href || (href !== "/dashboard/job" && href !== "/dashboard/career" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
      style={{
        backgroundColor: isActive ? "#A8F0C6" : "transparent",
        color: isActive ? "#1a1a1a" : "#6b7280",
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
