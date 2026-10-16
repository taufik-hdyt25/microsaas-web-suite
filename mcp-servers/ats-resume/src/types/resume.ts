export interface ContactInfo {
  fullName: string;
  professionalTitle?: string;
  email: string;
  phone?: string;
  location?: string; // e.g. "Jakarta, Indonesia" or "Remote / San Francisco, CA"
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface WorkExperience {
  role: string;
  company: string;
  location?: string;
  startDate: string; // e.g. "Jan 2022" or "2022"
  endDate: string; // e.g. "Present" or "Dec 2023"
  isCurrent?: boolean;
  highlights: string[]; // Bullet points
}

export interface Education {
  degree: string; // e.g. "Bachelor of Science in Computer Science"
  institution: string;
  location?: string;
  graduationDate: string; // e.g. "2023" or "May 2023"
  gpa?: string;
  honors?: string;
}

export interface Project {
  name: string;
  description?: string;
  technologies?: string[];
  link?: string;
  highlights: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date?: string;
  credentialUrl?: string;
}

export interface ResumeData {
  contact: ContactInfo;
  summary?: string;
  skills: {
    languages?: string[];
    frameworks?: string[];
    databases?: string[];
    tools?: string[];
    cloudAndDevOps?: string[];
    other?: string[];
  };
  experience: WorkExperience[];
  education: Education[];
  projects?: Project[];
  certifications?: Certification[];
}

export interface AtsReviewResult {
  overallScore: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'Needs Improvement';
  summary: string;
  breakdown: {
    contactCompleteness: { score: number; max: 15; notes: string };
    sectionsCompleteness: { score: number; max: 20; notes: string };
    actionVerbsStrength: { score: number; max: 25; notes: string };
    quantifiableImpact: { score: number; max: 25; notes: string };
    atsFormattingSafety: { score: number; max: 15; notes: string };
  };
  metrics: {
    totalBulletPoints: number;
    bulletsWithMetrics: number;
    bulletsWithMetricsPercent: number;
    strongActionVerbsCount: number;
    weakVerbsCount: number;
    estimatedWordCount: number;
  };
  weakVerbsFound: string[];
  redFlags: string[];
  strengths: string[];
  actionableRecommendations: string[];
}

export interface JobMatchResult {
  matchScore: number; // 0 - 100
  matchedSkills: string[];
  missingCriticalSkills: string[];
  matchedKeywordsCount: number;
  totalJobKeywordsCount: number;
  recommendations: string[];
}

export interface BulletOptimizationResult {
  originalBullet: string;
  optimizedVariations: {
    type: 'Impact-First' | 'Architecture/Technical' | 'Leadership/Execution';
    bullet: string;
    actionVerb: string;
    focus: string;
  }[];
  tips: string[];
}
