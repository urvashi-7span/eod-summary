const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const chalk = require("chalk");

class AIProcessor {
  constructor(config) {
    this.config = config;
    this.provider = config.aiProvider || "gemini";

    if (this.provider === "template") {
      // No external setup required for template provider
      this.model = null;
    } else if (this.provider === "gemini") {
      if (!config.geminiApiKey) {
        throw new Error("Google Gemini API key is required");
      }
      this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
      this.model = this.genAI.getGenerativeModel({
        model: config.geminiModel || "gemini-2.0-flash-lite",
      });
    } else if (this.provider === "ollama") {
      this.ollamaUrl = config.ollamaUrl || "http://localhost:11434";
      this.ollamaModel = config.ollamaModel || "codellama:7b";
    }
  }

  async generateSummary(commits, summaryType, date) {
    try {
      const prompt = this.buildPrompt(commits, summaryType, date);
      let summary;

      if (this.provider === "template") {
        return this.generateFallbackSummary(commits, summaryType, date);
      } else if (this.provider === "ollama") {
        summary = await this.generateWithOllama(prompt);
      } else if (this.provider === "gemini") {
        summary = await this.generateWithGemini(prompt);
      } else {
        throw new Error(`Unsupported AI provider: ${this.provider}`);
      }

      return {
        type: summaryType,
        date: date,
        content: summary,
        provider: this.provider,
        metadata: {
          commitsAnalyzed: commits.length,
          totalFiles: this.getTotalFiles(commits),
          totalInsertions: this.getTotalInsertions(commits),
          totalDeletions: this.getTotalDeletions(commits),
          aiProvider: this.provider,
          model: this.provider === "ollama" ? this.ollamaModel : this.config.geminiModel || "gemini-2.0-flash-lite",
        },
      };
    } catch (error) {
      console.error(chalk.red("AI Processing Error:"), error.message);
      console.log(chalk.yellow("Falling back to template-based summary..."));
      return this.generateFallbackSummary(commits, summaryType, date);
    }
  }

  async generateWithGemini(prompt) {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      if (error.message.includes("quota")) {
        throw new Error(
          "Google Gemini quota exceeded. Try again later or switch to Ollama for unlimited usage."
        );
      } else if (error.message.includes("API_KEY")) {
        throw new Error(
          "Invalid Google Gemini API key. Run: eod-summary setup"
        );
      }
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  async generateWithOllama(prompt) {
    try {
      const response = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: this.ollamaModel,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.3,
            top_p: 0.9,
            max_tokens: 1000,
          },
        },
        {
          timeout: 60000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.response) {
        return response.data.response.trim();
      } else {
        throw new Error("Invalid response from Ollama");
      }
    } catch (error) {
      if (error.code === "ECONNREFUSED") {
        throw new Error(
          `Ollama is not running. Start it with: ollama serve\nOr install it from: https://ollama.ai`
        );
      } else if (error.response && error.response.status === 404) {
        throw new Error(
          `Model '${this.ollamaModel}' not found. Install it with: ollama pull ${this.ollamaModel}`
        );
      }
      throw new Error(`Ollama error: ${error.message}`);
    }
  }

  static async testOllamaConnection(
    url = "http://localhost:11434",
    model = "codellama:7b"
  ) {
    try {
      const response = await axios.get(`${url}/api/tags`, { timeout: 5000 });
      const models = response.data.models || [];
      const hasModel = models.some((m) => m.name.includes(model.split(":")[0]));

      return {
        available: true,
        hasModel: hasModel,
        models: models.map((m) => m.name),
        url: url,
      };
    } catch (error) {
      return {
        available: false,
        error: error.message,
        url: url,
      };
    }
  }

  static async testGeminiConnection(apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

      const result = await model.generateContent(
        'Hello, respond with just "OK"'
      );
      const response = await result.response;

      return {
        available: true,
        response: response.text(),
        apiKey: `${apiKey.substring(0, 8)}...`,
      };
    } catch (error) {
      return {
        available: false,
        error: error.message,
        apiKey: `${apiKey.substring(0, 8)}...`,
      };
    }
  }

  buildPrompt(commits, summaryType, date) {
    const commitsData = this.formatCommitsForPrompt(commits);

    const baseContext = `
Date: ${date}
Number of commits: ${commits.length}
Total files changed: ${this.getTotalFiles(commits)}
Total lines added: ${this.getTotalInsertions(commits)}
Total lines removed: ${this.getTotalDeletions(commits)}

COMMITS DATA:
${commitsData}
`;

    switch (summaryType) {
      case "quick":
        return this.getQuickPrompt(baseContext);
      case "detailed":
        return this.getDetailedPrompt(baseContext);
      case "bullets":
        return this.getBulletsPrompt(baseContext);
      case "eod":
        return this.getEodPrompt(baseContext);
      default:
        return this.getQuickPrompt(baseContext);
    }
  }

  getQuickPrompt(context) {
    return `You are a professional software developer creating an end-of-day summary. Analyze the following Git commit data and create a brief, professional summary.

${context}

Create a concise summary with:
- **Key Work**: 2-3 main accomplishments (be specific about what was implemented/fixed)
- **Files**: List of most important modified files
- **Stats**: Basic commit and file statistics

Keep it under 100 words. Use bullet points. Be specific about technical achievements.
Focus on business value and concrete deliverables. Use professional language.

Format as markdown.`;
  }

  getDetailedPrompt(context) {
    return `You are a senior software developer creating a comprehensive end-of-day report for stakeholders. Analyze the following Git commit data and create a detailed professional summary.

${context}

Generate a detailed yet concise professional summary using the following structure:

1. **Executive Summary**: A brief 2-sentence overview of the day's main objectives and progress.
2. **Key Accomplishments**: Concise bullet points describing major features, fixes, or improvements, each with a clear statement of business or technical value.
3. **Technical Highlights**: Summarize important technical changes such as major code updates, refactoring, or new technology adoption, focusing on crucial details.
4. **Files Modified**: Group related files together and provide a one-line explanation for each group or important file.
5. **Impact Assessment**: Summarize performance, security, or user experience improvements in 1-2 short bullets.
6. **Statistics**: Display commit count, files changed, and lines added/removed in a tight, clear format.

Be succinct—avoid unnecessary elaboration, but do include essential technical and business-relevant details.
Use professional language and relevant technical terms.
Format the output as markdown with headers and bullet points for easy readability.`;
  }

  getBulletsPrompt(context) {
    return `You are a software developer creating a clean, concise end-of-day summary. Analyze the following Git commit data and create bullet points.

${context}

Format as exactly 4-6 bullet points:
• [Main feature/fix accomplished with specific technical details]
• [Secondary important task completed with impact]
• [Technical improvement or bug fix with context]
• [Files touched: filename.ext (specific purpose)]
• [Stats: X commits | Y files | +A/-B lines]

Be concise but specific. Each bullet should be one clear technical accomplishment.
Focus on the most impactful and meaningful work completed.
Use technical terminology appropriately.

Format as clean bullet points only.`;
  }

  getEodPrompt(context) {
    return `You are a professional developer writing an EOD (End of Day) update for stakeholders.

${context}

Write in this structure:
**EOD Update**

- 3-5 top-line bullets summarizing concrete work done. Use bold for key entities.
- Include a nested sub-list under a bullet when elaboration is helpful (2-3 sub-bullets).
- Prefer action verbs: Enhanced, Refactored, Updated, Fixed, Implemented.
- Keep it concise and business-relevant; avoid generic phrasing.

Output strictly as markdown bullets only (no extra headers besides the bold title).`;
  }

  summarizeMessage(message) {
    if (!message) {
      return "No message";
    }
    const cleaned = message
      .replace(
        /^(feat|fix|chore|docs|refactor|style|test|perf)(\([^)]*\))?:\s*/i,
        ""
      )
      .trim();
    return cleaned.length > 120 ? cleaned.slice(0, 117) + "..." : cleaned;
  }

  formatCommitsForPrompt(commits) {
    return commits
      .map((commit, index) => {
        const files = commit.files
          .map((f) => `${f.name} (+${f.insertions}/-${f.deletions})`)
          .join(", ");
        return `
${index + 1}. Commit: ${commit.hash}
   Message: ${commit.message}
   Files: ${files || "No file details"}
   Changes: ${commit.summary}
`;
      })
      .join("\n");
  }

  getTotalFiles(commits) {
    const allFiles = new Set();
    commits.forEach((commit) => {
      commit.files.forEach((file) => allFiles.add(file.name));
    });
    return allFiles.size;
  }

  getTotalInsertions(commits) {
    return commits.reduce(
      (total, commit) => total + (commit.insertions || 0),
      0
    );
  }

  getTotalDeletions(commits) {
    return commits.reduce(
      (total, commit) => total + (commit.deletions || 0),
      0
    );
  }

  generateFallbackSummary(commits, summaryType, date) {
    const totalFiles = new Set();
    let totalInsertions = 0;
    let totalDeletions = 0;

    commits.forEach((commit) => {
      commit.files.forEach((file) => totalFiles.add(file.name));
      totalInsertions += commit.insertions || 0;
      totalDeletions += commit.deletions || 0;
    });

    const mainFiles = Array.from(totalFiles).slice(0, 5).join(", ");
    const commitMessages = commits
      .slice(0, 3)
      .map((c) => `• ${c.message}`)
      .join("\n");

    let content;
    switch (summaryType) {
      case "detailed":
        content = `
## Key Accomplishments
${commitMessages}

## Files Modified
${mainFiles}${totalFiles.size > 5 ? ` and ${totalFiles.size - 5} more` : ""}

## Statistics
- **Commits**: ${commits.length}
- **Files Changed**: ${totalFiles.size}
- **Lines Added**: +${totalInsertions}
- **Lines Removed**: -${totalDeletions}

*Note: This is a template-based summary. Configure AI for more detailed analysis.*`;
        break;

      case "bullets":
        content = `• Completed ${commits.length} commits with various improvements
• Modified files: ${mainFiles}
• Statistics: ${commits.length} commits | ${totalFiles.size} files | +${totalInsertions}/-${totalDeletions} lines`;
        break;

      case "eod":
        // EOD-style template with clean bullets from actual commits
        // Generate concise highlights (top 5 commits, business-focused)
        const highlights = commits
          .slice(0, 5)
          .map((c) => `- ${this.summarizeMessage(c.message)}`)
          .join("\n");

        // Include commit IDs with full details for debugging/traceability
        const commitIdLines = commits
          .map((c) => `- ${c.hash} — ${this.summarizeMessage(c.message)}`)
          .join("\n");

        content = `**EOD Update**\n\n${highlights}\n\n---\n\n### Commits\n${commitIdLines}`;
        break;

      default:
        // Enhanced quick summary with commit-level details
        const commitLines = commits
          .map((c, i) => {
            const mainFiles = (c.files || [])
              .slice(0, 3)
              .map((f) => f.name)
              .join(", ");
            return `- ${i + 1}. ${this.summarizeMessage(c.message)}${
              mainFiles ? `\n  Files: ${mainFiles}` : ""
            }\n  Commit: ${c.hash}\n  Changes: ${c.summary}`;
          })
          .join("\n");

        content = `**Key Work**: ${commits.length} commit${
          commits.length !== 1 ? "s" : ""
        } completed\n**Files**: ${mainFiles}\n**Stats**: ${
          commits.length
        } commits, ${
          totalFiles.size
        } files, +${totalInsertions}/-${totalDeletions} lines\n\n---\n\n### Commits\n${commitLines}`;
    }

    return {
      type: summaryType,
      date: date,
      content: content,
      provider: "template",
      metadata: {
        commitsAnalyzed: commits.length,
        totalFiles: totalFiles.size,
        totalInsertions: totalInsertions,
        totalDeletions: totalDeletions,
        aiProvider: "template",
        model: "fallback",
      },
    };
  }
}

module.exports = { AIProcessor };
