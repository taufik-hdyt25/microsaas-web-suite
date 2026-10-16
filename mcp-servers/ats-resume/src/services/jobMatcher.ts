import { JobMatchResult, ResumeData } from '../types/resume.js';

// Common technical skills, tools, cloud, and methodologies lexicon
const COMMON_TECH_KEYWORDS = [
  'javascript', 'typescript', 'python', 'golang', 'go', 'java', 'c++', 'rust', 'php', 'ruby',
  'react', 'next.js', 'vue', 'angular', 'svelte', 'node.js', 'express', 'nestjs', 'fastapi',
  'django', 'flask', 'spring boot', 'graphql', 'rest api', 'grpc', 'microservices',
  'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'terraform', 'ci/cd', 'github actions',
  'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'kafka', 'rabbitmq',
  'tailwind', 'sass', 'css', 'html', 'git', 'linux', 'agile', 'scrum', 'kanban',
  'system design', 'unit testing', 'jest', 'cypress', 'playwright', 'tdd', 'clean architecture',
  'event-driven', 'distributed systems', 'sql', 'nosql', 'serverless', 'lambda',
  'ai', 'llm', 'mcp', 'machine learning', 'nlp', 'prompt engineering', 'langchain',
  'data pipeline', 'etl', 'pandas', 'numpy', 'pytorch', 'tensorflow'
];

export class JobMatcher {
  /**
   * Extract keywords present in a Job Description
   */
  static extractKeywords(text: string): string[] {
    const lower = text.toLowerCase();
    const foundKeywords = new Set<string>();

    for (const keyword of COMMON_TECH_KEYWORDS) {
      // Regex with word boundaries
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
      if (pattern.test(lower)) {
        foundKeywords.add(keyword);
      }
    }

    // Also extract capitalized technical acronyms (e.g., AWS, API, SDK, CI/CD, CRM)
    const acronyms = text.match(/\b[A-Z]{2,5}\b/g) || [];
    for (const acr of acronyms) {
      if (!['AND', 'THE', 'FOR', 'WITH', 'YOU', 'OUR', 'ARE', 'NOT', 'CAN', 'ALL', 'WHO', 'JOB'].includes(acr)) {
        foundKeywords.add(acr.toLowerCase());
      }
    }

    return Array.from(foundKeywords);
  }

  /**
   * Match resume against a job description
   */
  static match(resumeTextOrData: ResumeData | string, jobDescription: string): JobMatchResult {
    const resumeText =
      typeof resumeTextOrData === 'string'
        ? resumeTextOrData.toLowerCase()
        : JSON.stringify(resumeTextOrData).toLowerCase();

    const jobKeywords = this.extractKeywords(jobDescription);
    const matchedSkills: string[] = [];
    const missingCriticalSkills: string[] = [];

    for (const kw of jobKeywords) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
      if (pattern.test(resumeText)) {
        matchedSkills.push(kw);
      } else {
        missingCriticalSkills.push(kw);
      }
    }

    const totalKeywords = jobKeywords.length;
    const matchScore = totalKeywords > 0 ? Math.round((matchedSkills.length / totalKeywords) * 100) : 100;

    const recommendations: string[] = [];

    if (missingCriticalSkills.length > 0) {
      const topMissing = missingCriticalSkills.slice(0, 6);
      recommendations.push(
        `Include high-priority missing keywords: ${topMissing.join(', ')} in your Skills or Experience highlights.`
      );
    }

    if (matchScore < 70) {
      recommendations.push(
        'Tailor your Professional Summary to mirror the core requirements and title mentioned in the job description.'
      );
    }

    if (matchedSkills.length > 0) {
      recommendations.push(
        `Great alignment found on ${matchedSkills.length} key competencies (${matchedSkills.slice(0, 5).join(', ')}...). Ensure these are highlighted near the top of your resume.`
      );
    }

    return {
      matchScore,
      matchedSkills,
      missingCriticalSkills,
      matchedKeywordsCount: matchedSkills.length,
      totalJobKeywordsCount: totalKeywords,
      recommendations,
    };
  }
}
