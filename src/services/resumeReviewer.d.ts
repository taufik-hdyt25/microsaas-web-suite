import { AtsReviewResult, ResumeData } from '../types/resume.js';
export declare const STRONG_ACTION_VERBS: Set<string>;
export declare const WEAK_PASSIVE_PHRASES: string[];
export declare class ResumeReviewer {
    /**
     * Comprehensive ATS Audit for structured ResumeData or raw text
     */
    static reviewStructuredResume(resume: ResumeData): AtsReviewResult;
    /**
     * Review unstructured raw resume text (e.g. from pasted text or extracted from PDF)
     */
    static reviewRawText(rawText: string): AtsReviewResult;
}
//# sourceMappingURL=resumeReviewer.d.ts.map