import fs from 'node:fs/promises';
import path from 'node:path';
export class ResumeGenerator {
    /**
     * Generate strict ATS-compatible Markdown
     * Follows 1-column layout, standard heading levels, and standard bullet characters
     */
    static generateMarkdown(resume) {
        const lines = [];
        // Header / Contact Info
        lines.push(`# ${resume.contact.fullName}`);
        if (resume.contact.professionalTitle) {
            lines.push(`**${resume.contact.professionalTitle}**`);
        }
        const contactParts = [];
        if (resume.contact.location)
            contactParts.push(resume.contact.location);
        if (resume.contact.phone)
            contactParts.push(resume.contact.phone);
        if (resume.contact.email)
            contactParts.push(resume.contact.email);
        if (resume.contact.linkedin)
            contactParts.push(resume.contact.linkedin);
        if (resume.contact.github)
            contactParts.push(resume.contact.github);
        if (resume.contact.portfolio)
            contactParts.push(resume.contact.portfolio);
        if (contactParts.length > 0) {
            lines.push(contactParts.join(' | '));
        }
        lines.push('');
        // Professional Summary
        if (resume.summary && resume.summary.trim().length > 0) {
            lines.push('## Professional Summary');
            lines.push(resume.summary.trim());
            lines.push('');
        }
        // Technical Skills
        const skillCategories = Object.entries(resume.skills || {}).filter(([_, items]) => Array.isArray(items) && items.length > 0);
        if (skillCategories.length > 0) {
            lines.push('## Technical Skills');
            for (const [category, items] of skillCategories) {
                const title = category
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase());
                lines.push(`- **${title}:** ${items.join(', ')}`);
            }
            lines.push('');
        }
        // Work Experience
        if (resume.experience && resume.experience.length > 0) {
            lines.push('## Professional Experience');
            for (const exp of resume.experience) {
                const dateRange = `${exp.startDate} – ${exp.isCurrent ? 'Present' : exp.endDate}`;
                const locationPart = exp.location ? ` | ${exp.location}` : '';
                lines.push(`### ${exp.role} – ${exp.company}${locationPart}`);
                lines.push(`*${dateRange}*`);
                lines.push('');
                for (const highlight of exp.highlights) {
                    lines.push(`- ${highlight.trim()}`);
                }
                lines.push('');
            }
        }
        // Projects
        if (resume.projects && resume.projects.length > 0) {
            lines.push('## Key Projects');
            for (const proj of resume.projects) {
                const linkPart = proj.link ? ` [${proj.link}]` : '';
                const techPart = proj.technologies && proj.technologies.length > 0
                    ? ` (${proj.technologies.join(', ')})`
                    : '';
                lines.push(`### ${proj.name}${techPart}${linkPart}`);
                if (proj.description) {
                    lines.push(proj.description);
                }
                for (const highlight of proj.highlights) {
                    lines.push(`- ${highlight.trim()}`);
                }
                lines.push('');
            }
        }
        // Education
        if (resume.education && resume.education.length > 0) {
            lines.push('## Education');
            for (const edu of resume.education) {
                const gpaPart = edu.gpa ? ` | GPA: ${edu.gpa}` : '';
                const honorsPart = edu.honors ? ` | ${edu.honors}` : '';
                lines.push(`### ${edu.degree} – ${edu.institution}`);
                lines.push(`*Graduation: ${edu.graduationDate}${gpaPart}${honorsPart}*`);
                lines.push('');
            }
        }
        // Certifications
        if (resume.certifications && resume.certifications.length > 0) {
            lines.push('## Certifications & Licenses');
            for (const cert of resume.certifications) {
                const datePart = cert.date ? ` (${cert.date})` : '';
                const linkPart = cert.credentialUrl ? ` – ${cert.credentialUrl}` : '';
                lines.push(`- **${cert.name}** – ${cert.issuer}${datePart}${linkPart}`);
            }
            lines.push('');
        }
        return lines.join('\n').trim();
    }
    /**
     * Generate Plain Text ATS version
     */
    static generatePlainText(resume) {
        const lines = [];
        lines.push(resume.contact.fullName.toUpperCase());
        if (resume.contact.professionalTitle) {
            lines.push(resume.contact.professionalTitle);
        }
        const contactParts = [];
        if (resume.contact.location)
            contactParts.push(resume.contact.location);
        if (resume.contact.phone)
            contactParts.push(resume.contact.phone);
        if (resume.contact.email)
            contactParts.push(resume.contact.email);
        if (resume.contact.linkedin)
            contactParts.push(resume.contact.linkedin);
        if (resume.contact.github)
            contactParts.push(resume.contact.github);
        if (contactParts.length > 0) {
            lines.push(contactParts.join(' | '));
        }
        lines.push('--------------------------------------------------------------------------------');
        lines.push('');
        if (resume.summary) {
            lines.push('PROFESSIONAL SUMMARY');
            lines.push(resume.summary.trim());
            lines.push('');
        }
        const skillCategories = Object.entries(resume.skills || {}).filter(([_, items]) => Array.isArray(items) && items.length > 0);
        if (skillCategories.length > 0) {
            lines.push('TECHNICAL SKILLS');
            for (const [category, items] of skillCategories) {
                const title = category
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase());
                lines.push(`* ${title}: ${items.join(', ')}`);
            }
            lines.push('');
        }
        if (resume.experience && resume.experience.length > 0) {
            lines.push('PROFESSIONAL EXPERIENCE');
            for (const exp of resume.experience) {
                const dateRange = `${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}`;
                lines.push(`${exp.role.toUpperCase()} | ${exp.company} (${dateRange})`);
                if (exp.location)
                    lines.push(`Location: ${exp.location}`);
                for (const highlight of exp.highlights) {
                    lines.push(`  * ${highlight.trim()}`);
                }
                lines.push('');
            }
        }
        if (resume.projects && resume.projects.length > 0) {
            lines.push('KEY PROJECTS');
            for (const proj of resume.projects) {
                const techPart = proj.technologies?.length ? ` [${proj.technologies.join(', ')}]` : '';
                lines.push(`${proj.name}${techPart}`);
                if (proj.description)
                    lines.push(`  ${proj.description}`);
                for (const highlight of proj.highlights) {
                    lines.push(`  * ${highlight.trim()}`);
                }
                lines.push('');
            }
        }
        if (resume.education && resume.education.length > 0) {
            lines.push('EDUCATION');
            for (const edu of resume.education) {
                lines.push(`${edu.degree} | ${edu.institution}`);
                lines.push(`Graduation: ${edu.graduationDate}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`);
                lines.push('');
            }
        }
        if (resume.certifications && resume.certifications.length > 0) {
            lines.push('CERTIFICATIONS');
            for (const cert of resume.certifications) {
                lines.push(`* ${cert.name} - ${cert.issuer}${cert.date ? ` (${cert.date})` : ''}`);
            }
            lines.push('');
        }
        return lines.join('\n').trim();
    }
    /**
     * Generate clean semantic HTML with ATS-optimized styling
     */
    static generateHtml(resume) {
        const escape = (str) => (str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escape(resume.contact.fullName)} - ATS Resume</title>
  <style>
    @page {
      size: letter;
      margin: 0.6in;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.45;
      color: #111827;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      font-size: 22pt;
      margin: 0 0 4px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
    }
    .title {
      font-size: 12pt;
      font-weight: 600;
      color: #334155;
      margin-bottom: 6px;
    }
    .contact-bar {
      font-size: 9.5pt;
      color: #475569;
      margin-bottom: 16px;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 8px;
    }
    .section-title {
      font-size: 12pt;
      font-weight: 700;
      text-transform: uppercase;
      border-bottom: 1px solid #94a3b8;
      padding-bottom: 2px;
      margin-top: 14px;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
      color: #0f172a;
    }
    .job-entry, .edu-entry, .proj-entry {
      margin-bottom: 12px;
    }
    .entry-header {
      display: flex;
      justify-content: space-between;
      font-weight: 600;
      font-size: 11pt;
    }
    .entry-sub {
      display: flex;
      justify-content: space-between;
      font-style: italic;
      color: #334155;
      margin-bottom: 4px;
      font-size: 9.5pt;
    }
    ul {
      margin: 4px 0 8px 18px;
      padding: 0;
    }
    li {
      margin-bottom: 3px;
    }
    .skills-list p {
      margin: 3px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${escape(resume.contact.fullName)}</h1>
      ${resume.contact.professionalTitle ? `<div class="title">${escape(resume.contact.professionalTitle)}</div>` : ''}
      <div class="contact-bar">
        ${[
            resume.contact.location,
            resume.contact.phone,
            resume.contact.email,
            resume.contact.linkedin,
            resume.contact.github,
        ]
            .filter(Boolean)
            .map((item) => escape(item))
            .join(' &bull; ')}
      </div>
    </header>

    ${resume.summary
            ? `<section>
      <div class="section-title">Professional Summary</div>
      <p style="margin: 4px 0 10px 0;">${escape(resume.summary)}</p>
    </section>`
            : ''}

    <section>
      <div class="section-title">Technical Skills</div>
      <div class="skills-list">
        ${Object.entries(resume.skills || {})
            .filter(([_, items]) => items && items.length > 0)
            .map(([cat, items]) => `<p><strong>${escape(cat.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()))}:</strong> ${escape(items.join(', '))}</p>`)
            .join('\n')}
      </div>
    </section>

    ${resume.experience?.length
            ? `<section>
      <div class="section-title">Professional Experience</div>
      ${resume.experience
                .map((exp) => `
        <div class="job-entry">
          <div class="entry-header">
            <span>${escape(exp.role)} &ndash; ${escape(exp.company)}</span>
            <span>${escape(exp.location || '')}</span>
          </div>
          <div class="entry-sub">
            <span>${escape(exp.startDate)} &ndash; ${escape(exp.isCurrent ? 'Present' : exp.endDate)}</span>
          </div>
          <ul>
            ${exp.highlights.map((h) => `<li>${escape(h)}</li>`).join('\n')}
          </ul>
        </div>
      `)
                .join('')}
    </section>`
            : ''}

    ${resume.projects?.length
            ? `<section>
      <div class="section-title">Key Projects</div>
      ${resume.projects
                .map((proj) => `
        <div class="proj-entry">
          <div class="entry-header">
            <span>${escape(proj.name)} ${proj.technologies?.length ? `(${escape(proj.technologies.join(', '))})` : ''}</span>
          </div>
          ${proj.description ? `<p style="margin: 2px 0;">${escape(proj.description)}</p>` : ''}
          <ul>
            ${proj.highlights.map((h) => `<li>${escape(h)}</li>`).join('\n')}
          </ul>
        </div>
      `)
                .join('')}
    </section>`
            : ''}

    ${resume.education?.length
            ? `<section>
      <div class="section-title">Education</div>
      ${resume.education
                .map((edu) => `
        <div class="edu-entry">
          <div class="entry-header">
            <span>${escape(edu.degree)} &ndash; ${escape(edu.institution)}</span>
            <span>${escape(edu.graduationDate)}</span>
          </div>
          ${edu.gpa || edu.honors
                ? `<div class="entry-sub"><span>${[
                    edu.gpa ? `GPA: ${escape(edu.gpa)}` : '',
                    edu.honors ? escape(edu.honors) : '',
                ]
                    .filter(Boolean)
                    .join(' | ')}</span></div>`
                : ''}
        </div>
      `)
                .join('')}
    </section>`
            : ''}

    ${resume.certifications?.length
            ? `<section>
      <div class="section-title">Certifications</div>
      <ul>
        ${resume.certifications
                .map((c) => `<li><strong>${escape(c.name)}</strong> &ndash; ${escape(c.issuer)} ${c.date ? `(${escape(c.date)})` : ''}</li>`)
                .join('\n')}
      </ul>
    </section>`
            : ''}
  </div>
</body>
</html>`;
    }
    /**
     * Generate standard JSONResume format
     */
    static generateJson(resume) {
        return {
            basics: {
                name: resume.contact.fullName,
                label: resume.contact.professionalTitle || '',
                email: resume.contact.email,
                phone: resume.contact.phone || '',
                summary: resume.summary || '',
                location: {
                    city: resume.contact.location || '',
                },
                profiles: [
                    resume.contact.linkedin ? { network: 'LinkedIn', url: resume.contact.linkedin } : null,
                    resume.contact.github ? { network: 'GitHub', url: resume.contact.github } : null,
                    resume.contact.portfolio ? { network: 'Portfolio', url: resume.contact.portfolio } : null,
                ].filter(Boolean),
            },
            work: (resume.experience || []).map((exp) => ({
                name: exp.company,
                position: exp.role,
                startDate: exp.startDate,
                endDate: exp.isCurrent ? 'Present' : exp.endDate,
                summary: '',
                highlights: exp.highlights,
            })),
            education: (resume.education || []).map((edu) => ({
                institution: edu.institution,
                area: edu.degree,
                studyType: edu.degree,
                score: edu.gpa || '',
                endDate: edu.graduationDate,
            })),
            skills: Object.entries(resume.skills || {}).map(([name, keywords]) => ({
                name,
                keywords,
            })),
            projects: (resume.projects || []).map((p) => ({
                name: p.name,
                description: p.description || '',
                highlights: p.highlights,
                keywords: p.technologies || [],
                url: p.link || '',
            })),
            certificates: (resume.certifications || []).map((c) => ({
                name: c.name,
                issuer: c.issuer,
                date: c.date || '',
                url: c.credentialUrl || '',
            })),
        };
    }
    /**
     * Save generated resume files to disk
     */
    static async saveResumeFiles(resume, outputDirectory, baseName = 'resume') {
        const resolvedDir = path.resolve(outputDirectory);
        await fs.mkdir(resolvedDir, { recursive: true });
        const mdPath = path.join(resolvedDir, `${baseName}.md`);
        const txtPath = path.join(resolvedDir, `${baseName}.txt`);
        const htmlPath = path.join(resolvedDir, `${baseName}.html`);
        const jsonPath = path.join(resolvedDir, `${baseName}.json`);
        const mdContent = this.generateMarkdown(resume);
        const txtContent = this.generatePlainText(resume);
        const htmlContent = this.generateHtml(resume);
        const jsonContent = JSON.stringify(this.generateJson(resume), null, 2);
        await Promise.all([
            fs.writeFile(mdPath, mdContent, 'utf-8'),
            fs.writeFile(txtPath, txtContent, 'utf-8'),
            fs.writeFile(htmlPath, htmlContent, 'utf-8'),
            fs.writeFile(jsonPath, jsonContent, 'utf-8'),
        ]);
        return {
            success: true,
            directory: resolvedDir,
            files: {
                markdown: mdPath,
                plainText: txtPath,
                html: htmlPath,
                json: jsonPath,
            },
        };
    }
}
//# sourceMappingURL=resumeGenerator.js.map