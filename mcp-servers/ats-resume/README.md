# ATS Resume Maker & AI Reviewer MCP Server 📄🤖

An AI-powered **Model Context Protocol (MCP)** server for creating applicant tracking system (ATS) compliant resumes, auditing resumes against industry-standard ATS rubrics, calculating Job Description match percentages, and optimizing bullet points using the STAR methodology.

Designed as a high-value, ready-to-launch **Micro-SaaS MCP service**.

---

## 🚀 Features & Tools

### 1. `generate_ats_resume`
Transforms structured candidate profiles into clean, ATS-compliant formats:
- **Strict 1-Column Markdown** (optimized for automated parsing without table breaks)
- **Plain Text (ASCII)** (standardized spacing and indentation)
- **Semantic HTML** (clean styling ready for printing to PDF)
- **JSONResume** (standard industry JSON schema)
- Optional `outputDirectory` flag to automatically save files to disk.

### 2. `review_ats_resume`
Audits structured resumes or raw pasted text with a comprehensive 100-point rubric:
- **Contact Completeness (15 pts)**: Name, professional email, phone number, and LinkedIn/GitHub presence.
- **Section Completeness (20 pts)**: Summary/Objective, Experience, Education, and Skills presence.
- **Action Verbs Strength (25 pts)**: Flags weak passive verbs (*"assisted with", "worked on", "responsible for"*) and verifies high-impact power verbs (*"spearheaded", "architected", "optimized"*).
- **Quantifiable Impact (25 pts)**: Detects numbers, percentages, dollar values, and metrics (*"reduced latency by 45%", "$2.5M in transactions"*).
- **ATS Formatting Safety (15 pts)**: Penalizes parsing traps like emojis, tables, weird special bullet symbols, and extreme word counts.
- **Returns**: Overall Score (0-100), Letter Grade (A+, A, B, C, Needs Improvement), Strengths, Red Flags, and Targeted Recommendations.

### 3. `match_job_description`
Compares a candidate's resume against a target job posting:
- **Match Score %**
- **Matched Skills**: Highlights overlapping technical competencies.
- **Missing Critical Keywords**: Pinpoints missing skills, tools, and platforms required by the employer.
- **Strategic Advice**: Suggests how to tailor summary and bullets to beat automated filtering.

### 4. `optimize_bullet_point`
Rewrites draft bullet points into 3 high-impact STAR-method alternatives:
- **Impact-First**: Leads with quantifiable business outcome.
- **Architecture/Technical**: Highlights technical depth and system reliability.
- **Leadership/Execution**: Emphasizes ownership, cross-functional coordination, and delivery speed.

---

## 🛠️ Installation & Setup

```bash
cd projects/ats-resume-mcp
npm install
npm run build
```

Run test suite:
```bash
node --experimental-strip-types test/demo-test.ts
```

---

## 🔌 MCP Client Configuration

### Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "ats-resume": {
      "command": "node",
      "args": ["/app/projects/ats-resume-mcp/dist/index.js"]
    }
  }
}
```

### Cursor (`.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "ats-resume": {
      "command": "node",
      "args": ["/app/projects/ats-resume-mcp/dist/index.js"]
    }
  }
}
```

---

## 💡 Micro-SaaS Monetization Ideas
1. **Pay-per-Review / Subscription**: $12/month for unlimited resume audits, job tailoring, and PDF downloads.
2. **Job Application Copilot**: Plug this MCP into AI assistants (Claude, Cursor, ChatGPT) so job seekers can tailor their resume for every job application with 1 click.
3. **B2B Career Coaching / Bootcamp Tool**: Sell API licenses to coding bootcamps and university career centers.
