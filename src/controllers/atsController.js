import { ResumeReviewer } from '../services/resumeReviewer.js';
import { JobMatcher } from '../services/jobMatcher.js';
import { BulletOptimizer } from '../services/bulletOptimizer.js';
import { ResumeGenerator } from '../services/resumeGenerator.js';

/**
 * 1. Audit / Score Resume
 */
export function reviewResume(req, res) {
  try {
    const { resume, text } = req.body;
    let result;

    if (text && typeof text === 'string' && text.trim().length > 0) {
      result = ResumeReviewer.reviewRawText(text);
    } else if (resume && typeof resume === 'object') {
      result = ResumeReviewer.reviewStructuredResume(resume);
    } else {
      return res.status(400).json({ error: 'Berikan payload "text" (string resume) atau "resume" (JSONResume object).' });
    }

    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Gagal mereview resume.' });
  }
}

/**
 * 2. Match with Job Description
 */
export function matchJobDescription(req, res) {
  try {
    const { resume, resumeText, jobDescription } = req.body;
    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ error: 'Job description tidak boleh kosong.' });
    }

    const target = resumeText || resume;
    if (!target) {
      return res.status(400).json({ error: 'Berikan resumeText atau resume data object.' });
    }

    const matchResult = JobMatcher.match(target, jobDescription);
    res.json({ success: true, result: matchResult });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Gagal membandingkan resume dengan Job Description.' });
  }
}

/**
 * 3. Optimize Bullet Point (STAR Method)
 */
export function optimizeBulletPoint(req, res) {
  try {
    const { bullet, draftBullet, targetRole, context, technologies } = req.body;
    const bulletText = draftBullet || bullet;
    if (!bulletText || !bulletText.trim()) {
      return res.status(400).json({ error: 'Teks bullet point tidak boleh kosong.' });
    }

    const techList = technologies || (context ? context.split(',').map(s => s.trim()).filter(Boolean) : []);
    const result = BulletOptimizer.optimize({
      draftBullet: bulletText,
      targetRole,
      technologies: techList
    });
    res.json({ success: true, result, variations: result.optimizedVariations });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Gagal mengoptimasi bullet point.' });
  }
}

/**
 * 4. Generate All Resume Formats
 */
export function generateResume(req, res) {
  try {
    const { resume } = req.body;
    if (!resume || typeof resume !== 'object' || !resume.basics) {
      return res.status(400).json({ error: 'Payload resume tidak valid. Minimal sertakan properti "basics".' });
    }

    const markdown = ResumeGenerator.generateMarkdown(resume);
    const plainText = ResumeGenerator.generatePlainText(resume);
    const html = ResumeGenerator.generateHtml(resume);
    const json = ResumeGenerator.generateJson(resume);

    res.json({
      success: true,
      formats: {
        markdown,
        plainText,
        html,
        json
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Gagal meng-generate resume format.' });
  }
}
