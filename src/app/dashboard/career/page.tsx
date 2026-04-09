import Link from "next/link";

export default function CareerDashboardPage() {
  const tools = [
    { href: "/dashboard/career/mapper", title: "Career Mapper", description: "Discover career paths based on your skills and interests", icon: "🗺️" },
    { href: "/dashboard/career/compare", title: "Compare Careers", description: "Side-by-side comparison of two career paths", icon: "⚖️" },
    { href: "/dashboard/career/skill-gap", title: "Skill Gap Planner", description: "Get a personalized learning plan to reach your target career", icon: "📈" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Career Dashboard</h1>
        <p className="text-gray-500 mt-1">AI-powered tools to guide your career journey</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tools.map(tool => (
          <Link key={tool.href} href={tool.href} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow block">
            <div className="text-4xl mb-4">{tool.icon}</div>
            <h2 className="font-semibold text-gray-900 mb-2">{tool.title}</h2>
            <p className="text-sm text-gray-500">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
