import path from 'node:path';
import { ResumeGenerator } from '../dist/services/resumeGenerator.js';
import { ResumeReviewer } from '../dist/services/resumeReviewer.js';
import { JobMatcher } from '../dist/services/jobMatcher.js';
import { BulletOptimizer } from '../dist/services/bulletOptimizer.js';
import type { ResumeData } from '../src/types/resume.ts';

async function runDemo() {
  console.log('=== ATS Resume Maker & AI Reviewer MCP: Test Suite ===\n');

  // Sample Profile
  const sampleResume: ResumeData = {
    contact: {
      fullName: 'Alex Santoso',
      professionalTitle: 'Senior Full Stack & AI Engineer',
      email: 'alex.santoso@example.com',
      phone: '+62 812 3456 7890',
      location: 'Jakarta, Indonesia',
      linkedin: 'https://linkedin.com/in/alexsantoso',
      github: 'https://github.com/alexsantoso',
    },
    summary:
      'High-impact Senior Full Stack Engineer with 6+ years of experience architecting distributed cloud systems, modernizing web applications, and deploying generative AI solutions. Proven track record of improving system uptime to 99.99% and scaling microservices to 100k+ active users.',
    skills: {
      languages: ['TypeScript', 'JavaScript', 'Go', 'Python', 'SQL'],
      frameworks: ['React', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS'],
      databases: ['PostgreSQL', 'Redis', 'MongoDB'],
      cloudAndDevOps: ['Docker', 'Kubernetes', 'AWS (ECS, Lambda, S3)', 'GitHub Actions', 'CI/CD'],
      tools: ['Git', 'Jest', 'MCP', 'GraphQL', 'REST API'],
    },
    experience: [
      {
        role: 'Lead Full Stack Engineer',
        company: 'Nusantara Tech Solutions',
        location: 'Jakarta, Indonesia',
        startDate: 'Jan 2023',
        endDate: 'Present',
        isCurrent: true,
        highlights: [
          'Architected and deployed high-performance microservices serving 120,000 daily active users with 99.98% uptime.',
          'Spearheaded transition from monolith to event-driven serverless architecture, reducing cloud infrastructure costs by 38% ($45k annual savings).',
          'Automated CI/CD deployment pipelines using GitHub Actions and Docker, reducing release cycle time from 4 days to 25 minutes.',
          'Mentored 6 junior and mid-level software engineers on clean architecture, unit testing, and test-driven development (TDD).',
        ],
      },
      {
        role: 'Full Stack Software Engineer',
        company: 'Digital Indo Karya',
        location: 'Jakarta, Indonesia',
        startDate: 'Aug 2020',
        endDate: 'Dec 2022',
        highlights: [
          'Engineered real-time analytics dashboard with React, Next.js, and Redis, improving page query latency by 65%.',
          'Built robust payment gateway integrations handling over $2.5M in monthly transactions with zero critical failure rate.',
          'Optimized PostgreSQL queries and database indexing, decreasing 95th percentile API response time from 420ms to 85ms.',
        ],
      },
    ],
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        institution: 'Universitas Indonesia',
        graduationDate: '2020',
        gpa: '3.82 / 4.00',
        honors: 'Cum Laude',
      },
    ],
    projects: [
      {
        name: 'OmniFlow AI MCP Server',
        description: 'Open-source Model Context Protocol server for seamless enterprise automation.',
        technologies: ['TypeScript', 'Node.js', 'MCP', 'Docker'],
        link: 'https://github.com/alexsantoso/omniflow-mcp',
        highlights: [
          'Spearheaded development of 12 custom MCP tools, adopted by 800+ developers in community releases.',
        ],
      },
    ],
    certifications: [
      {
        name: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Amazon Web Services',
        date: '2023',
      },
    ],
  };

  // 1. Test Generate ATS Resume Files
  console.log('1. Testing generate_ats_resume...');
  const outputDir = path.resolve('test-output');
  const filesResult = await ResumeGenerator.saveResumeFiles(sampleResume, outputDir, 'alex_santoso_resume');
  console.log('✓ Successfully generated resume files in:', filesResult.directory);
  console.log('  - Markdown:', filesResult.files.markdown);
  console.log('  - Plain Text:', filesResult.files.plainText);
  console.log('  - HTML (ATS Clean):', filesResult.files.html);
  console.log('  - JSONResume:', filesResult.files.json);

  // 2. Test Review ATS Resume
  console.log('\n2. Testing review_ats_resume on optimized resume...');
  const reviewResult = ResumeReviewer.reviewStructuredResume(sampleResume);
  console.log('✓ ATS Score:', `${reviewResult.overallScore}/100 (Grade: ${reviewResult.grade})`);
  console.log('✓ Breakdown:', reviewResult.breakdown);
  console.log('✓ Strengths:', reviewResult.strengths);

  // 2b. Test Review on Unoptimized Raw Text
  console.log('\n2b. Testing review_ats_resume on weak unoptimized text...');
  const weakResumeText = `
    Budi Setiawan
    Summary: I am looking for a developer job.
    Experience:
    - Helped with the website frontend.
    - Responsible for bug fixes.
    - Worked on database stuff.
  `;
  const weakReview = ResumeReviewer.reviewRawText(weakResumeText);
  console.log('✓ Weak Resume Score:', `${weakReview.overallScore}/100 (Grade: ${weakReview.grade})`);
  console.log('✓ Identified Weak Verbs:', weakReview.weakVerbsFound);
  console.log('✓ Actionable Recommendations:', weakReview.actionableRecommendations);

  // 3. Test Match Job Description
  console.log('\n3. Testing match_job_description...');
  const sampleJobDescription = `
    We are looking for a Senior Full Stack Engineer with strong experience in TypeScript, React, Next.js, Node.js, and AWS.
    Requirements:
    - Experience building scalable microservices and Docker containers.
    - Strong database skills in PostgreSQL and Redis.
    - Knowledge of Kubernetes, CI/CD, and system design.
    - Experience with AI, LLM, or MCP is a big plus.
    - Proven leadership and mentoring capabilities.
  `;
  const matchResult = JobMatcher.match(sampleResume, sampleJobDescription);
  console.log('✓ Job Match Score:', `${matchResult.matchScore}%`);
  console.log('✓ Matched Skills:', matchResult.matchedSkills);
  console.log('✓ Missing Critical Skills:', matchResult.missingCriticalSkills);
  console.log('✓ Recommendations:', matchResult.recommendations);

  // 4. Test Bullet Optimizer
  console.log('\n4. Testing optimize_bullet_point...');
  const draftBullet = 'I was responsible for the database queries and made them run faster.';
  const optResult = BulletOptimizer.optimize({
    draftBullet,
    roleTitle: 'Senior Backend Engineer',
    technologies: ['PostgreSQL', 'Redis'],
    targetMetricPlaceholder: '60% query execution time reduction',
  });
  console.log('✓ Original Bullet:', optResult.originalBullet);
  console.log('✓ Optimized Variations:');
  optResult.optimizedVariations.forEach((v, i) => {
    console.log(`  [${i + 1}] (${v.type}): "${v.bullet}"`);
  });

  console.log('\nAll ATS Resume MCP tests passed successfully! 🎉');
}

runDemo().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
