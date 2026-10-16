import { PORT } from '../config/env.js';

export const sampleResumeData = {
  basics: {
    name: "Alex Pratama",
    label: "Senior Full Stack & AI Engineer",
    email: "alex.pratama@techcorp.io",
    phone: "+62 812 3456 7890",
    location: {
      city: "Jakarta",
      countryCode: "ID"
    },
    profiles: [
      { network: "LinkedIn", url: "https://linkedin.com/in/alexpratama" },
      { network: "GitHub", url: "https://github.com/alexpratama" }
    ],
    summary: "Results-driven Senior Full Stack Engineer with 7+ years of experience architecting resilient cloud systems and high-throughput microservices. Spearheaded AI workflow integrations reducing operational turnaround by 45%. Proven track record scaling platforms from 50k to 2M+ active users."
  },
  skills: [
    { name: "Frontend & Mobile", keywords: ["React", "Next.js", "TypeScript", "TailwindCSS"] },
    { name: "Backend & Systems", keywords: ["Node.js", "Go", "PostgreSQL", "Redis", "Kafka", "Docker", "Kubernetes"] },
    { name: "Cloud & AI", keywords: ["AWS", "GCP", "CI/CD", "LangChain", "Vector DB", "System Architecture"] }
  ],
  work: [
    {
      company: "Unicorn FinTech Indonesia",
      position: "Lead Software Engineer",
      location: "Jakarta, Indonesia",
      startDate: "2022-01",
      endDate: "Present",
      summary: "Direct technical execution for the payments core microservices and developer productivity platform.",
      highlights: [
        "Architected distributed real-time settlement engine processing $12M+ monthly GMV with 99.99% uptime.",
        "Automated payment reconciliation pipeline, slashing error resolution from 4 hours to under 3 minutes.",
        "Mentored squad of 8 engineers and introduced automated testing standards increasing code coverage from 62% to 91%."
      ]
    },
    {
      company: "Nexus Cloud Solutions",
      position: "Senior Backend Engineer",
      location: "Bandung, Indonesia",
      startDate: "2019-06",
      endDate: "2021-12",
      summary: "Core contributor to multi-tenant SaaS analytics platform.",
      highlights: [
        "Optimized query performance on PostgreSQL cluster, decreasing p99 latency by 68% across 15M records.",
        "Engineered asynchronous event processing workers using Redis streams, saving 35% server memory overhead.",
        "Designed and deployed enterprise REST and GraphQL APIs serving 40+ external corporate clients."
      ]
    }
  ],
  education: [
    {
      institution: "Institut Teknologi Bandung",
      area: "Informatics Engineering",
      studyType: "Bachelor of Science",
      startDate: "2015-08",
      endDate: "2019-06",
      score: "3.84 / 4.00"
    }
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect – Professional",
      issuer: "Amazon Web Services",
      date: "2023"
    }
  ]
};

export const sampleJobDescription = `We are looking for a Senior Full Stack & Cloud Engineer to join our growing tech team. 
Key Requirements:
- 5+ years of software engineering experience in modern JavaScript/TypeScript (Node.js, React, Next.js).
- Strong command of PostgreSQL, Redis, Docker, and Kubernetes microservices.
- Experience building and deploying high-availability cloud solutions on AWS or GCP.
- Familiarity with AI/LLM integration and automated CI/CD pipelines.
- Demonstrated leadership in mentoring developers and driving clean code architecture.`;

export function getHealth(req, res) {
  res.json({
    status: 'online',
    app: 'Micro-SaaS Web Studio',
    version: '1.0.0',
    port: PORT,
    timestamp: new Date().toISOString(),
    services: {
      atsResume: ['review', 'match', 'optimize-bullet', 'generate'],
      mediaConverter: ['convert-image', 'compress-image', 'images-to-pdf', 'compress-pdf', 'merge-pdfs', 'extract-pdf-text']
    }
  });
}

export function getSample(req, res) {
  res.json({
    sampleResumeData,
    sampleJobDescription
  });
}
