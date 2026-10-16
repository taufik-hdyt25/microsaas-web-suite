#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ErrorCode, McpError, } from '@modelcontextprotocol/sdk/types.js';
import { ResumeGenerator } from './services/resumeGenerator.js';
import { ResumeReviewer } from './services/resumeReviewer.js';
import { JobMatcher } from './services/jobMatcher.js';
import { BulletOptimizer } from './services/bulletOptimizer.js';
const server = new Server({
    name: 'ats-resume-mcp',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'generate_ats_resume',
                description: 'Generate professional, ATS-optimized resume files from structured profile data. Outputs strict 1-column Markdown, Plain Text, Printable semantic HTML, and JSONResume standard schema.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        resume: {
                            type: 'object',
                            description: 'Structured resume data containing contact, summary, skills, experience, education, projects, certifications',
                            properties: {
                                contact: {
                                    type: 'object',
                                    properties: {
                                        fullName: { type: 'string' },
                                        professionalTitle: { type: 'string' },
                                        email: { type: 'string' },
                                        phone: { type: 'string' },
                                        location: { type: 'string' },
                                        linkedin: { type: 'string' },
                                        github: { type: 'string' },
                                        portfolio: { type: 'string' },
                                    },
                                    required: ['fullName', 'email'],
                                },
                                summary: { type: 'string' },
                                skills: {
                                    type: 'object',
                                    properties: {
                                        languages: { type: 'array', items: { type: 'string' } },
                                        frameworks: { type: 'array', items: { type: 'string' } },
                                        databases: { type: 'array', items: { type: 'string' } },
                                        tools: { type: 'array', items: { type: 'string' } },
                                        cloudAndDevOps: { type: 'array', items: { type: 'string' } },
                                        other: { type: 'array', items: { type: 'string' } },
                                    },
                                },
                                experience: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            role: { type: 'string' },
                                            company: { type: 'string' },
                                            location: { type: 'string' },
                                            startDate: { type: 'string' },
                                            endDate: { type: 'string' },
                                            isCurrent: { type: 'boolean' },
                                            highlights: { type: 'array', items: { type: 'string' } },
                                        },
                                        required: ['role', 'company', 'startDate', 'endDate', 'highlights'],
                                    },
                                },
                                education: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            degree: { type: 'string' },
                                            institution: { type: 'string' },
                                            graduationDate: { type: 'string' },
                                            gpa: { type: 'string' },
                                            honors: { type: 'string' },
                                        },
                                        required: ['degree', 'institution', 'graduationDate'],
                                    },
                                },
                                projects: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            name: { type: 'string' },
                                            description: { type: 'string' },
                                            technologies: { type: 'array', items: { type: 'string' } },
                                            link: { type: 'string' },
                                            highlights: { type: 'array', items: { type: 'string' } },
                                        },
                                        required: ['name', 'highlights'],
                                    },
                                },
                                certifications: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            name: { type: 'string' },
                                            issuer: { type: 'string' },
                                            date: { type: 'string' },
                                            credentialUrl: { type: 'string' },
                                        },
                                        required: ['name', 'issuer'],
                                    },
                                },
                            },
                            required: ['contact', 'experience', 'skills', 'education'],
                        },
                        outputDirectory: {
                            type: 'string',
                            description: 'Optional folder path to write resume files (.md, .txt, .html, .json) to disk',
                        },
                        baseFileName: {
                            type: 'string',
                            description: 'Base filename prefix (default: "resume")',
                        },
                    },
                    required: ['resume'],
                },
            },
            {
                name: 'review_ats_resume',
                description: 'Audit and score a resume (structured JSON or raw text) for ATS compliance. Evaluates contact completeness, action verb strength, quantifiable impact metrics, ATS formatting safety, and red flags.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        resume: {
                            type: 'object',
                            description: 'Structured resume object (optional if resumeText is provided)',
                        },
                        resumeText: {
                            type: 'string',
                            description: 'Raw text of the resume (optional if resume object is provided)',
                        },
                    },
                },
            },
            {
                name: 'match_job_description',
                description: 'Compare a resume against a target Job Description (JD). Calculates match percentage, identifies missing critical technical keywords, and provides bullet rewrite suggestions.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        resume: {
                            type: 'object',
                            description: 'Structured resume object (optional if resumeText is provided)',
                        },
                        resumeText: {
                            type: 'string',
                            description: 'Raw text of the resume (optional if resume object is provided)',
                        },
                        jobDescription: {
                            type: 'string',
                            description: 'Full text of the target job posting / requirements',
                        },
                    },
                    required: ['jobDescription'],
                },
            },
            {
                name: 'optimize_bullet_point',
                description: 'Rewrite a weak or draft resume bullet point using the STAR method (Situation, Task, Action, Result) with strong power verbs and quantifiable impact.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        draftBullet: {
                            type: 'string',
                            description: 'Draft or existing bullet point (e.g. "I worked on the backend API and made it faster")',
                        },
                        roleTitle: {
                            type: 'string',
                            description: 'Job title context (e.g. "Senior Backend Engineer")',
                        },
                        technologies: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Tech stack used in this bullet (e.g. ["Go", "Redis", "PostgreSQL"])',
                        },
                        targetMetricPlaceholder: {
                            type: 'string',
                            description: 'Metric placeholder (e.g. "reduced latency by 45%")',
                        },
                    },
                    required: ['draftBullet'],
                },
            },
        ],
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case 'generate_ats_resume': {
                const resumeData = args.resume;
                const markdown = ResumeGenerator.generateMarkdown(resumeData);
                const plainText = ResumeGenerator.generatePlainText(resumeData);
                const html = ResumeGenerator.generateHtml(resumeData);
                const json = ResumeGenerator.generateJson(resumeData);
                let savedFilesInfo = null;
                if (args.outputDirectory) {
                    savedFilesInfo = await ResumeGenerator.saveResumeFiles(resumeData, args.outputDirectory, args.baseFileName || 'resume');
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                markdown,
                                plainText,
                                html,
                                json,
                                savedFiles: savedFilesInfo,
                            }, null, 2),
                        },
                    ],
                };
            }
            case 'review_ats_resume': {
                const { resume, resumeText } = args || {};
                let reviewResult;
                if (resume && typeof resume === 'object') {
                    reviewResult = ResumeReviewer.reviewStructuredResume(resume);
                }
                else if (resumeText && typeof resumeText === 'string') {
                    reviewResult = ResumeReviewer.reviewRawText(resumeText);
                }
                else {
                    throw new McpError(ErrorCode.InvalidParams, 'Either "resume" object or "resumeText" string must be provided.');
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(reviewResult, null, 2),
                        },
                    ],
                };
            }
            case 'match_job_description': {
                const { resume, resumeText, jobDescription } = args || {};
                if (!jobDescription) {
                    throw new McpError(ErrorCode.InvalidParams, '"jobDescription" is required.');
                }
                const targetData = resume || resumeText;
                if (!targetData) {
                    throw new McpError(ErrorCode.InvalidParams, 'Either "resume" object or "resumeText" string is required.');
                }
                const matchResult = JobMatcher.match(targetData, jobDescription);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(matchResult, null, 2),
                        },
                    ],
                };
            }
            case 'optimize_bullet_point': {
                const optResult = BulletOptimizer.optimize(args);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(optResult, null, 2),
                        },
                    ],
                };
            }
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Error executing ${name}: ${error.message || String(error)}`,
                },
            ],
            isError: true,
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('ATS Resume MCP Server running on stdio');
}
main().catch((err) => {
    console.error('Fatal error running ATS Resume MCP Server:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map