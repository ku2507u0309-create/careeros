// Deterministic keyword-overlap scoring (no external API needed for MVP)
// TODO: Swap deterministic scoring for OpenAI GPT-4 calls

const CAREER_SKILLS_MAP: Record<string, string[]> = {
  "Software Engineer": ["javascript", "typescript", "react", "node.js", "python", "sql", "git", "rest api", "algorithms", "data structures"],
  "Data Scientist": ["python", "machine learning", "statistics", "pandas", "numpy", "sql", "data visualization", "tensorflow", "scikit-learn", "r"],
  "Product Manager": ["product strategy", "agile", "roadmap", "user research", "analytics", "stakeholder management", "jira", "communication", "wireframing"],
  "UX Designer": ["figma", "user research", "wireframing", "prototyping", "usability testing", "adobe xd", "css", "html", "design thinking"],
  "DevOps Engineer": ["docker", "kubernetes", "ci/cd", "aws", "terraform", "linux", "bash", "monitoring", "git", "jenkins"],
  "Data Analyst": ["sql", "excel", "python", "tableau", "power bi", "statistics", "data visualization", "r", "google analytics"],
  "Frontend Developer": ["react", "javascript", "typescript", "css", "html", "vue", "angular", "webpack", "git", "rest api"],
  "Backend Developer": ["node.js", "python", "java", "sql", "rest api", "docker", "microservices", "git", "redis", "postgresql"],
  "Machine Learning Engineer": ["python", "tensorflow", "pytorch", "machine learning", "deep learning", "sql", "docker", "git", "algorithms", "mathematics"],
  "Cloud Architect": ["aws", "azure", "gcp", "terraform", "kubernetes", "networking", "security", "docker", "ci/cd", "serverless"],
};

function normalizeSkills(skills: string[]): string[] {
  return skills.map(s => s.toLowerCase().trim());
}

export function computeMatchScore(
  resumeText: string,
  jobDescription: string,
  requiredSkills: string[],
  optionalSkills: string[] = []
): { score: number; matchedSkills: string[]; missingSkills: string[]; gaps: string[] } {
  const text = (resumeText + " " + jobDescription).toLowerCase();
  const normRequired = normalizeSkills(requiredSkills);
  const normOptional = normalizeSkills(optionalSkills);

  const matchedRequired = normRequired.filter(skill => text.includes(skill));
  const matchedOptional = normOptional.filter(skill => text.includes(skill));
  const missingRequired = normRequired.filter(skill => !text.includes(skill));

  const requiredScore = normRequired.length > 0 ? matchedRequired.length / normRequired.length : 1;
  const optionalScore = normOptional.length > 0 ? matchedOptional.length / normOptional.length : 1;

  const score = Math.round((requiredScore * 0.7 + optionalScore * 0.3) * 100);

  return {
    score,
    matchedSkills: [...matchedRequired, ...matchedOptional],
    missingSkills: missingRequired,
    gaps: missingRequired.slice(0, 3).map(s => `Improve your ${s} skills`),
  };
}

export function analyzeResume(resumeText: string): {
  atsScore: number;
  missingKeywords: string[];
  tips: string[];
  roleSuggestions: string[];
} {
  const text = resumeText.toLowerCase();
  const commonKeywords = ["experience", "skills", "education", "project", "achievement", "team", "leadership", "communication", "problem solving", "analytical"];
  const missingKeywords = commonKeywords.filter(kw => !text.includes(kw));

  const wordCount = resumeText.split(/\s+/).length;
  const hasBullets = resumeText.includes("•") || resumeText.includes("-") || resumeText.includes("*");
  const hasNumbers = /\d+/.test(resumeText);
  const hasEmail = /\S+@\S+\.\S+/.test(resumeText);

  let atsScore = 50;
  if (wordCount > 200) atsScore += 10;
  if (hasBullets) atsScore += 10;
  if (hasNumbers) atsScore += 10;
  if (hasEmail) atsScore += 10;
  if (missingKeywords.length < 5) atsScore += 10;
  atsScore = Math.min(100, atsScore);

  const tips: string[] = [];
  if (!hasBullets) tips.push("Use bullet points to list achievements and responsibilities");
  if (!hasNumbers) tips.push("Quantify achievements with numbers (e.g., 'increased sales by 20%')");
  if (wordCount < 200) tips.push("Expand your resume with more detail (aim for 400-600 words)");
  if (!hasEmail) tips.push("Include your email address");
  if (missingKeywords.length > 3) tips.push("Add more industry keywords to improve ATS matching");
  if (tips.length === 0) tips.push("Your resume looks well-structured! Tailor it for each job application.");

  const roleSuggestions = Object.entries(CAREER_SKILLS_MAP)
    .map(([role, skills]) => ({
      role,
      matchCount: skills.filter(s => text.includes(s)).length,
    }))
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 3)
    .map(r => r.role);

  return { atsScore, missingKeywords, tips, roleSuggestions };
}

export function rankCandidates(
  candidates: Array<{ userId: string; resumeText: string; matchScore: number }>,
  threshold = 0
): Array<{ userId: string; matchScore: number; rank: number }> {
  return candidates
    .filter(c => c.matchScore >= threshold)
    .sort((a, b) => b.matchScore - a.matchScore)
    .map((c, i) => ({ userId: c.userId, matchScore: c.matchScore, rank: i + 1 }));
}

export function mapCareer(
  skills: string[],
  interests: string[],
  experience: number
): {
  fitScore: number;
  careerTitle: string;
  roadmap: string[];
  nextSkill: string;
  missingSkills: string[];
  successProbability: number;
} {
  const normSkills = normalizeSkills([...skills, ...interests]);

  const scores = Object.entries(CAREER_SKILLS_MAP).map(([career, careerSkills]) => {
    const matched = careerSkills.filter(s => normSkills.some(ns => ns.includes(s) || s.includes(ns)));
    return { career, score: matched.length / careerSkills.length, matched, missing: careerSkills.filter(s => !normSkills.some(ns => ns.includes(s) || s.includes(ns))) };
  });

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];

  const fitScore = Math.round(best.score * 100);
  const expBonus = Math.min(experience * 2, 20);
  const successProbability = Math.min(100, fitScore + expBonus);

  const roadmap = [
    `Learn ${best.missing[0] || "advanced concepts"} fundamentals`,
    `Build a portfolio project using ${best.matched[0] || "your skills"}`,
    `Get certified in ${best.missing[1] || best.matched[1] || "a relevant technology"}`,
    `Apply for junior ${best.career} roles`,
    `Network with ${best.career} professionals`,
  ];

  return {
    fitScore,
    careerTitle: best.career,
    roadmap,
    nextSkill: best.missing[0] || "Advanced topics in your current stack",
    missingSkills: best.missing.slice(0, 5),
    successProbability,
  };
}

export function compareCareers(
  career1: string,
  career2: string
): {
  career1Score: number;
  career2Score: number;
  recommendation: string;
  comparison: object;
} {
  const skills1 = CAREER_SKILLS_MAP[career1] || [];
  const skills2 = CAREER_SKILLS_MAP[career2] || [];

  const avgSalaries: Record<string, number> = {
    "Software Engineer": 120000,
    "Data Scientist": 115000,
    "Product Manager": 130000,
    "UX Designer": 95000,
    "DevOps Engineer": 125000,
    "Data Analyst": 85000,
    "Frontend Developer": 110000,
    "Backend Developer": 115000,
    "Machine Learning Engineer": 140000,
    "Cloud Architect": 145000,
  };

  const career1Score = skills1.length * 10;
  const career2Score = skills2.length * 10;
  const salary1 = avgSalaries[career1] || 100000;
  const salary2 = avgSalaries[career2] || 100000;

  const recommendation = salary1 > salary2
    ? `${career1} offers higher earning potential`
    : salary2 > salary1
    ? `${career2} offers higher earning potential`
    : `Both careers have similar earning potential`;

  return {
    career1Score,
    career2Score,
    recommendation,
    comparison: {
      [career1]: { skills: skills1, avgSalary: salary1, skillCount: skills1.length },
      [career2]: { skills: skills2, avgSalary: salary2, skillCount: skills2.length },
    },
  };
}

export function generateSkillGap(
  currentSkills: string[],
  targetCareer: string
): { missingSkills: string[]; timeline: string; learningPlan: string[] } {
  const targetSkills = CAREER_SKILLS_MAP[targetCareer] || [];
  const normCurrent = normalizeSkills(currentSkills);
  const missingSkills = targetSkills.filter(s => !normCurrent.some(ns => ns.includes(s) || s.includes(ns)));

  const weeks = missingSkills.length * 2;
  const timeline = weeks <= 4 ? `${weeks} weeks` : weeks <= 12 ? `${Math.ceil(weeks / 4)} months` : `${Math.ceil(weeks / 12)} year(s)`;

  const learningPlan = missingSkills.slice(0, 5).map((skill, i) => {
    const resources: Record<string, string> = {
      "python": "Complete Python Bootcamp on Udemy",
      "javascript": "JavaScript30 by Wes Bos (free)",
      "react": "React official docs + build 3 projects",
      "sql": "SQLZoo + Mode Analytics SQL tutorial",
      "machine learning": "Andrew Ng's ML course on Coursera",
      "docker": "Docker Getting Started tutorial + Docker in Practice",
      "aws": "AWS Cloud Practitioner certification path",
      "tensorflow": "TensorFlow official tutorials",
      "kubernetes": "Kubernetes Basics on kubernetes.io",
      "git": "Pro Git book (free online)",
    };
    return `Week ${(i + 1) * 2 - 1}-${(i + 1) * 2}: ${resources[skill] || `Study ${skill} fundamentals and build a demo project`}`;
  });

  if (missingSkills.length === 0) {
    learningPlan.push("You already have the core skills! Focus on deepening expertise and building portfolio projects.");
  }

  return { missingSkills, timeline, learningPlan };
}

export const AVAILABLE_CAREERS = Object.keys(CAREER_SKILLS_MAP);
