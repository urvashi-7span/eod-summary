const fs = require("fs-extra");
const path = require("path");
const os = require("os");

class ConfigManager {
  static getConfigPath() {
    return path.join(os.homedir(), ".eod-summary", "config.json");
  }

  static getDefaultConfig() {
    return {
      aiProvider: "ollama",
      ollamaUrl: "http://localhost:11434",
      ollamaModel: "codellama:7b",
      geminiApiKey: null,
      geminiModel: 'gemini-2.0-flash-lite',
      defaultSummaryType: 'quick',
      defaultOutputFormat: 'markdown',
      includeStats: true,
      requestTimeout: 60000,
      maxRetries: 3,
      excludePatterns: [
        "node_modules/**",
        "*.lock",
        "dist/**",
        "build/**",
        ".git/**",
        "vendor/**",
        "*.min.js",
        "*.min.css",
      ],
      createdAt: new Date().toISOString(),
      version: "1.0.0",
    };
  }

  static loadConfig() {
    try {
      const configPath = this.getConfigPath();

      if (!fs.existsSync(configPath)) {
        const defaultConfig = this.getDefaultConfig();
        this.saveConfig(defaultConfig);
        return defaultConfig;
      }

      const configData = fs.readFileSync(configPath, "utf8");
      const config = JSON.parse(configData);

      return { ...this.getDefaultConfig(), ...config };
    } catch (error) {
      console.warn(
        "Warning: Could not load config, using defaults:",
        error.message
      );
      return this.getDefaultConfig();
    }
  }

  static saveConfig(config) {
    try {
      const configPath = this.getConfigPath();
      const configDir = path.dirname(configPath);

      fs.ensureDirSync(configDir);
      config.updatedAt = new Date().toISOString();
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      return true;
    } catch (error) {
      throw new Error(`Failed to save configuration: ${error.message}`);
    }
  }

  static updateConfig(updates) {
    const currentConfig = this.loadConfig();
    const newConfig = { ...currentConfig, ...updates };
    this.saveConfig(newConfig);
    return newConfig;
  }

  static getMaskedConfig() {
    const config = this.loadConfig();
    const masked = { ...config };

    if (masked.geminiApiKey) {
      masked.geminiApiKey = `${masked.geminiApiKey.substring(0, 8)}***`;
    }

    return masked;
  }
}

module.exports = { ConfigManager };
