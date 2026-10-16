import { AtsReviewResult, ResumeData } from '../types/resume.js';

export const STRONG_ACTION_VERBS = new Set([
  'accelerated', 'achieved', 'administered', 'advised', 'advocated', 'analyzed',
  'architected', 'audited', 'automated', 'boosted', 'built', 'centralized',
  'championed', 'collaborated', 'consolidated', 'constructed', 'converted',
  'coordinated', 'created', 'customized', 'decreased', 'delivered', 'deployed',
  'designed', 'developed', 'devised', 'directed', 'documented', 'doubled',
  'drafted', 'drove', 'eliminated', 'engineered', 'enhanced', 'established',
  'evaluated', 'executed', 'expanded', 'expedited', 'facilitated', 'formulated',
  'fostered', 'founded', 'generated', 'governed', 'guided', 'halved', 'headed',
  'identified', 'implemented', 'improved', 'increased', 'initiated', 'innovated',
  'installed', 'instituted', 'integrated', 'introduced', 'invented', 'launched',
  'lead', 'led', 'leveraged', 'managed', 'maximized', 'mentored', 'migrated',
  'minimized', 'modernized', 'monitored', 'motivated', 'negotiated', 'optimized',
  'orchestrated', 'organized', 'overhauled', 'oversaw', 'partnered', 'performed',
  'pioneered', 'planned', 'produced', 'programmed', 'promoted', 'published',
  'reduced', 'refactored', 'reorganized', 'resolved', 'restructured', 'revamped',
  'revitalized', 'saved', 'scaled', 'scheduled', 'secured', 'simplified',
  'slashed', 'solicited', 'solved', 'spearheaded', 'standardized', 'steered',
  'streamlined', 'strengthened', 'structured', 'surpassed', 'systematized',
  'targeted', 'tested', 'trained', 'transformed', 'transitioned', 'tripled',
  'unified', 'upgraded', 'validated', 'yielded'
]);

export const WEAK_PASSIVE_PHRASES = [
  'assisted with', 'assisted in', 'helped with', 'helped to', 'responsible for',
  'worked on', 'participated in', 'handled', 'was involved in', 'tasked with',
  'duties included', 'aided in', 'supported the', 'tried to', 'contributed to',
  'helped', 'assisted'
];

export class ResumeReviewer {
  /**
   * Comprehensive ATS Audit for structured ResumeData or raw text
   */
  static reviewStructuredResume(resume: ResumeData): AtsReviewResult {
    let contactScore = 0;
    const contactNotes: string[] = [];

    // 1. Contact Completeness (15 pts)
    if (resume.contact.fullName && resume.contact.fullName.trim().length > 2) {
      contactScore += 4;
    } else {
      contactNotes.push('Missing full name');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (resume.contact.email && emailRegex.test(resume.contact.email)) {
      contactScore += 4;
    } else {
      contactNotes.push('Invalid or missing professional email');
    }

    if (resume.contact.phone && resume.contact.phone.replace(/[^0-9]/g, '').length >= 8) {
      contactScore += 3;
    } else {
      contactNotes.push('Missing contact phone number');
    }

    if (resume.contact.linkedin || resume.contact.github || resume.contact.portfolio) {
      contactScore += 4;
    } else {
      contactNotes.push('Missing professional link (LinkedIn, GitHub, or Portfolio)');
    }

    // 2. Sections Completeness (20 pts)
    let sectionsScore = 0;
    const sectionNotes: string[] = [];

    if (resume.summary && resume.summary.length >= 40) {
      sectionsScore += 5;
    } else {
      sectionNotes.push('Summary is too brief or missing (aim for 2-4 sentences)');
    }

    if (resume.experience && resume.experience.length >= 1) {
      sectionsScore += 6;
      const totalBullets = resume.experience.reduce((sum, e) => sum + e.highlights.length, 0);
      if (totalBullets >= 3) {
        sectionsScore += 2;
      } else {
        sectionNotes.push('Add more detail/bullet points to your work experience');
      }
    } else {
      sectionNotes.push('No professional experience listed');
    }

    const skillCount = Object.values(resume.skills || {}).flat().length;
    if (skillCount >= 6) {
      sectionsScore += 4;
    } else {
      sectionNotes.push('Skills section has fewer than 6 keywords (aim for 10-18 targeted skills)');
    }

    if (resume.education && resume.education.length >= 1) {
      sectionsScore += 3;
    } else {
      sectionNotes.push('Missing education section');
    }

    // 3. Action Verbs Strength & Bullet Analysis (25 pts)
    const allBullets: string[] = [];
    (resume.experience || []).forEach((e) => allBullets.push(...e.highlights));
    (resume.projects || []).forEach((p) => allBullets.push(...p.highlights));

    let strongVerbsCount = 0;
    const weakVerbsFound: string[] = [];

    for (const bullet of allBullets) {
      const lowerBullet = bullet.toLowerCase().trim();
      const firstWord = lowerBullet.split(/[^a-zA-Z]/)[0];

      if (STRONG_ACTION_VERBS.has(firstWord)) {
        strongVerbsCount++;
      }

      for (const weak of WEAK_PASSIVE_PHRASES) {
        if (lowerBullet.includes(weak)) {
          if (!weakVerbsFound.includes(weak)) weakVerbsFound.push(weak);
        }
      }
    }

    let verbScore = 0;
    if (allBullets.length > 0) {
      const strongRatio = strongVerbsCount / allBullets.length;
      if (strongRatio >= 0.7) verbScore = 25;
      else if (strongRatio >= 0.5) verbScore = 20;
      else if (strongRatio >= 0.3) verbScore = 15;
      else verbScore = Math.max(5, Math.round(strongRatio * 25));

      // Penalty for weak verbs
      verbScore = Math.max(0, verbScore - weakVerbsFound.length * 3);
    }

    // 4. Quantifiable Metrics & Results (25 pts)
    // Regex for numbers, percentages, currency, metrics (e.g. 30%, $100K, 2x, 500ms, 10k users)
    const metricPattern = /(\d+(?:\.\d+)?%|\$\s?\d+(?:,\d+)*(?:\.\d+)?[kKmMbB]?|\b\d{2,}\b|\b(?:2x|3x|5x|10x)\b|\b\d+(?:k|K|M|ms|s)\b)/;
    let bulletsWithMetrics = 0;

    for (const bullet of allBullets) {
      if (metricPattern.test(bullet)) {
        bulletsWithMetrics++;
      }
    }

    let metricsScore = 0;
    const metricRatio = allBullets.length > 0 ? bulletsWithMetrics / allBullets.length : 0;
    if (metricRatio >= 0.6) metricsScore = 25;
    else if (metricRatio >= 0.4) metricsScore = 20;
    else if (metricRatio >= 0.25) metricsScore = 15;
    else if (metricRatio > 0) metricsScore = 10;
    else metricsScore = 2;

    // 5. ATS Formatting Safety (15 pts)
    let formatScore = 15;
    const redFlags: string[] = [];

    const resumeText = JSON.stringify(resume);
    if (/[\u{1F300}-\u{1F9FF}]/u.test(resumeText)) {
      formatScore -= 5;
      redFlags.push('Contains emoji/icons. Most ATS parsers (Taleo, Workday) fail or produce garbled text with emojis.');
    }

    if (/\b(?:★|☆|●|◆|▲|➔|➤)\b/.test(resumeText)) {
      formatScore -= 3;
      redFlags.push('Contains decorative special characters. Stick to standard bullet points (-) or (*).');
    }

    if (allBullets.some((b) => b.length > 250)) {
      formatScore -= 3;
      redFlags.push('Some bullet points are too long (> 250 characters). Break them down into concise 1-2 line statements.');
    }

    formatScore = Math.max(0, formatScore);

    // Compute Overall Score
    const totalScore = Math.min(
      100,
      contactScore + sectionsScore + verbScore + metricsScore + formatScore
    );

    let grade: AtsReviewResult['grade'] = 'Needs Improvement';
    if (totalScore >= 90) grade = 'A+';
    else if (totalScore >= 80) grade = 'A';
    else if (totalScore >= 70) grade = 'B';
    else if (totalScore >= 55) grade = 'C';

    const strengths: string[] = [];
    if (contactScore >= 14) strengths.push('Complete, professional contact details with portfolio links.');
    if (sectionsScore >= 18) strengths.push('Strong structural section coverage (Summary, Experience, Skills, Education).');
    if (strongVerbsCount >= allBullets.length * 0.6 && allBullets.length > 0) {
      strengths.push('Excellent use of high-impact action verbs at the beginning of bullet points.');
    }
    if (bulletsWithMetrics >= allBullets.length * 0.4 && allBullets.length > 0) {
      strengths.push('Strong quantifiable evidence (metrics, percentages, numbers) demonstrating measurable business impact.');
    }
    if (redFlags.length === 0) strengths.push('Clean ATS compliance without dangerous formatting traps (tables, weird symbols, columns).');

    const actionableRecommendations: string[] = [];
    if (weakVerbsFound.length > 0) {
      actionableRecommendations.push(
        `Replace passive phrases (${weakVerbsFound.join(', ')}) with strong action verbs like "Spearheaded", "Engineered", "Optimized", or "Delivered".`
      );
    }
    if (metricRatio < 0.4) {
      actionableRecommendations.push(
        'Increase quantifiable metrics: Add measurable results (e.g. "reduced latency by 35%", "scaled API to 50k DAU", "saved 10 hours/week") to at least 50% of your bullets.'
      );
    }
    if (sectionNotes.length > 0) {
      actionableRecommendations.push(...sectionNotes);
    }
    if (contactNotes.length > 0) {
      actionableRecommendations.push(...contactNotes);
    }

    // Word count estimation
    const words = resumeText.split(/\s+/).length;

    return {
      overallScore: totalScore,
      grade,
      summary: `Your resume received an ATS score of ${totalScore}/100 (Grade: ${grade}). ${
        totalScore >= 80
          ? 'It is well-optimized to pass modern ATS screening algorithms.'
          : 'It requires keyword and impact metric adjustments to consistently pass automated filters.'
      }`,
      breakdown: {
        contactCompleteness: {
          score: contactScore,
          max: 15,
          notes: contactNotes.join('; ') || 'Perfect contact info',
        },
        sectionsCompleteness: {
          score: sectionsScore,
          max: 20,
          notes: sectionNotes.join('; ') || 'All critical sections present',
        },
        actionVerbsStrength: {
          score: verbScore,
          max: 25,
          notes: `${strongVerbsCount}/${allBullets.length} bullets start with power verbs`,
        },
        quantifiableImpact: {
          score: metricsScore,
          max: 25,
          notes: `${bulletsWithMetrics}/${allBullets.length} bullets contain quantifiable metrics`,
        },
        atsFormattingSafety: {
          score: formatScore,
          max: 15,
          notes: redFlags.length === 0 ? 'Compliant 1-column layout' : `${redFlags.length} warnings detected`,
        },
      },
      metrics: {
        totalBulletPoints: allBullets.length,
        bulletsWithMetrics,
        bulletsWithMetricsPercent: allBullets.length > 0 ? Math.round((bulletsWithMetrics / allBullets.length) * 100) : 0,
        strongActionVerbsCount: strongVerbsCount,
        weakVerbsCount: weakVerbsFound.length,
        estimatedWordCount: words,
      },
      weakVerbsFound,
      redFlags,
      strengths,
      actionableRecommendations,
    };
  }

  /**
   * Review unstructured raw resume text (e.g. from pasted text or extracted from PDF)
   */
  static reviewRawText(rawText: string): AtsReviewResult {
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    const words = rawText.split(/\s+/).filter(Boolean);

    let contactScore = 0;
    const contactNotes: string[] = [];

    // Email check
    const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      contactScore += 5;
    } else {
      contactNotes.push('No valid email address found');
    }

    // Phone check
    const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,5}/);
    if (phoneMatch) {
      contactScore += 4;
    } else {
      contactNotes.push('No telephone number found');
    }

    // LinkedIn / GitHub link check
    if (/linkedin\.com/i.test(rawText) || /github\.com/i.test(rawText)) {
      contactScore += 6;
    } else {
      contactNotes.push('Missing LinkedIn or GitHub profile link');
    }

    // Section detection
    let sectionsScore = 0;
    const sectionNotes: string[] = [];
    const lowerText = rawText.toLowerCase();

    if (/summary|professional summary|objective|about me/i.test(lowerText)) {
      sectionsScore += 5;
    } else {
      sectionNotes.push('Missing standard Summary/Objective heading');
    }

    if (/experience|employment|work history/i.test(lowerText)) {
      sectionsScore += 6;
    } else {
      sectionNotes.push('Missing standard Experience section heading');
    }

    if (/education|academic/i.test(lowerText)) {
      sectionsScore += 4;
    } else {
      sectionNotes.push('Missing Education section heading');
    }

    if (/skills|technical skills|competencies/i.test(lowerText)) {
      sectionsScore += 5;
    } else {
      sectionNotes.push('Missing Technical Skills section heading');
    }

    // Bullet points and verbs
    const bulletLines = lines.filter((l) => l.startsWith('-') || l.startsWith('*') || l.startsWith('•') || /^\d+\./.test(l));
    const effectiveBullets = bulletLines.length > 0 ? bulletLines : lines.filter((l) => l.length > 30);

    let strongVerbsCount = 0;
    const weakVerbsFound: string[] = [];

    for (const b of effectiveBullets) {
      const cleanBullet = b.replace(/^[-*•\d.]+\s*/, '').toLowerCase();
      const firstWord = cleanBullet.split(/[^a-zA-Z]/)[0];
      if (STRONG_ACTION_VERBS.has(firstWord)) {
        strongVerbsCount++;
      }

      for (const weak of WEAK_PASSIVE_PHRASES) {
        if (cleanBullet.includes(weak)) {
          if (!weakVerbsFound.includes(weak)) weakVerbsFound.push(weak);
        }
      }
    }

    let verbScore = 0;
    if (effectiveBullets.length > 0) {
      const strongRatio = strongVerbsCount / effectiveBullets.length;
      if (strongRatio >= 0.6) verbScore = 25;
      else if (strongRatio >= 0.4) verbScore = 18;
      else if (strongRatio >= 0.2) verbScore = 12;
      else verbScore = Math.max(5, Math.round(strongRatio * 20));

      verbScore = Math.max(0, verbScore - weakVerbsFound.length * 3);
    }

    // Metrics detection
    const metricPattern = /(\d+(?:\.\d+)?%|\$\s?\d+(?:,\d+)*(?:\.\d+)?[kKmMbB]?|\b\d{2,}\b|\b(?:2x|3x|5x|10x)\b|\b\d+(?:k|K|M|ms|s)\b)/;
    let bulletsWithMetrics = 0;
    for (const b of effectiveBullets) {
      if (metricPattern.test(b)) {
        bulletsWithMetrics++;
      }
    }

    let metricsScore = 0;
    const metricRatio = effectiveBullets.length > 0 ? bulletsWithMetrics / effectiveBullets.length : 0;
    if (metricRatio >= 0.5) metricsScore = 25;
    else if (metricRatio >= 0.35) metricsScore = 18;
    else if (metricRatio >= 0.2) metricsScore = 12;
    else if (metricRatio > 0) metricsScore = 8;
    else metricsScore = 2;

    // Formatting check
    let formatScore = 15;
    const redFlags: string[] = [];

    if (/[\u{1F300}-\u{1F9FF}]/u.test(rawText)) {
      formatScore -= 5;
      redFlags.push('Contains emojis which break ATS text parsing.');
    }

    if (rawText.includes('|') && rawText.includes('---')) {
      formatScore -= 4;
      redFlags.push('Contains markdown tables. ATS engines frequently fail to extract text in tables in reading order.');
    }

    if (words.length < 150) {
      formatScore -= 4;
      redFlags.push('Resume is too short (< 150 words). Provide more context on responsibilities and outcomes.');
    } else if (words.length > 1100) {
      formatScore -= 3;
      redFlags.push('Resume exceeds 1100 words. Condense to 1-2 pages maximum for optimal readability.');
    }

    formatScore = Math.max(0, formatScore);

    const totalScore = Math.min(100, contactScore + sectionsScore + verbScore + metricsScore + formatScore);

    let grade: AtsReviewResult['grade'] = 'Needs Improvement';
    if (totalScore >= 90) grade = 'A+';
    else if (totalScore >= 80) grade = 'A';
    else if (totalScore >= 70) grade = 'B';
    else if (totalScore >= 55) grade = 'C';

    const strengths: string[] = [];
    if (contactScore >= 12) strengths.push('Clear contact details and professional links.');
    if (sectionsScore >= 16) strengths.push('Standard, recognized section titles that ATS parsers easily index.');
    if (strongVerbsCount >= 5) strengths.push('Active power verbs utilized in experience bullet points.');
    if (bulletsWithMetrics >= 3) strengths.push('Quantifiable metrics present in achievements.');

    const actionableRecommendations: string[] = [];
    if (weakVerbsFound.length > 0) {
      actionableRecommendations.push(`Replace weak phrases (${weakVerbsFound.join(', ')}) with strong impact verbs.`);
    }
    if (metricRatio < 0.35) {
      actionableRecommendations.push('Quantify accomplishments with concrete numbers, percentages, or scale metrics.');
    }
    if (sectionNotes.length > 0) actionableRecommendations.push(...sectionNotes);
    if (contactNotes.length > 0) actionableRecommendations.push(...contactNotes);

    return {
      overallScore: totalScore,
      grade,
      summary: `Your resume received an ATS score of ${totalScore}/100 (Grade: ${grade}).`,
      breakdown: {
        contactCompleteness: { score: contactScore, max: 15, notes: contactNotes.join('; ') || 'Contact details valid' },
        sectionsCompleteness: { score: sectionsScore, max: 20, notes: sectionNotes.join('; ') || 'Standard sections present' },
        actionVerbsStrength: { score: verbScore, max: 25, notes: `${strongVerbsCount} strong verbs found` },
        quantifiableImpact: { score: metricsScore, max: 25, notes: `${bulletsWithMetrics} metrics/numbers found` },
        atsFormattingSafety: { score: formatScore, max: 15, notes: redFlags.length === 0 ? 'Clean format' : `${redFlags.length} warnings` },
      },
      metrics: {
        totalBulletPoints: effectiveBullets.length,
        bulletsWithMetrics,
        bulletsWithMetricsPercent: effectiveBullets.length > 0 ? Math.round((bulletsWithMetrics / effectiveBullets.length) * 100) : 0,
        strongActionVerbsCount: strongVerbsCount,
        weakVerbsCount: weakVerbsFound.length,
        estimatedWordCount: words.length,
      },
      weakVerbsFound,
      redFlags,
      strengths,
      actionableRecommendations,
    };
  }
}
