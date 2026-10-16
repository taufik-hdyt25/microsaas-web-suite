export class BulletOptimizer {
    /**
     * Optimize a bullet point with STAR format (Situation, Task, Action, Result)
     */
    static optimize(options) {
        const raw = options.draftBullet.trim().replace(/^[-*•]\s*/, '');
        const techStr = options.technologies?.length ? ` using ${options.technologies.slice(0, 3).join(', ')}` : '';
        const metric = options.targetMetricPlaceholder || '[X]% improvement in performance/efficiency';
        // Pick top power action verbs
        const impactVerbs = ['Accelerated', 'Boosted', 'Optimized', 'Maximized', 'Slashed'];
        const techVerbs = ['Architected', 'Engineered', 'Modernized', 'Refactored', 'Spearheaded'];
        const leadVerbs = ['Orchestrated', 'Delivered', 'Streamlined', 'Led', 'Championed'];
        const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const v1 = pick(impactVerbs);
        const v2 = pick(techVerbs);
        const v3 = pick(leadVerbs);
        // Clean description from draft
        let cleanDraft = raw
            .replace(/^(i\s+was\s+responsible\s+for|i\s+worked\s+on|helped\s+with|assisted\s+in|worked\s+on)\s+/i, '')
            .replace(/^([a-z])/i, (c) => c.toLowerCase());
        const variations = [
            {
                type: 'Impact-First',
                bullet: `${v1} core system throughput by ${metric} through implementing ${cleanDraft}${techStr}.`,
                actionVerb: v1,
                focus: 'Leads with quantifiable business outcome to catch recruiter and hiring manager attention within 6 seconds.',
            },
            {
                type: 'Architecture/Technical',
                bullet: `${v2} end-to-end solution for ${cleanDraft}${techStr}, ensuring high availability, test coverage, and seamless CI/CD delivery.`,
                actionVerb: v2,
                focus: 'Highlights technical competence, clean code architecture, and modern engineering practices.',
            },
            {
                type: 'Leadership/Execution',
                bullet: `${v3} cross-functional initiative to deliver ${cleanDraft}, coordinating requirements and accelerating deployment cycle by [X] weeks.`,
                actionVerb: v3,
                focus: 'Demonstrates ownership, team collaboration, and proactive problem-solving.',
            },
        ];
        return {
            originalBullet: options.draftBullet,
            optimizedVariations: variations,
            tips: [
                'Replace placeholders like [X]% or [X] weeks with your actual measurable team numbers.',
                'Always start every bullet with a past-tense action verb (unless describing your current ongoing role).',
                'Avoid passive phrases like "Responsible for" or "Assisted with" - claim your direct contribution.',
            ],
        };
    }
}
//# sourceMappingURL=bulletOptimizer.js.map