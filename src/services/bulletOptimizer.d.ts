import { BulletOptimizationResult } from '../types/resume.js';
export interface OptimizeBulletOptions {
    draftBullet: string;
    roleTitle?: string;
    technologies?: string[];
    targetMetricPlaceholder?: string;
}
export declare class BulletOptimizer {
    /**
     * Optimize a bullet point with STAR format (Situation, Task, Action, Result)
     */
    static optimize(options: OptimizeBulletOptions): BulletOptimizationResult;
}
//# sourceMappingURL=bulletOptimizer.d.ts.map