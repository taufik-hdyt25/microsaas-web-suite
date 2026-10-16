import { ResumeData } from '../types/resume.js';
export declare class ResumeGenerator {
    /**
     * Generate strict ATS-compatible Markdown
     * Follows 1-column layout, standard heading levels, and standard bullet characters
     */
    static generateMarkdown(resume: ResumeData): string;
    /**
     * Generate Plain Text ATS version
     */
    static generatePlainText(resume: ResumeData): string;
    /**
     * Generate clean semantic HTML with ATS-optimized styling
     */
    static generateHtml(resume: ResumeData): string;
    /**
     * Generate standard JSONResume format
     */
    static generateJson(resume: ResumeData): any;
    /**
     * Save generated resume files to disk
     */
    static saveResumeFiles(resume: ResumeData, outputDirectory: string, baseName?: string): Promise<{
        success: boolean;
        directory: string;
        files: {
            markdown: string;
            plainText: string;
            html: string;
            json: string;
        };
    }>;
}
//# sourceMappingURL=resumeGenerator.d.ts.map