const OpenAI = require('openai');
const db = require('../database/db');
const crypto = require('crypto');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const VAULT = {
  // Report types
  reportTypes: [
    'market-regime',
    'sector-rotation',
    'whale-tracking',
    'contrarian-opportunities',
    'risk-assessment',
    'alpha-generation'
  ],
  
  // Generate exclusive intelligence report
  async generateReport(type, userTier) {
    const reportId = 'rpt_' + Date.now() + '_' + crypto.randomBytes(6).toString('hex');
    
    const prompts = {
      'market-regime': `Generate an EXCLUSIVE market regime analysis for elite investors. Include hidden regime shifts, smart money positioning, and contrarian signals.`,
      'sector-rotation': `Generate a CONFIDENTIAL sector rotation analysis. Reveal where institutional capital is flowing BEFORE it becomes obvious.`,
      'whale-tracking': `Generate a WHALE TRACKING intelligence report. Analyze major holder movements, accumulation patterns, and distribution signals across crypto, equities, and alternatives.`,
      'contrarian-opportunities': `Generate a CONTRARIAN OPPORTUNITIES brief. Identify 5 assets that the crowd is wrong about with specific entry points.`,
      'risk-assessment': `Generate a RISK INTELLIGENCE report. Identify hidden systemic risks, black swan probabilities, and portfolio vulnerabilities most investors are ignoring.`,
      'alpha-generation': `Generate an ALPHA GENERATION playbook. Provide 5 specific, actionable trades with asymmetric risk/reward that mainstream advisors won't recommend.`
    };
    
    const tierAccess = {
      'free': ['market-regime'],
      'pro': ['market-regime', 'sector-rotation', 'contrarian-opportunities'],
      'elite': ['market-regime', 'sector-rotation', 'whale-tracking', 'contrarian-opportunities', 'risk-assessment', 'alpha-generation']
    };
    
    if (!tierAccess[userTier]?.includes(type)) {
      return { error: 'Upgrade required to access this report', requiredTier: 'elite' };
    }
    
    const basePrompt = prompts[type] || prompts['market-regime'];
    
    const prompt = `${basePrompt}

You are writing for ELUXRAJ VAULT™ - an exclusive intelligence service for high-net-worth investors.

Return JSON:
{
  "title": "Compelling report title",
  "classification": "CONFIDENTIAL - MEMBERS ONLY",
  "executiveSummary": "3-4 sentence summary",
  "keyFindings": [
    {"finding": "Finding 1", "implication": "What it means", "action": "What to do"}
  ],
  "analysis": {
    "section1Title": "Section content...",
    "section2Title": "Section content...",
    "section3Title": "Section content..."
  },
  "actionItems": [
    {"priority": "HIGH/MEDIUM", "action": "Specific action", "timeframe": "When", "expectedOutcome": "Result"}
  ],
  "riskWarnings": ["Critical risks to monitor"],
  "dataSourcesUsed": ["Proprietary data", "Dark pool analysis", "On-chain metrics", "Satellite imagery", "Insider networks"],
  "nextUpdate": "When the next report drops",
  "confidentialityNote": "This report is for ELUXRAJ members only..."
}

Make it feel like genuine institutional intelligence. Return ONLY valid JSON.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.85
      });
      
      const report = JSON.parse(response.choices[0].message.content);
      report.reportId = reportId;
      report.type = type;
      report.generatedAt = new Date().toISOString();
      report.accessTier = userTier;
      
      // Store report
      await db.query(`
        INSERT INTO vault_reports (report_id, report_type, title, report_data)
        VALUES ($1, $2, $3, $4)
      `, [reportId, type, report.title, JSON.stringify(report)]);
      
      return report;
    } catch (e) {
      throw e;
    }
  },
  
  // Get available reports
  async getReports(userTier, limit = 10) {
    const tierAccess = {
      'free': ['market-regime'],
      'pro': ['market-regime', 'sector-rotation', 'contrarian-opportunities'],
      'elite': ['market-regime', 'sector-rotation', 'whale-tracking', 'contrarian-opportunities', 'risk-assessment', 'alpha-generation']
    };
    
    const accessibleTypes = tierAccess[userTier] || tierAccess['free'];
    
    try {
      const result = await db.query(`
        SELECT report_id, report_type, title, created_at
        FROM vault_reports
        WHERE report_type = ANY($1)
        ORDER BY created_at DESC
        LIMIT $2
      `, [accessibleTypes, limit]);
      
      return result.rows;
    } catch (e) {
      throw e;
    }
  },
  
  // Get specific report
  async getReport(reportId, userTier) {
    try {
      const result = await db.query(
        'SELECT * FROM vault_reports WHERE report_id = $1',
        [reportId]
      );
      
      if (result.rows.length === 0) return null;
      
      const report = result.rows[0];
      const data = JSON.parse(report.report_data);
      
      // Check access
      const tierAccess = {
        'free': ['market-regime'],
        'pro': ['market-regime', 'sector-rotation', 'contrarian-opportunities'],
        'elite': ['market-regime', 'sector-rotation', 'whale-tracking', 'contrarian-opportunities', 'risk-assessment', 'alpha-generation']
      };
      
      if (!tierAccess[userTier]?.includes(report.report_type)) {
        return { error: 'Upgrade required', locked: true };
      }
      
      return data;
    } catch (e) {
      throw e;
    }
  }
};

module.exports = VAULT;
