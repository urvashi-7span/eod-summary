const fs = require("fs-extra");
const path = require("path");

class OutputGenerator {
  formatOutput(summary, format) {
    switch (format.toLowerCase()) {
      case "json":
        return JSON.stringify(summary, null, 2);
      case "plain":
        return typeof summary === "string" ? summary : summary.content || "";
      case "markdown":
      default:
        return typeof summary === "string"
          ? summary
          : this.formatAsMarkdown(summary);
    }
  }

  formatAsMarkdown(summary) {
    const { content, metadata, date, type } = summary;

    let output = `# EOD Summary - ${this.formatDate(date)}\n\n`;

    if (content) {
      output += content + "\n\n";
    }

    if (metadata) {
      output += "---\n\n";
      output += "## 📊 Statistics\n\n";
      output += `- **Summary Type**: ${type}\n`;
      output += `- **Commits Analyzed**: ${metadata.commitsAnalyzed}\n`;
      output += `- **Files Changed**: ${metadata.totalFiles}\n`;
      output += `- **Lines Added**: +${metadata.totalInsertions}\n`;
      output += `- **Lines Removed**: -${metadata.totalDeletions}\n`;
      output += `- **AI Provider**: ${metadata.aiProvider}\n`;
      output += `- **Generated**: ${new Date().toLocaleString()}\n`;
    }

    return output;
  }

  async saveToFile(content, filePath) {
    try {
      const dir = path.dirname(filePath);
      await fs.ensureDir(dir);
      await fs.writeFile(filePath, content, "utf8");

      return {
        success: true,
        path: filePath,
        size: content.length,
      };
    } catch (error) {
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }

  generateTemplateBasedSummary(commits, summaryType) {
    const stats = this.calculateStats(commits);
    const date = new Date().toISOString().split("T")[0];

    const topCommits = commits.slice(0, 3);
    const topFiles = Array.from(stats.fileNames).slice(0, 5);

    let content;
    switch (summaryType) {
      case "detailed":
        content = `## Key Accomplishments
${topCommits.map((c) => `• ${c.message}`).join("\n")}

## Files Modified
${topFiles.join(", ")}${
          stats.totalFiles > 5 ? ` (and ${stats.totalFiles - 5} more)` : ""
        }`;
        break;

      case "bullets":
        content = `${topCommits.map((c) => `• ${c.message}`).join("\n")}
- Files modified: ${topFiles.join(", ")}
- Statistics: ${commits.length} commits | ${stats.totalFiles} files | +${
          stats.totalInsertions
        }/-${stats.totalDeletions} lines`;
        break;

      default:
        // ✅ UPDATED: Custom EOD format
        const formattedDate = this.formatDateForEOD(date);

        content = `EOD Update:\nDate: ${formattedDate}\n\n`;

        // Process each commit
        commits.forEach((commit, index) => {
          const itemNumber = index + 1;
          const commitType = this.getCommitType(commit.message);
          const cleanMessage = this.cleanCommitMessage(commit.message);

          content += `${itemNumber}. ${commitType}: ${cleanMessage}\n`;

          // Add PR placeholder for features
          if (commitType === "Feature") {
            content += `   PR: [Add PR link here]\n`;
          }

          // Add commit hash
          content += `   Commit: ${commit.hash}\n`;

          // Add main files (limit to 2-3 most important)
          if (commit.files && commit.files.length > 0) {
            const mainFiles = commit.files
              .slice(0, 3)
              .map((f) => f.name)
              .join(", ");
            content += `   Files: ${mainFiles}\n`;
          }

          content += "\n";
        });
        break;
    }

    return {
      type: summaryType,
      date: date,
      content: content,
      metadata: {
        commitsAnalyzed: commits.length,
        totalFiles: stats.totalFiles,
        totalInsertions: stats.totalInsertions,
        totalDeletions: stats.totalDeletions,
        aiProvider: "template",
        model: "fallback",
      },
    };
  }

  calculateStats(commits) {
    const fileNames = new Set();
    let totalInsertions = 0;
    let totalDeletions = 0;

    commits.forEach((commit) => {
      commit.files.forEach((file) => fileNames.add(file.name));
      totalInsertions += commit.insertions || 0;
      totalDeletions += commit.deletions || 0;
    });

    return {
      fileNames,
      totalFiles: fileNames.size,
      totalInsertions,
      totalDeletions,
    };
  }

  formatDate(date) {
    if (typeof date === "string") {
      return new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // ✅ NEW: Helper methods for EOD format
  getCommitType(message) {
    const msg = message.toLowerCase();

    if (
      msg.includes("feat") ||
      msg.includes("feature") ||
      msg.includes("add") ||
      msg.includes("implement") ||
      msg.includes("new")
    ) {
      return "Feature";
    } else if (
      msg.includes("fix") ||
      msg.includes("bug") ||
      msg.includes("resolve") ||
      msg.includes("patch")
    ) {
      return "Issue fix";
    } else if (
      msg.includes("api") ||
      msg.includes("endpoint") ||
      msg.includes("route") ||
      msg.includes("controller") ||
      msg.includes("service")
    ) {
      return "API implemented";
    } else {
      return "Update";
    }
  }

  cleanCommitMessage(message) {
    // Remove common prefixes and clean up
    return message
      .replace(/^(feat|fix|add|implement|update|refactor):\s*/i, "")
      .replace(/^(feature|bugfix)\/.*?:\s*/i, "")
      .trim();
  }

  formatDateForEOD(date) {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
}

module.exports = { OutputGenerator };
