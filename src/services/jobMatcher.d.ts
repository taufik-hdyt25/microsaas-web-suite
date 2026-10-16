import { JobMatchResult, ResumeData } from '../types/resume.js';
export declare class JobMatcher {
    /**
     * Extract keywords present in a Job Description
     */
    static extractKeywords(text: string): string[];
    /**
     * Match resume against a job description
     */
    static match(resumeTextOrData: ResumeData | string, jobDescription: string): JobMatchResult;
}
//# sourceMappingURL=jobMatcher.d.ts.map